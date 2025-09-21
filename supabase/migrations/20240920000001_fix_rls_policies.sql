-- Fix RLS policies causing 406 errors
-- This migration addresses the authentication issues in development

-- Ensure bgg_games table has proper RLS policies
DROP POLICY IF EXISTS "Anyone can read bgg_games" ON bgg_games;
DROP POLICY IF EXISTS "Authenticated users can create bgg_games" ON bgg_games;
DROP POLICY IF EXISTS "Authenticated users can update bgg_games" ON bgg_games;

CREATE POLICY "Anyone can read bgg_games" ON bgg_games
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage bgg_games" ON bgg_games
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can manage bgg_games" ON bgg_games
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure tags table has proper RLS policies
DROP POLICY IF EXISTS "Anyone can read tags" ON tags;
DROP POLICY IF EXISTS "Anyone can insert or update tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;

CREATE POLICY "Anyone can read tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage tags" ON tags
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can manage tags" ON tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure hashtags table has proper RLS policies  
DROP POLICY IF EXISTS "Anyone can read hashtags" ON hashtags;
DROP POLICY IF EXISTS "Anyone can insert or update hashtags" ON hashtags;
DROP POLICY IF EXISTS "Authenticated users can create hashtags" ON hashtags;

CREATE POLICY "Anyone can read hashtags" ON hashtags
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage hashtags" ON hashtags
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can manage hashtags" ON hashtags
    FOR ALL USING (auth.role() = 'authenticated');
