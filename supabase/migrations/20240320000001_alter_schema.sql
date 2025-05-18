-- Add new columns to remixes table
ALTER TABLE remixes
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Add amazon_url to bgg_games table
ALTER TABLE bgg_games
ADD COLUMN IF NOT EXISTS amazon_url TEXT;

-- Create hashtags table if it doesn't exist
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create remix_hashtags junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS remix_hashtags (
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (remix_id, hashtag_id)
);

-- Create user_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_votes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Create user_favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_remix_hashtags_hashtag ON remix_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_remix_hashtags_remix ON remix_hashtags(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_remix ON user_votes(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_remix ON user_favorites(remix_id);

-- Enable RLS on new tables
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Public hashtags are viewable by everyone" ON hashtags
    FOR SELECT USING (true);

CREATE POLICY "Users can create hashtags" ON hashtags
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Public remix_hashtags are viewable by everyone" ON remix_hashtags
    FOR SELECT USING (true);

CREATE POLICY "Users can create remix_hashtags" ON remix_hashtags
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can delete their own remix_hashtags" ON remix_hashtags
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM remixes
        WHERE remixes.id = remix_hashtags.remix_id
        AND remixes.creator_id = auth.uid()
    ));

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