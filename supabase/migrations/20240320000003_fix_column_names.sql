-- Rename creator_id to user_id in remixes table for consistency
ALTER TABLE remixes RENAME COLUMN creator_id TO user_id;

-- Update existing RLS policies to use the new column name
DROP POLICY IF EXISTS "Users can create remix_hashtags" ON remix_hashtags;
CREATE POLICY "Users can create remix_hashtags" ON remix_hashtags
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM remixes
        WHERE remixes.id = remix_hashtags.remix_id
        AND remixes.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete their own remix_hashtags" ON remix_hashtags;
CREATE POLICY "Users can delete their own remix_hashtags" ON remix_hashtags
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM remixes
        WHERE remixes.id = remix_hashtags.remix_id
        AND remixes.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create remix_games for their remixes" ON remix_games;
CREATE POLICY "Users can create remix_games for their remixes" ON remix_games 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
            AND remixes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete remix_games for their remixes" ON remix_games;
CREATE POLICY "Users can delete remix_games for their remixes" ON remix_games 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM remixes 
            WHERE remixes.id = remix_games.remix_id 
            AND remixes.user_id = auth.uid()
        )
    ); 