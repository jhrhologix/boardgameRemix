-- Fix RLS policies for user_votes and user_favorites tables
-- This will resolve the 406 and 400 errors

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own votes" ON user_votes;
DROP POLICY IF EXISTS "Users can vote once per remix" ON user_votes;
DROP POLICY IF EXISTS "Users can change their own votes" ON user_votes;
DROP POLICY IF EXISTS "Users can remove their own votes" ON user_votes;
DROP POLICY IF EXISTS "Users can view votes" ON user_votes;
DROP POLICY IF EXISTS "Users can manage own votes" ON user_votes;
DROP POLICY IF EXISTS "Service role can manage votes" ON user_votes;
DROP POLICY IF EXISTS "Public read access for votes" ON user_votes;

DROP POLICY IF EXISTS "Users can view favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove their favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Service role can manage favorites" ON user_favorites;
DROP POLICY IF EXISTS "Public read access for favorites" ON user_favorites;

-- Create comprehensive policies for user_votes
CREATE POLICY "Users can view their own votes" ON user_votes
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own votes" ON user_votes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create comprehensive policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_favorites TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
