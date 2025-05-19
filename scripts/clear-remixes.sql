-- Delete in correct order to respect foreign key constraints
DELETE FROM remix_hashtags;
DELETE FROM remix_tags;
DELETE FROM remix_games;
DELETE FROM votes;
DELETE FROM comments;
DELETE FROM remixes; 