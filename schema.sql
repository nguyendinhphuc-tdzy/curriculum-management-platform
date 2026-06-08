-- PostgreSQL Database Schema for Yap Curriculum Management Platform

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Languages Table
CREATE TABLE IF NOT EXISTS languages (
    id VARCHAR(10) PRIMARY KEY, -- e.g., 'zh' (Chinese), 'ja' (Japanese)
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'Chinese', 'Japanese'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Native Languages Table (for translation/UI localization)
CREATE TABLE IF NOT EXISTS native_languages (
    id VARCHAR(10) PRIMARY KEY, -- e.g., 'en' (English), 'vi' (Vietnamese)
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'English', 'Vietnamese'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Levels Table
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language_id VARCHAR(10) REFERENCES languages(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL, -- e.g., 1, 2, 3, 4, 5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(language_id, level_number)
);

-- 4. Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'CN_L101_MICRO'
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL, -- e.g., 'CN_L101'
    lesson_number INTEGER NOT NULL, -- e.g., 1
    title TEXT NOT NULL, -- Lesson Title (Default English / Source language)
    goal TEXT, -- Lesson Goal/Objective
    type VARCHAR(20) DEFAULT 'micro', -- 'micro' or 'dialogue'
    max_duration_seconds INTEGER DEFAULT 210,
    version VARCHAR(20) DEFAULT '1.0.0',
    content_version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vocabularies Table
CREATE TABLE IF NOT EXISTS vocabularies (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'CN_L101_MICRO_V01'
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
    character TEXT NOT NULL, -- e.g., '你好'
    reading_or_pronunciation TEXT, -- e.g., 'nǐ hǎo' (Pinyin or furigana)
    romanization TEXT, -- e.g., 'ni hao'
    english TEXT, -- Default English meaning
    audio_file VARCHAR(255), -- e.g., 'segment_003.m4a'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sentences Table
CREATE TABLE IF NOT EXISTS sentences (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'CN_L101_MICRO_S01'
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- e.g., '这是什么？'
    reading_or_pronunciation TEXT, -- e.g., 'zhè shì shénme?'
    romanization TEXT,
    english TEXT, -- Default English meaning
    audio_file VARCHAR(255), -- e.g., 'segment_005.m4a'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Dialogues Table (Tutor Script Lines)
CREATE TABLE IF NOT EXISTS dialogues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
    segment_id VARCHAR(100) NOT NULL, -- e.g., 'CN_L101_MICRO_A01'
    character_or_role VARCHAR(50) DEFAULT 'Tutor', -- Role e.g., 'Tutor', 'Learner'
    text TEXT NOT NULL, -- Clean tutor text (no tags)
    english TEXT, -- English translation or description
    audio_file VARCHAR(255), -- e.g., 'segment_001.m4a'
    tts_tag TEXT, -- Tagged text for Gemini TTS e.g. '[warmly] Hello...'
    transcript_cues JSONB DEFAULT '[]'::jsonb, -- Aligned word-level timestamps from Whisper
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lesson_id, segment_id)
);

-- 8. Translations Table (For localization of all text elements to various native languages)
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'lesson_title', 'lesson_goal', 'vocab_meaning', 'sentence_meaning', 'dialogue_translation'
    entity_id VARCHAR(100) NOT NULL, -- References id of lesson, vocabulary, sentence, or dialogue
    native_language_id VARCHAR(10) REFERENCES native_languages(id) ON DELETE CASCADE,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, native_language_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_levels_language ON levels(language_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level_id);
CREATE INDEX IF NOT EXISTS idx_vocabularies_lesson ON vocabularies(lesson_id);
CREATE INDEX IF NOT EXISTS idx_sentences_lesson ON sentences(lesson_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_lesson ON dialogues(lesson_id);
CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(entity_type, entity_id);
