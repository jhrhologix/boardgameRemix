-- Create hashtags table
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create remix_hashtags junction table
CREATE TABLE remix_hashtags (
  remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (remix_id, hashtag_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on hashtags tables
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_hashtags ENABLE ROW LEVEL SECURITY;

-- Everyone can read hashtags and remix_hashtags
CREATE POLICY "Anyone can read hashtags" ON hashtags FOR SELECT USING (true);
CREATE POLICY "Anyone can read remix_hashtags" ON remix_hashtags FOR SELECT USING (true);

-- Only authenticated users can create hashtags
CREATE POLICY "Users can create hashtags" ON hashtags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can link hashtags to their remixes
CREATE POLICY "Users can link hashtags to their remixes" ON remix_hashtags 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM remixes 
      WHERE remixes.id = remix_hashtags.remix_id 
      AND remixes.user_id = auth.uid()
    )
  );

-- Create function to search remixes by hashtag
CREATE OR REPLACE FUNCTION search_remixes_by_hashtag(search_term TEXT)
RETURNS SETOF remixes AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT r.*
  FROM remixes r
  JOIN remix_hashtags rh ON r.id = rh.remix_id
  JOIN hashtags h ON rh.hashtag_id = h.id
  WHERE 
    h.name ILIKE '%' || search_term || '%' OR
    h.name ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- Create index for faster hashtag searches
CREATE INDEX hashtags_name_idx ON hashtags(name);
