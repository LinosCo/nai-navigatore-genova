-- Add advanced search fields to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('bambini', 'ragazzi', 'adulti', 'tutti')),
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS duration_text TEXT,
ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('presenza', 'online', 'ibrido')),
ADD COLUMN IF NOT EXISTS language TEXT CHECK (language IN ('italiano', 'inglese', 'francese', 'spagnolo', 'arabo', 'cinese', 'altro', 'multilingua')),
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzato')),
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS registration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_initiatives_age_group ON initiatives(age_group);
CREATE INDEX IF NOT EXISTS idx_initiatives_format ON initiatives(format);
CREATE INDEX IF NOT EXISTS idx_initiatives_language ON initiatives(language);
CREATE INDEX IF NOT EXISTS idx_initiatives_is_free ON initiatives(is_free);
CREATE INDEX IF NOT EXISTS idx_initiatives_tags ON initiatives USING GIN(tags);

-- Add comments
COMMENT ON COLUMN initiatives.age_group IS 'Target age group: bambini (3-10), ragazzi (11-18), adulti (18+), tutti';
COMMENT ON COLUMN initiatives.duration_minutes IS 'Duration in minutes';
COMMENT ON COLUMN initiatives.duration_text IS 'Human-readable duration (e.g., "2 ore", "1 giorno")';
COMMENT ON COLUMN initiatives.format IS 'Delivery format: presenza (in-person), online, ibrido (hybrid)';
COMMENT ON COLUMN initiatives.language IS 'Primary language of the initiative';
COMMENT ON COLUMN initiatives.cost IS 'Cost in euros (0 if free)';
COMMENT ON COLUMN initiatives.is_free IS 'Whether the initiative is free';
COMMENT ON COLUMN initiatives.difficulty_level IS 'Difficulty/skill level required';
COMMENT ON COLUMN initiatives.capacity IS 'Maximum number of participants';
COMMENT ON COLUMN initiatives.registration_required IS 'Whether registration is required';
COMMENT ON COLUMN initiatives.registration_url IS 'URL for registration';
COMMENT ON COLUMN initiatives.tags IS 'Array of tags for categorization';
