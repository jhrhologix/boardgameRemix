-- Fix remix_games table schema to use TEXT for bgg_game_id
-- This aligns with the original schema and BGG ID format

-- Drop the existing table and recreate with correct schema
DROP TABLE IF EXISTS remix_games CASCADE;

-- Recreate remix_games table with TEXT bgg_game_id
CREATE TABLE remix_games (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    bgg_game_id TEXT REFERENCES bgg_games(bgg_id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, bgg_game_id)
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_remix_games_bgg_game ON remix_games(bgg_game_id);
CREATE INDEX IF NOT EXISTS idx_remix_games_remix ON remix_games(remix_id);

-- Enable RLS
ALTER TABLE remix_games ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for remix_games
CREATE POLICY "Users can view remix games" ON remix_games
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own remix games" ON remix_games
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
            AND remixes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own remix games" ON remix_games
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
            AND remixes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own remix games" ON remix_games
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
            AND remixes.user_id = auth.uid()
        )
    );
