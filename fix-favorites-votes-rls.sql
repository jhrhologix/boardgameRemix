-- Fix RLS policies for favorites and votes tables
-- This will resolve the 406 errors on favorites and 404 errors on votes

-- Enable RLS on all tables
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
DROP POLICY IF EXISTS "Service role can manage favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view votes" ON votes;
DROP POLICY IF EXISTS "Users can manage own votes" ON votes;
DROP POLICY IF EXISTS "Service role can manage votes" ON votes;

-- Create comprehensive policies for favorites table
CREATE POLICY "Public read access for favorites" ON favorites
    FOR SELECT USING (true);

CREATE POLICY "Service role full access to favorites" ON favorites
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can manage own favorites" ON favorites
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create comprehensive policies for votes table
CREATE POLICY "Public read access for votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Service role full access to votes" ON votes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can manage own votes" ON votes
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON votes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
