-- Drop existing tables if they exist to ensure clean slate
DROP TABLE IF EXISTS bgg_games CASCADE;
DROP TABLE IF EXISTS remix_games CASCADE;
DROP TABLE IF EXISTS remix_hashtags CASCADE;
DROP TABLE IF EXISTS hashtags CASCADE;
DROP TABLE IF EXISTS user_votes CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;

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

-- Create junction table for remixes and BGG games
CREATE TABLE IF NOT EXISTS remix_games (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    bgg_game_id UUID REFERENCES bgg_games(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, bgg_game_id)
);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create remix_hashtags junction table
CREATE TABLE IF NOT EXISTS remix_hashtags (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, hashtag_id)
);

-- Create user_votes table
CREATE TABLE IF NOT EXISTS user_votes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Add new columns to remixes table
ALTER TABLE remixes
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Rename creator_id to user_id in remixes table for consistency
ALTER TABLE remixes RENAME COLUMN creator_id TO user_id;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bgg_games_bgg_id ON bgg_games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_bgg_games_name ON bgg_games(name);
CREATE INDEX IF NOT EXISTS idx_remix_games_bgg_game ON remix_games(bgg_game_id);
CREATE INDEX IF NOT EXISTS idx_remix_games_remix ON remix_games(remix_id);
CREATE INDEX IF NOT EXISTS idx_remix_hashtags_hashtag ON remix_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_remix_hashtags_remix ON remix_hashtags(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_remix ON user_votes(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_remix ON user_favorites(remix_id);

-- Enable RLS on all tables
ALTER TABLE bgg_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for hashtags and remix_hashtags
CREATE POLICY "Public hashtags are viewable by everyone" ON hashtags
    FOR SELECT USING (true);

CREATE POLICY "Users can create hashtags" ON hashtags
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can create remix_hashtags" ON remix_hashtags
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM remixes
        WHERE remixes.id = remix_hashtags.remix_id
        AND remixes.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own remix_hashtags" ON remix_hashtags
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM remixes
        WHERE remixes.id = remix_hashtags.remix_id
        AND remixes.user_id = auth.uid()
    ));

-- Create RLS policies for votes and favorites
CREATE POLICY "Users can view votes" ON user_votes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can vote once per remix" ON user_votes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their votes" ON user_votes
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes" ON user_votes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view favorites" ON user_favorites
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can add favorites" ON user_favorites
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites" ON user_favorites
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_remix_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE remixes SET upvotes = upvotes + 1 WHERE id = NEW.remix_id;
        ELSE
            UPDATE remixes SET downvotes = downvotes + 1 WHERE id = NEW.remix_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE remixes SET upvotes = upvotes - 1 WHERE id = OLD.remix_id;
        ELSE
            UPDATE remixes SET downvotes = downvotes - 1 WHERE id = OLD.remix_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE remixes SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.remix_id;
        ELSE
            UPDATE remixes SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.remix_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counts
CREATE TRIGGER update_remix_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_remix_votes();

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