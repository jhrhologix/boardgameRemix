-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS remixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    youtube_url TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Store BGG game information
CREATE TABLE IF NOT EXISTS bgg_games (
    bgg_id TEXT PRIMARY KEY,
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
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Junction table for remixes and BGG games
CREATE TABLE IF NOT EXISTS remix_games (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    bgg_game_id TEXT REFERENCES bgg_games(bgg_id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, bgg_game_id)
);

-- Hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Junction table for remixes and hashtags
CREATE TABLE IF NOT EXISTS remix_hashtags (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, hashtag_id)
);

-- Keywords/tags table (separate from hashtags for more specific game-related tags)
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Junction table for remixes and keywords
CREATE TABLE IF NOT EXISTS remix_keywords (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, keyword_id)
);

-- User votes table (to ensure one vote per user per remix)
CREATE TABLE IF NOT EXISTS user_votes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_remixes_creator ON remixes(creator_id);
CREATE INDEX IF NOT EXISTS idx_remix_games_bgg_game ON remix_games(bgg_game_id);
CREATE INDEX IF NOT EXISTS idx_remix_games_remix ON remix_games(remix_id);
CREATE INDEX IF NOT EXISTS idx_remix_hashtags_hashtag ON remix_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_remix_hashtags_remix ON remix_hashtags(remix_id);
CREATE INDEX IF NOT EXISTS idx_remix_keywords_keyword ON remix_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_remix_keywords_remix ON remix_keywords(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_remix ON user_votes(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_remix ON user_favorites(remix_id);

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_remixes_updated_at
    BEFORE UPDATE ON remixes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bgg_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all users" ON users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can read all remixes" ON remixes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can create remixes" ON remixes
    FOR INSERT TO authenticated
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own remixes" ON remixes
    FOR UPDATE TO authenticated
    USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own remixes" ON remixes
    FOR DELETE TO authenticated
    USING (creator_id = auth.uid());

-- Add similar policies for other tables 