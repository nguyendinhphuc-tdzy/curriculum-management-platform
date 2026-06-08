import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Initialize Supabase if credentials exist
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log('Supabase client initialized successfully.');
} else {
  console.log('Supabase credentials missing. Running in local mock file-based mode.');
}

// -------------------------------------------------------------
// Database Seeding / Local Mock Data (Micro & Dialogue lessons)
// -------------------------------------------------------------
const defaultMockData = {
  languages: [
    { id: 'zh', name: 'Chinese' },
    { id: 'ja', name: 'Japanese' }
  ],
  native_languages: [
    { id: 'en', name: 'English' },
    { id: 'vi', name: 'Vietnamese' }
  ],
  levels: [
    { id: 'level-1-zh', language_id: 'zh', level_number: 1 },
    { id: 'level-1-ja', language_id: 'ja', level_number: 1 }
  ],
  lessons: [
    // Chinese Lessons (zh) - Hybrid (Lesson 1 is Micro, Lesson 2 is Dialogue/Non-Micro)
    {
      id: 'CN_L101_MICRO',
      level_id: 'level-1-zh',
      code: 'CN_L101_MICRO',
      lesson_number: 1,
      title: 'Greetings (Micro)',
      goal: 'Learn basic hello and welcome in Chinese tutor style',
      max_duration_seconds: 210,
      version: '2026.06.08.1',
      content_version: '2026.06.08',
      type: 'micro'
    },
    {
      id: 'CN_L102',
      level_id: 'level-1-zh',
      code: 'CN_L102',
      lesson_number: 2,
      title: 'Asking about Jobs (Dialogue)',
      goal: 'Ask if someone is a teacher or driver in a real conversation',
      max_duration_seconds: 210,
      version: '2026.06.08.1',
      content_version: '2026.06.08',
      type: 'dialogue'
    },
    // Japanese Lessons (ja) - Pure Micro structures
    {
      id: 'JP_L101_MICRO',
      level_id: 'level-1-ja',
      code: 'JP_L101_MICRO',
      lesson_number: 1,
      title: 'First Encounters (Micro)',
      goal: 'Introduce yourself and greet people in Japanese tutor style',
      max_duration_seconds: 210,
      version: '2026.06.08.1',
      content_version: '2026.06.08',
      type: 'micro'
    }
  ],
  vocabularies: [
    // CN_L101_MICRO
    {
      id: 'CN_L101_MICRO_V01',
      lesson_id: 'CN_L101_MICRO',
      character: '你好',
      reading_or_pronunciation: 'nǐ hǎo',
      romanization: 'ni hao',
      english: 'Hello',
      audio_file: 'segment_002.m4a'
    },
    {
      id: 'CN_L101_MICRO_V02',
      lesson_id: 'CN_L101_MICRO',
      character: '学生',
      reading_or_pronunciation: 'xuéshēng',
      romanization: 'xuesheng',
      english: 'Student',
      audio_file: 'segment_004.m4a'
    },
    // CN_L102
    {
      id: 'CN_L102_V01',
      lesson_id: 'CN_L102',
      character: '老师',
      reading_or_pronunciation: 'lǎoshī',
      romanization: 'laoshi',
      english: 'Teacher',
      audio_file: 'vocab_001.m4a'
    },
    {
      id: 'CN_L102_V02',
      lesson_id: 'CN_L102',
      character: '司机',
      reading_or_pronunciation: 'sījī',
      romanization: 'siji',
      english: 'Driver',
      audio_file: 'vocab_002.m4a'
    },
    // JP_L101_MICRO
    {
      id: 'JP_L101_MICRO_V01',
      lesson_id: 'JP_L101_MICRO',
      character: 'こんにちは',
      reading_or_pronunciation: 'Konnichiwa',
      romanization: 'konnichiwa',
      english: 'Hello / Good afternoon',
      audio_file: 'segment_002.m4a'
    }
  ],
  sentences: [
    // CN_L101_MICRO
    {
      id: 'CN_L101_MICRO_S01',
      lesson_id: 'CN_L101_MICRO',
      content: '你好吗？',
      reading_or_pronunciation: 'nǐ hǎo ma?',
      romanization: 'ni hao ma?',
      english: 'How are you?',
      audio_file: 'segment_003.m4a'
    },
    // CN_L102
    {
      id: 'CN_L102_S01',
      lesson_id: 'CN_L102',
      content: '她是老师吗？',
      reading_or_pronunciation: 'Tā shì lǎoshī ma?',
      romanization: 'ta shi laoshi ma?',
      english: 'Is she a teacher?',
      audio_file: 'sentence_001.m4a'
    },
    // JP_L101_MICRO
    {
      id: 'JP_L101_MICRO_S01',
      lesson_id: 'JP_L101_MICRO',
      content: 'お元気ですか？',
      reading_or_pronunciation: 'O-genki desu ka?',
      romanization: 'o-genki desu ka?',
      english: 'Are you doing well?',
      audio_file: 'segment_003.m4a'
    }
  ],
  dialogues: [
    // CN_L101_MICRO (Tutor script style)
    {
      id: 'd-cn-1',
      lesson_id: 'CN_L101_MICRO',
      segment_id: 'CN_L101_MICRO_A01',
      character_or_role: 'Tutor',
      text: 'Hello! Welcome to your first Chinese lesson. Let\'s start by learning how to say hello: Nǐ hǎo.',
      audio_file: 'segment_001.m4a',
      tts_tag: '[warmly] Hello! [pause] Welcome to your first Chinese lesson. Let\'s start by learning how to say hello: Nǐ hǎo.',
      transcript_cues: [
        { startMs: 0, endMs: 1200, text: 'Hello!' },
        { startMs: 1300, endMs: 3500, text: 'Welcome to your first Chinese lesson.' }
      ]
    },
    // CN_L102 (Dialogue Conversation back-and-forth style)
    {
      id: 'd-cn-2-1',
      lesson_id: 'CN_L102',
      segment_id: 'CN_L102_D01',
      character_or_role: 'Tutor',
      text: 'Imagine you walk up to a neighbor. Let\'s listen to their conversation about jobs.',
      audio_file: 'dialogue_001.m4a',
      tts_tag: '[cheerfully] Imagine you walk up to a neighbor. [pause] Let\'s listen to their conversation about jobs.',
      english: 'Imagine you walk up to a neighbor. Let\'s listen to their conversation.',
      transcript_cues: []
    },
    {
      id: 'd-cn-2-2',
      lesson_id: 'CN_L102',
      segment_id: 'CN_L102_D02',
      character_or_role: 'Emma',
      text: '你好，你是老师吗？',
      audio_file: 'dialogue_002.m4a',
      tts_tag: '你好，你是老师吗？',
      english: 'Hello, are you a teacher?',
      transcript_cues: []
    },
    {
      id: 'd-cn-2-3',
      lesson_id: 'CN_L102',
      segment_id: 'CN_L102_D03',
      character_or_role: 'Driver',
      text: '不是，我不是老师。我是司机。',
      audio_file: 'dialogue_003.m4a',
      tts_tag: '不是，我不是老师。我是司机。',
      english: 'No, I am not a teacher. I am a driver.',
      transcript_cues: []
    },
    // JP_L101_MICRO (Tutor script style)
    {
      id: 'd-ja-1',
      lesson_id: 'JP_L101_MICRO',
      segment_id: 'JP_L101_MICRO_A01',
      character_or_role: 'Tutor',
      text: 'Hello and welcome! Today we will learn basic greetings. Let\'s try Konnichiwa.',
      audio_file: 'segment_001.m4a',
      tts_tag: '[cheerfully] Hello and welcome! [pause] Today we will learn basic greetings. Let\'s try Konnichiwa.',
      transcript_cues: [
        { startMs: 0, endMs: 1500, text: 'Hello and welcome!' },
        { startMs: 1600, endMs: 3800, text: 'Today we will learn basic greetings.' }
      ]
    }
  ],
  translations: [
    {
      id: 't-cn-1',
      entity_type: 'lesson_title',
      entity_id: 'CN_L101_MICRO',
      native_language_id: 'vi',
      translated_text: 'Chào hỏi (Tự học)'
    },
    {
      id: 't-cn-2',
      entity_type: 'lesson_title',
      entity_id: 'CN_L102',
      native_language_id: 'vi',
      translated_text: 'Hỏi về Công việc (Hội thoại)'
    },
    {
      id: 't-ja-1',
      entity_type: 'lesson_title',
      entity_id: 'JP_L101_MICRO',
      native_language_id: 'vi',
      translated_text: 'Lần đầu gặp gỡ (Tự học)'
    }
  ]
};

