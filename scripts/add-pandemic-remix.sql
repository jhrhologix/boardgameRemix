-- Insert the games if they don't exist
INSERT INTO bgg_games (bgg_id, name, year_published, image_url, bgg_url)
VALUES 
  ('161936', 'Pandemic Legacy: Season 1', 2015, 'https://cf.geekdo-images.com/hxmcDJRwQA1L3COhzhGq8Q/original/img/mnfhxZNnPE2t7KYzIL0sD8YhSQE=/0x0/filters:format(jpeg)/pic2452831.jpg', 'https://boardgamegeek.com/boardgame/161936/pandemic-legacy-season-1'),
  ('147949', 'One Night Ultimate Werewolf', 2014, 'https://cf.geekdo-images.com/KLDb0vR3w8mfaHgIGF0gHw/original/img/qv0WkrvjMxWWyaZLVNJF9KV4JLU=/0x0/filters:format(jpeg)/pic2055222.jpg', 'https://boardgamegeek.com/boardgame/147949/one-night-ultimate-werewolf')
ON CONFLICT (bgg_id) DO NOTHING;

-- Insert hashtags if they don't exist
INSERT INTO hashtags (name)
VALUES 
  ('strategy'),
  ('cooperative'),
  ('traitor'),
  ('legacy'),
  ('hidden-role')
ON CONFLICT (name) DO NOTHING;

-- Create the remix
WITH new_remix AS (
  INSERT INTO remixes (
    title,
    description,
    rules,
    setup_instructions,
    difficulty,
    max_players,
    user_id
  )
  VALUES (
    'Pandemic Legacy: One Night (Revised)',
    'A thrilling combination of Pandemic Legacy and One Night Ultimate Werewolf, featuring hidden traitors and disease control.',
    'In this remix, players fight global diseases as in Pandemic Legacy, but with a hidden traitor element. At the start of each month (game), players receive secret role cards as in One Night Ultimate Werewolf. Most are CDC operatives with special abilities (Medic, Scientist, Dispatcher, etc.), but one player secretly receives the Bioterrorist role.

Setup Phase:
- Distribute role cards face-down
- The Bioterrorist secretly notes one city where they''ll place an extra infection cube
- During a brief "night phase" with eyes closed, special investigative roles may perform limited information-gathering actions

Gameplay:
- The game proceeds as standard Pandemic Legacy cooperative play
- The Bioterrorist must participate as a seemingly loyal team member while subtly sabotaging efforts
- The Bioterrorist gets one secret action per round that appears to be regular game effects:
  - Place an extra infection cube when drawing infection cards
  - Manipulate the player deck to bring epidemic cards closer
  - Discard critical city cards from the discard pile
  - Claim to have played the wrong card "by mistake"

Victory/Defeat Conditions:
- If the team successfully completes the month''s objectives, the cooperative team wins and the Bioterrorist loses
- If the team fails to meet objectives (too many outbreaks, etc.), the Bioterrorist wins
- At any point, players can call for a vote if they suspect someone is the Bioterrorist
- If the team correctly identifies the Bioterrorist, they are removed from play and the team continues with a difficulty adjustment
- If the team incorrectly identifies a loyal member, that player is removed AND the Bioterrorist gets an additional sabotage action each round',
    '1. Set up Pandemic Legacy as normal for the current month
2. Shuffle and deal role cards face-down to each player
3. Allow Bioterrorist to secretly mark their target city
4. Conduct night phase for special role actions
5. Begin standard Pandemic Legacy play with hidden traitor mechanics',
    'hard',
    5,
    auth.uid()
  )
  RETURNING id
),
-- Get game IDs
game_ids AS (
  SELECT id, bgg_id FROM bgg_games 
  WHERE bgg_id IN ('161936', '147949')
),
-- Get hashtag IDs
hashtag_ids AS (
  SELECT id, name FROM hashtags 
  WHERE name IN ('strategy', 'cooperative', 'traitor', 'legacy', 'hidden-role')
)
-- Create game relationships
INSERT INTO remix_games (remix_id, bgg_game_id)
SELECT new_remix.id, game_ids.id
FROM new_remix, game_ids;

-- Create hashtag relationships
WITH new_remix AS (
  SELECT id FROM remixes 
  WHERE title = 'Pandemic Legacy: One Night (Revised)'
  ORDER BY created_at DESC 
  LIMIT 1
),
hashtag_ids AS (
  SELECT id FROM hashtags 
  WHERE name IN ('strategy', 'cooperative', 'traitor', 'legacy', 'hidden-role')
)
INSERT INTO remix_hashtags (remix_id, hashtag_id)
SELECT new_remix.id, hashtag_ids.id
FROM new_remix, hashtag_ids; 