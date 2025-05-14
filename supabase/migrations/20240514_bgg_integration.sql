-- Create table for BoardGameGeek games
CREATE TABLE bgg_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
  bgg_id TEXT NOT NULL,
  name TEXT NOT NULL,
  year_published TEXT,
  image_url TEXT,
  bgg_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add rules and setup instructions to remixes table
ALTER TABLE remixes ADD COLUMN rules TEXT;
ALTER TABLE remixes ADD COLUMN setup_instructions TEXT;

-- Create index for faster searches
CREATE INDEX bgg_games_bgg_id_idx ON bgg_games(bgg_id);
CREATE INDEX bgg_games_name_idx ON bgg_games(name);

-- Enable RLS on bgg_games
ALTER TABLE bgg_games ENABLE ROW LEVEL SECURITY;

-- Everyone can read bgg_games
CREATE POLICY "Anyone can read bgg_games" ON bgg_games FOR SELECT USING (true);

-- Only authenticated users can create/update/delete their own bgg_games
CREATE POLICY "Users can create bgg_games for their remixes" ON bgg_games 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM remixes 
      WHERE remixes.id = bgg_games.remix_id 
      AND remixes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update bgg_games for their remixes" ON bgg_games 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM remixes 
      WHERE remixes.id = bgg_games.remix_id 
      AND remixes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bgg_games for their remixes" ON bgg_games 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM remixes 
      WHERE remixes.id = bgg_games.remix_id 
      AND remixes.user_id = auth.uid()
    )
  );

-- Create function to search remixes by board game
CREATE OR REPLACE FUNCTION search_remixes_by_game(search_term TEXT)
RETURNS SETOF remixes AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT r.*
  FROM remixes r
  JOIN bgg_games bg ON r.id = bg.remix_id
  WHERE 
    bg.name ILIKE '%' || search_term || '%'
    OR bg.bgg_id = search_term;
END;
$$ LANGUAGE plpgsql;