async function readDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(defaultMockData, null, 2), 'utf8');
    return defaultMockData;
  }
}

async function writeDb(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize seed file
await readDb();

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Get all languages
app.get('/api/languages', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('languages').select('*');
      if (!error) return res.json(data);
    }
    const db = await readDb();
    res.json(db.languages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all native languages
app.get('/api/native-languages', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('native_languages').select('*');
      if (!error) return res.json(data);
    }
    const db = await readDb();
    res.json(db.native_languages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lessons by language and level
app.get('/api/lessons', async (req, res) => {
  const { language, level } = req.query;
  try {
    const db = await readDb();
    let levelId = null;

    if (language && level) {
      const foundLevel = db.levels.find(
        l => l.language_id === language && l.level_number === parseInt(level)
      );
      levelId = foundLevel ? foundLevel.id : 'none';
    }

    if (supabase) {
      let query = supabase.from('lessons').select('*');
      if (levelId) {
        const { data: levelsData } = await supabase
          .from('levels')
          .select('id')
          .eq('language_id', language)
          .eq('level_number', parseInt(level))
          .single();
        if (levelsData) {
          query = query.eq('level_id', levelsData.id);
        }
      }
      const { data, error } = await query;
      if (!error) return res.json(data);
    }

    let result = db.lessons;
    if (levelId) {
      result = result.filter(l => l.level_id === levelId);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single lesson detail
app.get('/api/lessons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await readDb();
    const lesson = db.lessons.find(l => l.id === id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const vocab = db.vocabularies.filter(v => v.lesson_id === id);
    const sentences = db.sentences.filter(s => s.lesson_id === id);
    const dialogues = db.dialogues.filter(d => d.lesson_id === id);
    const translations = db.translations.filter(t => t.entity_id === id || vocab.some(v => v.id === t.entity_id) || sentences.some(s => s.id === t.entity_id));

    res.json({
      ...lesson,
      vocabularies: vocab,
      sentences: sentences,
      dialogues: dialogues,
      translations: translations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a lesson detail (Vocabulary, Sentence, Dialogue)
app.put('/api/lessons/:id', async (req, res) => {
  const { id } = req.params;
  const { title, goal, vocabularies, sentences, dialogues } = req.body;

  try {
    const db = await readDb();
    const lessonIndex = db.lessons.findIndex(l => l.id === id);
    if (lessonIndex === -1) return res.status(404).json({ error: 'Lesson not found' });

    // Update lesson info
    db.lessons[lessonIndex].title = title || db.lessons[lessonIndex].title;
    db.lessons[lessonIndex].goal = goal || db.lessons[lessonIndex].goal;

    // Batch update Vocabularies
    if (Array.isArray(vocabularies)) {
      vocabularies.forEach(vocab => {
        const vIndex = db.vocabularies.findIndex(v => v.id === vocab.id);
        if (vIndex !== -1) {
          db.vocabularies[vIndex] = { ...db.vocabularies[vIndex], ...vocab };
        }
      });
    }

    // Batch update Sentences
    if (Array.isArray(sentences)) {
      sentences.forEach(sentence => {
        const sIndex = db.sentences.findIndex(s => s.id === sentence.id);
        if (sIndex !== -1) {
          db.sentences[sIndex] = { ...db.sentences[sIndex], ...sentence };
        }
      });
    }

    // Batch update Dialogues (Tutor script lines OR Dialogue conversation lines)
    if (Array.isArray(dialogues)) {
      dialogues.forEach(dialogue => {
        const dIndex = db.dialogues.findIndex(d => d.segment_id === dialogue.segment_id && d.lesson_id === id);
        if (dIndex !== -1) {
          db.dialogues[dIndex] = { ...db.dialogues[dIndex], ...dialogue };
        }
      });
    }

    await writeDb(db);

    // Sync to Supabase if enabled
    if (supabase) {
      await supabase.from('lessons').update({ title, goal }).eq('id', id);

      if (Array.isArray(vocabularies)) {
        for (const v of vocabularies) {
          await supabase.from('vocabularies').upsert(v);
        }
      }
      if (Array.isArray(sentences)) {
        for (const s of sentences) {
          await supabase.from('sentences').upsert(s);
        }
      }
      if (Array.isArray(dialogues)) {
        for (const d of dialogues) {
          await supabase.from('dialogues').upsert(d);
        }
      }
    }

    res.json({ message: 'Lesson updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CLEAN JSON EXPORT ENDPOINT FOR MOBILE APP
// -------------------------------------------------------------
app.get('/api/lessons/:id/export', async (req, res) => {
  const { id } = req.params;
  const { native } = req.query;

  try {
    const db = await readDb();
    const lesson = db.lessons.find(l => l.id === id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const vocab = db.vocabularies.filter(v => v.lesson_id === id);
    const sentences = db.sentences.filter(s => s.lesson_id === id);
    const dialogues = db.dialogues.filter(d => d.lesson_id === id);

    const segments = [];

    // 1. Map dialogues (Tutor segments or dialogue segments)
    dialogues.forEach(d => {
      const isMicro = lesson.type === 'micro';
      
      const mapped = {
        id: d.segment_id,
        text: d.text,
        audioFile: d.audio_file
      };

      if (isMicro) {
        mapped.tutorText = d.text;
        mapped.transcriptCues = d.transcript_cues || [];
      } else {
        mapped.character = d.character_or_role;
        mapped.english = d.english || '';
      }

      segments.push(mapped);
    });

    // 2. Map vocabularies (_V*)
    vocab.forEach(v => {
      segments.push({
        id: v.id,
        text: v.character,
        reading: v.reading_or_pronunciation,
        romanization: v.romanization,
        english: v.english,
        audioFile: v.audio_file
      });
    });

    // 3. Map sentences (_S*)
    sentences.forEach(s => {
      segments.push({
        id: s.id,
        text: s.content,
        reading: s.reading_or_pronunciation,
        romanization: s.romanization,
        english: s.english,
        audioFile: s.audio_file
      });
    });

    // Sort segments alphabetically by suffix
    segments.sort((a, b) => {
      const aMatch = a.id.match(/_([AVSGD])(\d+)$/);
      const bMatch = b.id.match(/_([AVSGD])(\d+)$/);
      if (aMatch && bMatch) {
        const typeOrder = { A: 1, D: 1, V: 2, S: 3, G: 4 };
        if (typeOrder[aMatch[1]] !== typeOrder[bMatch[1]]) {
          return typeOrder[aMatch[1]] - typeOrder[bMatch[1]];
        }
        return parseInt(aMatch[2]) - parseInt(bMatch[2]);
      }
      return a.id.localeCompare(b.id);
    });

    const exportPayload = {
      lessonId: lesson.id,
      languageProfile: lesson.id.startsWith('JP_') ? 'japanese' : 'chinese',
      title: lesson.title,
      goal: lesson.goal,
      type: lesson.type || 'micro',
      version: lesson.version,
      contentVersion: lesson.content_version,
      maxDurationSeconds: lesson.max_duration_seconds,
      segments: segments
    };

    // Apply native language translations if requested
    if (native && native !== 'en') {
      const nativeTranslations = db.translations.filter(t => t.native_language_id === native);
      
      const titleTrans = nativeTranslations.find(t => t.entity_id === id && t.entity_type === 'lesson_title');
      if (titleTrans) exportPayload.title = titleTrans.translated_text;

      const goalTrans = nativeTranslations.find(t => t.entity_id === id && t.entity_type === 'lesson_goal');
      if (goalTrans) exportPayload.goal = goalTrans.translated_text;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${id}_spec.json`);
    res.send(JSON.stringify(exportPayload, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Curriculum Management Server is running at http://localhost:${PORT}`);
});
