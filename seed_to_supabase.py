import os
import sys
from pathlib import Path

# Try to load using python-dotenv, fallback to manual parsing if missing
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY are required in .env file.")
    print("Please follow the setup guide and update your .env file.")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("Required package 'supabase' is missing. Please run with:")
    print("uv run --with supabase --with python-dotenv seed_to_supabase.py")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# -------------------------------------------------------------
// Seeding Data (Aligned with Excel [Original] Yapsu AI Curriculum.xlsx)
# -------------------------------------------------------------

languages = [
    {"id": "zh", "name": "Chinese"},
    {"id": "ja", "name": "Japanese"}
]

native_languages = [
    {"id": "en", "name": "English"},
    {"id": "vi", "name": "Vietnamese"}
]

levels = [
    {"id": "level-1-zh", "language_id": "zh", "level_number": 1},
    {"id": "level-1-ja", "language_id": "ja", "level_number": 1}
]

lessons = [
    {
        "id": "CN_L101_MICRO",
        "level_id": "level-1-zh",
        "code": "CN_L101_MICRO",
        "lesson_number": 1,
        "title": "Greetings (Micro)",
        "goal": "Learn basic hello and welcome in Chinese tutor style",
        "max_duration_seconds": 210,
        "version": "2026.06.08.1",
        "content_version": "2026.06.08"
    },
    {
        "id": "CN_L102",
        "level_id": "level-1-zh",
        "code": "CN_L102",
        "lesson_number": 2,
        "title": "Asking about Jobs (Dialogue)",
        "goal": "Ask if someone is a teacher or driver in a real conversation",
        "max_duration_seconds": 210,
        "version": "2026.06.08.1",
        "content_version": "2026.06.08"
    },
    {
        "id": "JP_L101_MICRO",
        "level_id": "level-1-ja",
        "code": "JP_L101_MICRO",
        "lesson_number": 1,
        "title": "First Encounters (Micro)",
        "goal": "Introduce yourself and greet people in Japanese tutor style",
        "max_duration_seconds": 210,
        "version": "2026.06.08.1",
        "content_version": "2026.06.08"
    }
]

vocabularies = [
    # CN_L101_MICRO
    {
        "id": "CN_L101_MICRO_V01",
        "lesson_id": "CN_L101_MICRO",
        "character": "你好",
        "reading_or_pronunciation": "nǐ hǎo",
        "romanization": "ni hao",
        "english": "Hello",
        "audio_file": "segment_002.m4a"
    },
    {
        "id": "CN_L101_MICRO_V02",
        "lesson_id": "CN_L101_MICRO",
        "character": "学生",
        "reading_or_pronunciation": "xuéshēng",
        "romanization": "xuesheng",
        "english": "Student",
        "audio_file": "segment_004.m4a"
    },
    # CN_L102
    {
        "id": "CN_L102_V01",
        "lesson_id": "CN_L102",
        "character": "老师",
        "reading_or_pronunciation": "lǎoshī",
        "romanization": "laoshi",
        "english": "Teacher",
        "audio_file": "vocab_001.m4a"
    },
    {
        "id": "CN_L102_V02",
        "lesson_id": "CN_L102",
        "character": "司机",
        "reading_or_pronunciation": "sījī",
        "romanization": "siji",
        "english": "Driver",
        "audio_file": "vocab_002.m4a"
    },
    # JP_L101_MICRO
    {
        "id": "JP_L101_MICRO_V01",
        "lesson_id": "JP_L101_MICRO",
        "character": "こんにちは",
        "reading_or_pronunciation": "Konnichiwa",
        "romanization": "konnichiwa",
        "english": "Hello / Good afternoon",
        "audio_file": "segment_002.m4a"
    }
]

sentences = [
    # CN_L101_MICRO
    {
        "id": "CN_L101_MICRO_S01",
        "lesson_id": "CN_L101_MICRO",
        "content": "你好吗？",
        "reading_or_pronunciation": "nǐ hǎo ma?",
        "romanization": "ni hao ma?",
        "english": "How are you?",
        "audio_file": "segment_003.m4a"
    },
    # CN_L102
    {
        "id": "CN_L102_S01",
        "lesson_id": "CN_L102",
        "content": "她是老师吗？",
        "reading_or_pronunciation": "Tā shì lǎoshī ma?",
        "romanization": "ta shi laoshi ma?",
        "english": "Is she a teacher?",
        "audio_file": "sentence_001.m4a"
    },
    # JP_L101_MICRO
    {
        "id": "JP_L101_MICRO_S01",
        "lesson_id": "JP_L101_MICRO",
        "content": "お元気ですか？",
        "reading_or_pronunciation": "O-genki desu ka?",
        "romanization": "o-genki desu ka?",
        "english": "Are you doing well?",
        "audio_file": "segment_003.m4a"
    }
]

