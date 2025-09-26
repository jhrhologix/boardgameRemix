-- Create user_favorites and user_votes tables if they don't exist

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Create user_votes table
CREATE TABLE IF NOT EXISTS user_votes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, remix_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_remix ON user_favorites(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_remix ON user_votes(remix_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_user ON user_votes(user_id);

-- Enable RLS on both tables
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
