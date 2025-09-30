-- Check for duplicate hashtag names
SELECT name, COUNT(*) as count
FROM hashtags
GROUP BY name
HAVING COUNT(*) > 1;

-- List all hashtags
SELECT id, name, created_at
FROM hashtags
ORDER BY name;
