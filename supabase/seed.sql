-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add game_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bgg_games' AND column_name = 'game_id') 
  THEN
    ALTER TABLE bgg_games ADD COLUMN game_id TEXT UNIQUE;
  END IF;
END $$;

-- Insert sample BGG games
INSERT INTO bgg_games (id, game_id, bgg_id, name, year_published, image_url, bgg_url) VALUES
  (uuid_generate_v4(), 'chess', '171', 'Chess', 1475, 'https://cf.geekdo-images.com/rEL_gXf5_GtFyET9Nb4HNw/original/img/qc5M9UKHvlFexbL6G4LFGlSGvwY=/0x0/filters:format(jpeg)/pic7696262.jpg', 'https://boardgamegeek.com/boardgame/171/chess'),
  (uuid_generate_v4(), 'jenga', '2452', 'Jenga', 1983, 'https://cf.geekdo-images.com/GH-EGz9V8ZyNIgxd9jHOGQ/original/img/Hy9dZXWU-XkAtGIx5-kEDtCKHGU=/0x0/filters:format(jpeg)/pic5127864.jpg', 'https://boardgamegeek.com/boardgame/2452/jenga'),
  (uuid_generate_v4(), 'monopoly', '1406', 'Monopoly', 1933, 'https://cf.geekdo-images.com/9nGoBZ0MRbi6rdH47sj2Qg/original/img/bA8irydTDNTy6cBr8L2JtQT1Y7g=/0x0/filters:format(jpeg)/pic5786795.jpg', 'https://boardgamegeek.com/boardgame/1406/monopoly'),
  (uuid_generate_v4(), 'uno', '2223', 'Uno', 1971, 'https://cf.geekdo-images.com/6V2cU_EV_V3d1QhzDRv-Ag/original/img/jEHI6_Ey3z8qXs4OEtGGQxXXKaE=/0x0/filters:format(jpeg)/pic7214857.jpg', 'https://boardgamegeek.com/boardgame/2223/uno'),
  (uuid_generate_v4(), 'risk', '181', 'Risk', 1959, 'https://cf.geekdo-images.com/Oem1TTtSgxOghRFCoyWRPw/original/img/HhXkXquQCX4qnmO8BoQJKlgTjhU=/0x0/filters:format(jpeg)/pic4916782.jpg', 'https://boardgamegeek.com/boardgame/181/risk'),
  (uuid_generate_v4(), 'poker', '1115', 'Poker', 1810, 'https://cf.geekdo-images.com/zE_MUjCIT4cdG9j2b0KhKg/original/img/9Hs8lS4l7gPh8NcK_RRH6yR8Qhc=/0x0/filters:format(jpeg)/pic1301518.jpg', 'https://boardgamegeek.com/boardgame/1115/poker'),
  (uuid_generate_v4(), 'scrabble', '320', 'Scrabble', 1948, 'https://cf.geekdo-images.com/mVmmntn2oQd0PfFrWBvwIQ/original/img/7OYxTx3Q6OpCF9Zg_U5taPWp-Xg=/0x0/filters:format(jpeg)/pic404651.jpg', 'https://boardgamegeek.com/boardgame/320/scrabble'),
  (uuid_generate_v4(), 'catan', '13', 'Catan', 1995, 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw/original/img/SKSvUxzM_x_YH1K6EFKz0WLgZWE=/0x0/filters:format(jpeg)/pic2419375.jpg', 'https://boardgamegeek.com/boardgame/13/catan')
ON CONFLICT (bgg_id) DO UPDATE SET
  name = EXCLUDED.name,
  year_published = EXCLUDED.year_published,
  image_url = EXCLUDED.image_url,
  bgg_url = EXCLUDED.bgg_url,
  game_id = EXCLUDED.game_id;

-- Insert hashtags if they don't exist
INSERT INTO hashtags (id, name) VALUES
  (uuid_generate_v4(), 'strategy'),
  (uuid_generate_v4(), 'dexterity'),
  (uuid_generate_v4(), 'abstract'),
  (uuid_generate_v4(), 'puzzle'),
  (uuid_generate_v4(), '2player'),
  (uuid_generate_v4(), 'family'),
  (uuid_generate_v4(), 'card'),
  (uuid_generate_v4(), 'quick'),
  (uuid_generate_v4(), 'economic'),
  (uuid_generate_v4(), 'party'),
  (uuid_generate_v4(), 'bluffing'),
  (uuid_generate_v4(), 'war'),
  (uuid_generate_v4(), 'area control'),
  (uuid_generate_v4(), 'word'),
  (uuid_generate_v4(), 'resource'),
  (uuid_generate_v4(), 'tile'),
  (uuid_generate_v4(), 'competitive')
ON CONFLICT (name) DO NOTHING;

-- Create a function to get hashtag ID by name
CREATE OR REPLACE FUNCTION get_hashtag_id(tag_name TEXT)
RETURNS UUID AS $$
DECLARE
  tag_id UUID;
BEGIN
  SELECT id INTO tag_id FROM hashtags WHERE name = tag_name;
  RETURN tag_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample remixes with all required fields
DO $$
DECLARE
  chess_id UUID;
  jenga_id UUID;
  monopoly_id UUID;
  uno_id UUID;
  risk_id UUID;
  poker_id UUID;
  scrabble_id UUID;
  catan_id UUID;
  remix_id UUID;
BEGIN
  -- Get game IDs
  SELECT id INTO chess_id FROM bgg_games WHERE game_id = 'chess';
  SELECT id INTO jenga_id FROM bgg_games WHERE game_id = 'jenga';
  SELECT id INTO monopoly_id FROM bgg_games WHERE game_id = 'monopoly';
  SELECT id INTO uno_id FROM bgg_games WHERE game_id = 'uno';
  SELECT id INTO risk_id FROM bgg_games WHERE game_id = 'risk';
  SELECT id INTO poker_id FROM bgg_games WHERE game_id = 'poker';
  SELECT id INTO scrabble_id FROM bgg_games WHERE game_id = 'scrabble';
  SELECT id INTO catan_id FROM bgg_games WHERE game_id = 'catan';

  -- Insert Tactical Tower (Chess + Jenga)
  INSERT INTO remixes (
    id, title, description, rules, difficulty, 
    min_players, max_players, avg_play_time,
    materials_needed, upvotes, downvotes, created_at
  ) VALUES (
    uuid_generate_v4(),
    'Tactical Tower: Chess + Jenga',
    'A strategic game where each Jenga piece represents a chess piece. Remove pieces strategically without compromising your position.',
    '1. Each Jenga piece represents a chess piece. Mark pieces with chess symbols or use colored pieces to represent different chess pieces.
2. Players take turns making chess moves by removing the corresponding Jenga piece and placing it on the chess board.
3. If a player causes the tower to fall while removing their piece, they lose the game.
4. Normal chess rules apply for piece movement and capture.
5. Captured pieces are removed from both the chess board and the Jenga tower.
6. The game ends when either a player achieves checkmate or causes the tower to fall.',
    'medium',
    2, 2, 30,
    ARRAY['Chess set', 'Jenga set', 'Piece markers or colored stickers'],
    124, 12,
    NOW() - INTERVAL '7 days'
  ) RETURNING id INTO remix_id;

  -- Insert game relationships for Tactical Tower
  INSERT INTO remix_games (remix_id, bgg_game_id) VALUES
    (remix_id, chess_id),
    (remix_id, jenga_id);

  -- Insert hashtags for Tactical Tower
  INSERT INTO remix_hashtags (remix_id, hashtag_id)
  SELECT remix_id, get_hashtag_id(tag)
  FROM unnest(ARRAY['strategy', 'dexterity', 'abstract', 'puzzle', '2player']) AS tag;

  -- Insert Monopoly Mayhem (Monopoly + Uno)
  INSERT INTO remixes (
    id, title, description, rules, difficulty,
    min_players, max_players, avg_play_time,
    materials_needed, upvotes, downvotes, created_at
  ) VALUES (
    uuid_generate_v4(),
    'Monopoly Mayhem: Monopoly + Uno',
    'Use Uno cards to determine movement and property actions in this fast-paced Monopoly variant.',
    '1. Players are dealt 7 Uno cards at the start.
2. Instead of rolling dice, play an Uno card to move:
   - Number cards: Move that many spaces
   - Skip: Skip your movement but still take property actions
   - Reverse: Move backwards the number shown
   - Draw Two: Move 2 spaces and draw 2 cards
   - Wild: Choose any space to move to
3. Property purchases and rent payments follow normal Monopoly rules.
4. Draw a new Uno card at the end of your turn.
5. First player to own 3 complete property sets wins.',
    'easy',
    2, 6, 45,
    ARRAY['Monopoly board', 'Uno deck', 'Monopoly money and pieces'],
    87, 5,
    NOW() - INTERVAL '5 days'
  ) RETURNING id INTO remix_id;

  -- Insert game relationships for Monopoly Mayhem
  INSERT INTO remix_games (remix_id, bgg_game_id) VALUES
    (remix_id, monopoly_id),
    (remix_id, uno_id);

  -- Insert hashtags for Monopoly Mayhem
  INSERT INTO remix_hashtags (remix_id, hashtag_id)
  SELECT remix_id, get_hashtag_id(tag)
  FROM unnest(ARRAY['family', 'card', 'quick', 'economic', 'party']) AS tag;

  -- Insert Risk & Reward (Risk + Poker)
  INSERT INTO remixes (
    id, title, description, rules, difficulty,
    min_players, max_players, avg_play_time,
    materials_needed, upvotes, downvotes, created_at
  ) VALUES (
    uuid_generate_v4(),
    'Risk & Reward: Risk + Poker',
    'Combine territory control with poker hands to determine battle outcomes in this game of chance and strategy.',
    '1. Each player is dealt 5 cards at the start of their turn.
2. When attacking a territory, both attacker and defender reveal their poker hands.
3. The player with the better poker hand wins:
   - Higher hand wins the battle
   - In case of a tie, compare high cards
   - Loser loses one army per rank difference (e.g., Full House vs. Two Pair = 3 armies)
4. After each battle, players draw back up to 5 cards.
5. Territory bonuses grant extra cards at the start of turn.
6. First player to complete their objective or control all territories wins.',
    'hard',
    3, 6, 120,
    ARRAY['Risk board and pieces', 'Two decks of playing cards', 'Territory cards'],
    56, 23,
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO remix_id;

  -- Insert game relationships for Risk & Reward
  INSERT INTO remix_games (remix_id, bgg_game_id) VALUES
    (remix_id, risk_id),
    (remix_id, poker_id);

  -- Insert hashtags for Risk & Reward
  INSERT INTO remix_hashtags (remix_id, hashtag_id)
  SELECT remix_id, get_hashtag_id(tag)
  FROM unnest(ARRAY['strategy', 'card', 'bluffing', 'war', 'area control']) AS tag;

  -- Insert Scrabble Quest (Scrabble + Catan)
  INSERT INTO remixes (
    id, title, description, rules, difficulty,
    min_players, max_players, avg_play_time,
    materials_needed, upvotes, downvotes, created_at
  ) VALUES (
    uuid_generate_v4(),
    'Scrabble Quest: Scrabble + Catan',
    'Build words to collect resources and expand your vocabulary empire across the board.',
    '1. The board combines Scrabble and Catan layouts with resource hexes.
2. Players build settlements and roads using Scrabble tiles.
3. To build:
   - Settlement: Form a 4+ letter word
   - City: Extend existing word to 7+ letters
   - Road: Form a 2-3 letter word
4. Collect resources based on the hexes your words cross or touch.
5. Use resources to buy more letter tiles or development cards.
6. Victory points are earned from:
   - Word length (1 point per 4 letters)
   - Settlement/City placement
   - Longest word bonus
7. First to 10 victory points wins.',
    'medium',
    3, 4, 90,
    ARRAY['Scrabble tiles and board', 'Catan hexes and pieces', 'Resource cards'],
    142, 18,
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO remix_id;

  -- Insert game relationships for Scrabble Quest
  INSERT INTO remix_games (remix_id, bgg_game_id) VALUES
    (remix_id, scrabble_id),
    (remix_id, catan_id);

  -- Insert hashtags for Scrabble Quest
  INSERT INTO remix_hashtags (remix_id, hashtag_id)
  SELECT remix_id, get_hashtag_id(tag)
  FROM unnest(ARRAY['word', 'resource', 'strategy', 'tile', 'competitive']) AS tag;

END $$; 