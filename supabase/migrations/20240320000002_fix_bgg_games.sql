-- Drop existing bgg_games table if it exists
DROP TABLE IF EXISTS bgg_games CASCADE;

-- Create the bgg_games table with all necessary columns
CREATE TABLE IF NOT EXISTS bgg_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bgg_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    year_published INTEGER,
    image_url TEXT,
    thumbnail_url TEXT,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER,
    description TEXT,
    bgg_url TEXT NOT NULL,
    amazon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create junction table for remixes and BGG games if it doesn't exist
CREATE TABLE IF NOT EXISTS remix_games (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    bgg_game_id UUID REFERENCES bgg_games(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, bgg_game_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bgg_games_bgg_id ON bgg_games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_bgg_games_name ON bgg_games(name);
CREATE INDEX IF NOT EXISTS idx_remix_games_bgg_game ON remix_games(bgg_game_id);
CREATE INDEX IF NOT EXISTS idx_remix_games_remix ON remix_games(remix_id);

-- Enable RLS on bgg_games
ALTER TABLE bgg_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_games ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bgg_games
CREATE POLICY "Anyone can read bgg_games" ON bgg_games
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bgg_games" ON bgg_games
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update bgg_games" ON bgg_games
    FOR UPDATE TO authenticated
    USING (true);

-- Create RLS policies for remix_games
CREATE POLICY "Anyone can read remix_games" ON remix_games
    FOR SELECT USING (true);

CREATE POLICY "Users can create remix_games for their remixes" ON remix_games 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
            AND remixes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete remix_games for their remixes" ON remix_games 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
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
    JOIN remix_games rg ON r.id = rg.remix_id
    JOIN bgg_games bg ON rg.bgg_game_id = bg.id
    WHERE 
        bg.name ILIKE '%' || search_term || '%'
        OR bg.bgg_id = search_term;
END;
$$ LANGUAGE plpgsql; 