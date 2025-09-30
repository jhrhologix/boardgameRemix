-- Script to merge duplicate hashtags with different formatting
-- This will keep the hyphenated versions and merge others into them

BEGIN;

-- Merge "area control" into "area-control"
UPDATE remix_hashtags
SET hashtag_id = (SELECT id FROM hashtags WHERE name = 'area-control')
WHERE hashtag_id = (SELECT id FROM hashtags WHERE name = 'area control');

DELETE FROM hashtags WHERE name = 'area control';

-- Merge "2-player" into "2player" (keep the one without hyphen for consistency)
UPDATE remix_hashtags
SET hashtag_id = (SELECT id FROM hashtags WHERE name = '2player')
WHERE hashtag_id = (SELECT id FROM hashtags WHERE name = '2-player');

DELETE FROM hashtags WHERE name = '2-player';

-- Verify no duplicates remain
SELECT name, COUNT(*) as count
FROM hashtags
GROUP BY name
HAVING COUNT(*) > 1;

COMMIT;
