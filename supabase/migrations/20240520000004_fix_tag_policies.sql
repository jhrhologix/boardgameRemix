-- Update RLS policies for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;
DROP POLICY IF EXISTS "Anyone can insert tags" ON tags;

CREATE POLICY "Anyone can read tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert or update tags" ON tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Create hashtags table if it doesn't exist
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Update RLS policies for hashtags
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read hashtags" ON hashtags;
DROP POLICY IF EXISTS "Authenticated users can create hashtags" ON hashtags;
DROP POLICY IF EXISTS "Anyone can insert hashtags" ON hashtags;

CREATE POLICY "Anyone can read hashtags" ON hashtags
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert or update hashtags" ON hashtags
    FOR ALL USING (auth.role() = 'authenticated');

-- Create junction tables if they don't exist
CREATE TABLE IF NOT EXISTS remix_tags (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, tag_id)
);

CREATE TABLE IF NOT EXISTS remix_hashtags (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, hashtag_id)
);

-- Update RLS policies for junction tables
ALTER TABLE remix_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read remix_tags" ON remix_tags;
DROP POLICY IF EXISTS "Authenticated users can manage remix_tags" ON remix_tags;

CREATE POLICY "Anyone can read remix_tags" ON remix_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage remix_tags" ON remix_tags
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can read remix_hashtags" ON remix_hashtags;
DROP POLICY IF EXISTS "Authenticated users can manage remix_hashtags" ON remix_hashtags;

CREATE POLICY "Anyone can read remix_hashtags" ON remix_hashtags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage remix_hashtags" ON remix_hashtags
    FOR ALL USING (auth.role() = 'authenticated'); 