dialogues = [
    # CN_L101_MICRO
    {
        "lesson_id": "CN_L101_MICRO",
        "segment_id": "CN_L101_MICRO_A01",
        "character_or_role": "Tutor",
        "text": "Hello! Welcome to your first Chinese lesson. Let's start by learning how to say hello: Nǐ hǎo.",
        "audio_file": "segment_001.m4a",
        "tts_tag": "[warmly] Hello! [pause] Welcome to your first Chinese lesson. Let's start by learning how to say hello: Nǐ hǎo.",
        "transcript_cues": [
            {"startMs": 0, "endMs": 1200, "text": "Hello!"},
            {"startMs": 1300, "endMs": 3500, "text": "Welcome to your first Chinese lesson."}
        ]
    },
    # CN_L102
    {
        "lesson_id": "CN_L102",
        "segment_id": "CN_L102_D01",
        "character_or_role": "Tutor",
        "text": "Imagine you walk up to a neighbor. Let's listen to their conversation about jobs.",
        "audio_file": "dialogue_001.m4a",
        "tts_tag": "[cheerfully] Imagine you walk up to a neighbor. [pause] Let's listen to their conversation about jobs.",
        "english": "Imagine you walk up to a neighbor. Let's listen to their conversation.",
        "transcript_cues": []
    },
    {
        "lesson_id": "CN_L102",
        "segment_id": "CN_L102_D02",
        "character_or_role": "Emma",
        "text": "你好，你是老师吗？",
        "audio_file": "dialogue_002.m4a",
        "tts_tag": "你好，你是老师吗？",
        "english": "Hello, are you a teacher?",
        "transcript_cues": []
    },
    {
        "lesson_id": "CN_L102",
        "segment_id": "CN_L102_D03",
        "character_or_role": "Driver",
        "text": "不是，我 không phải là giáo viên, 我是司机。",
        "audio_file": "dialogue_003.m4a",
        "tts_tag": "不是，我 không phải là giáo viên, 我是司机。",
        "english": "No, I am not a teacher. I am a driver.",
        "transcript_cues": []
    },
    # JP_L101_MICRO
    {
        "lesson_id": "JP_L101_MICRO",
        "segment_id": "JP_L101_MICRO_A01",
        "character_or_role": "Tutor",
        "text": "Hello and welcome! Today we will learn basic greetings. Let's try Konnichiwa.",
        "audio_file": "segment_001.m4a",
        "tts_tag": "[cheerfully] Hello and welcome! [pause] Today we will learn basic greetings. Let's try Konnichiwa.",
        "transcript_cues": [
            {"startMs": 0, "endMs": 1500, "text": "Hello and welcome!"},
            {"startMs": 1600, "endMs": 3800, "text": "Today we will learn basic greetings."}
        ]
    }
]

translations = [
    {
        "entity_type": "lesson_title",
        "entity_id": "CN_L101_MICRO",
        "native_language_id": "vi",
        "translated_text": "Chào hỏi (Tự học)"
    },
    {
        "entity_type": "lesson_title",
        "entity_id": "CN_L102",
        "native_language_id": "vi",
        "translated_text": "Hỏi về Công việc (Hội thoại)"
    },
    {
        "entity_type": "lesson_title",
        "entity_id": "JP_L101_MICRO",
        "native_language_id": "vi",
        "translated_text": "Lần đầu gặp gỡ (Tự học)"
    }
]

def seed():
    print("Seeding Supabase tables...")
    
    # 1. Seed Languages
    for lang in languages:
        supabase.table("languages").upsert(lang).execute()
    print("Languages seeded.")

    # 2. Seed Native Languages
    for nat in native_languages:
        supabase.table("native_languages").upsert(nat).execute()
    print("Native languages seeded.")

    # 3. Seed Levels
    for lvl in levels:
        supabase.table("levels").upsert(lvl).execute()
    print("Levels seeded.")

    # 4. Seed Lessons
    for les in lessons:
        supabase.table("lessons").upsert(les).execute()
    print("Lessons seeded.")

    # 5. Seed Vocabularies
    for voc in vocabularies:
        supabase.table("vocabularies").upsert(voc).execute()
    print("Vocabularies seeded.")

    # 6. Seed Sentences
    for sen in sentences:
        supabase.table("sentences").upsert(sen).execute()
    print("Sentences seeded.")

    # 7. Seed Dialogues
    for dia in dialogues:
        supabase.table("dialogues").upsert(dia).execute()
    print("Dialogues seeded.")

    # 8. Seed Translations
    for tra in translations:
        supabase.table("translations").upsert(tra).execute()
    print("Translations seeded.")

    print("\nSUCCESS: Supabase database seeding complete!")

if __name__ == "__main__":
    seed()
