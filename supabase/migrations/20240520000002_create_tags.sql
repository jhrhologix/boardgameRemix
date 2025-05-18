-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create remix_tags junction table
CREATE TABLE IF NOT EXISTS remix_tags (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can read remix_tags" ON remix_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create remix_tags" ON remix_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_remix_tags_remix_id ON remix_tags(remix_id);
CREATE INDEX IF NOT EXISTS idx_remix_tags_tag_id ON remix_tags(tag_id); 