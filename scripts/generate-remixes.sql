-- Create tags first (if they don't exist)
DO $$
BEGIN
    -- Game mechanic tags
    INSERT INTO tags (name) VALUES
    ('strategy'),
    ('cooperative'),
    ('deck-building'),
    ('dice-rolling'),
    ('area-control'),
    ('drafting'),
    ('tile-placement'),
    ('worker-placement'),
    ('hand-management'),
    ('legacy'),
    -- Complexity tags
    ('easy'),
    ('medium'),
    ('hard'),
    ('expert'),
    -- Player count tags
    ('solo'),
    ('two-player'),
    ('small-group'),
    ('party'),
    -- Theme tags
    ('fantasy'),
    ('sci-fi'),
    ('horror'),
    ('historical'),
    ('modern'),
    -- Additional common tags
    ('family-game')
    ON CONFLICT (name) DO NOTHING;
END$$;

-- Function to get random user IDs
CREATE OR REPLACE FUNCTION get_random_user_id() RETURNS uuid AS $$
DECLARE
    random_id uuid;
BEGIN
    SELECT id INTO random_id FROM profiles ORDER BY random() LIMIT 1;
    RETURN random_id;
END;
$$ LANGUAGE plpgsql;

-- Insert remixes
DO $$
DECLARE
    remix_id uuid;
    user_id uuid;
    comment_id uuid;
BEGIN
    -- Illuminati: Shadow Government
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Illuminati: Shadow Government',
        'A realistic modern conspiracy simulation transforming Illuminati into a game of contemporary power dynamics. Players control realistic power brokers like Media Conglomerates and Tech Giants, using influence points and control cards to build networks of power while maintaining plausible deniability.',
        user_id,
        NOW() - interval '30 days',
        NOW() - interval '30 days',
        4,
        4,
        6,
        90,
        120
    );

    -- Add tags for Illuminati remix
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'area-control'),
    (remix_id, 'hard'),
    (remix_id, 'modern');

    -- Add games for Illuminati remix
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Illuminati', 28);

    -- Add some comments
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'Could you clarify how the influence points work with the plausible deniability mechanic?', NOW() - interval '25 days');

    -- Add answer to the comment
    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'Each influence point spent adds to a hidden tracker. If your total visible influence exceeds your plausible deniability threshold (based on your power broker type), you start taking penalties to your actions. Tech Giants have higher thresholds for data-related influence but lower for political influence, while Media Conglomerates are the opposite.', comment_id, NOW() - interval '24 days');

    -- Terraforming Railways
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Terraforming Railways',
        'Combines Terraforming Mars with Ticket to Ride''s route-building mechanics. Players build railway routes between Martian cities using resource cards, gaining production bonuses and contributing to terraforming efforts.',
        user_id,
        NOW() - interval '25 days',
        NOW() - interval '25 days',
        4,
        2,
        5,
        90,
        120
    );

    -- Add tags for Terraforming Railways
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'hand-management'),
    (remix_id, 'hard'),
    (remix_id, 'sci-fi');

    -- Add games for Terraforming Railways
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Terraforming Mars', 167791),
    (remix_id, gen_random_uuid(), 'Ticket to Ride', 9209);

    -- Add random votes for all remixes
    INSERT INTO votes (remix_id, user_id, value)
    SELECT r.id, p.id, 
        CASE 
            WHEN random() < 0.8 THEN 1  -- 80% positive votes
            ELSE -1                     -- 20% negative votes
        END
    FROM remixes r
    CROSS JOIN profiles p;

    -- Spirit Chess
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Spirit Chess',
        'A chess match where each player controls a Spirit Island spirit with unique powers. The chess board replaces the island, with invaders advancing from opposite sides. Balance traditional chess moves with spirit powers while generating fear tokens through captures.',
        user_id,
        NOW() - interval '20 days',
        NOW() - interval '20 days',
        4,
        2,
        2,
        60,
        90
    );

    -- Add tags for Spirit Chess
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'two-player'),
    (remix_id, 'expert'),
    (remix_id, 'fantasy');

    -- Add games for Spirit Chess
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Spirit Island', 162886),
    (remix_id, gen_random_uuid(), 'Chess', 171);

    -- Add clarifying comment and answer
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'How do the spirit powers interact with traditional chess moves?', NOW() - interval '15 days');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'Spirit powers can be used either before or after your chess move. For example, the Lightning spirit can strike a piece before moving, potentially forcing an opponent to move their king out of check. Each power costs energy, which is gained through capturing pieces or controlling sacred sites on the board.', comment_id, NOW() - interval '14 days');

    -- Pandemic: Patient Zero
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Pandemic: Patient Zero',
        'An asymmetric version of Pandemic where one player becomes Patient Zero, secretly moving around the board and spreading infection while other players work to contain the outbreak and develop cures.',
        user_id,
        NOW() - interval '15 days',
        NOW() - interval '15 days',
        4,
        3,
        5,
        60,
        75
    );

    -- Add tags for Pandemic: Patient Zero
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'hard'),
    (remix_id, 'modern'),
    (remix_id, 'small-group');

    -- Add games for Pandemic: Patient Zero
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Pandemic', 30549);

    -- Add some comments
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'What happens if Patient Zero is in a city when a cure is discovered there?', NOW() - interval '10 days');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'If a cure is discovered in a city where Patient Zero is present (and detected), they must immediately move to an adjacent city and their position is revealed to all players for one additional round.', comment_id, NOW() - interval '9 days');

    -- Wingspan: Avian Alliances
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Wingspan: Avian Alliances',
        'Combines Wingspan and 7 Wonders, where players manage both a bird sanctuary and an ancient civilization. Cards are drafted 7 Wonders style but include birds that can be played to your sanctuary. Resource production enhances bird-feeding capabilities while Wonders grant powerful bird-related bonuses.',
        user_id,
        NOW() - interval '12 days',
        NOW() - interval '12 days',
        3,
        3,
        7,
        60,
        75
    );

    -- Add tags for Wingspan: Avian Alliances
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'drafting'),
    (remix_id, 'medium'),
    (remix_id, 'small-group');

    -- Add games for Wingspan: Avian Alliances
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Wingspan', 266192),
    (remix_id, gen_random_uuid(), '7 Wonders', 68448);

    -- Add clarifying comment and answer
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'How do the Wonder abilities interact with bird powers?', NOW() - interval '10 days');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'Each Wonder stage provides both a traditional 7 Wonders bonus and a bird-related power. For example, the Pyramids might let you draw 2 bird cards and keep 1 when completed, while the Lighthouse could give your birds in the wetland habitat an extra egg capacity.', comment_id, NOW() - interval '9 days');

    -- Gloomhaven: Dungeon Draft
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Gloomhaven: Dungeon Draft',
        'A two-player remix combining Gloomhaven''s tactical combat with 7 Wonders Duel''s drafting pyramid. Before each room, players draft cards from a pyramid arrangement to determine their available abilities and resources for the upcoming encounter.',
        user_id,
        NOW() - interval '8 days',
        NOW() - interval '8 days',
        4,
        2,
        2,
        90,
        90
    );

    -- Add tags for Gloomhaven: Dungeon Draft
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'drafting'),
    (remix_id, 'expert'),
    (remix_id, 'two-player'),
    (remix_id, 'fantasy');

    -- Add games for Gloomhaven: Dungeon Draft
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Gloomhaven', 174430),
    (remix_id, gen_random_uuid(), '7 Wonders Duel', 173346);

    -- Carcassonne: City States
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Carcassonne: City States',
        'A competitive evolution of Carcassonne where cities develop through historical eras, from Medieval to Modern. Features city-state warfare, technological advancement, and diplomatic alliances. Cities can wage war using influence tokens or form alliances to share points.',
        user_id,
        NOW() - interval '5 days',
        NOW() - interval '5 days',
        3,
        2,
        5,
        60,
        75
    );

    -- Add tags for Carcassonne: City States
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'tile-placement'),
    (remix_id, 'medium'),
    (remix_id, 'historical');

    -- Add games for Carcassonne: City States
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Carcassonne', 822);

    -- Add clarifying comment and answer
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'What triggers the transition between eras?', NOW() - interval '3 days');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'Era transitions are triggered by specific achievements: Medieval to Renaissance when a player completes their second large city, Renaissance to Industrial at 50 points, and Industrial to Modern in the final quarter of the tile stack. Each transition unlocks new mechanics like technology meeples, factories, and wonders.', comment_id, NOW() - interval '2 days');

    -- Add random votes for all remixes (ensuring good distribution)
    INSERT INTO votes (remix_id, user_id, value)
    SELECT r.id, p.id, 
        CASE 
            WHEN random() < 0.8 THEN 1  -- 80% positive votes
            ELSE -1                     -- 20% negative votes
        END
    FROM remixes r
    CROSS JOIN profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM votes v 
        WHERE v.remix_id = r.id AND v.user_id = p.id
    );

    -- Spirit Legacy Island
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Spirit Legacy Island',
        'A campaign game combining Spirit Island, Risk Legacy, and Chess. Spirits defend their evolving island from chess-piece invaders across multiple sessions. The island permanently changes based on game outcomes, with spirits gaining new powers and invaders adapting their strategies.',
        user_id,
        NOW() - interval '2 days',
        NOW() - interval '2 days',
        5,
        2,
        4,
        120,
        180
    );

    -- Add tags for Spirit Legacy Island
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'strategy'),
    (remix_id, 'legacy'),
    (remix_id, 'expert'),
    (remix_id, 'fantasy'),
    (remix_id, 'cooperative');

    -- Add games for Spirit Legacy Island
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Spirit Island', 162886),
    (remix_id, gen_random_uuid(), 'Risk Legacy', 105134),
    (remix_id, gen_random_uuid(), 'Chess', 171);

    -- Add clarifying comment and answer
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'How do the chess pieces interact with Spirit Island''s fear mechanics?', NOW() - interval '1 day');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'Each type of chess piece generates and responds to fear differently. Pawns are easily frightened, retreating after 1 fear. Knights can "jump" away from fear effects. Queens are nearly fearless but generate massive fear when finally destroyed. The fear deck evolves between games, with new cards added based on which pieces were most effective or problematic in previous sessions.', comment_id, NOW() - interval '1 day');

    -- Forbidden Uno
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Forbidden Uno',
        'A cooperative game combining Forbidden Island/Desert with Uno mechanics. Players use Uno cards to move and take actions, with special cards triggering unique effects. The Waters Rise/Storm Picks Up card is shuffled into the Uno deck, creating tension.',
        user_id,
        NOW() - interval '1 day',
        NOW() - interval '1 day',
        2,
        2,
        6,
        45,
        45
    );

    -- Add tags for Forbidden Uno
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'cooperative'),
    (remix_id, 'hand-management'),
    (remix_id, 'easy'),
    (remix_id, 'family-game');

    -- Add games for Forbidden Uno
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Forbidden Island', 65244),
    (remix_id, gen_random_uuid(), 'Forbidden Desert', 136063),
    (remix_id, gen_random_uuid(), 'Uno', 2223);

    -- Add clarifying comment and answer
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'What happens when someone has to draw cards but the Waters Rise card is next?', NOW() - interval '12 hours');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'When this happens, the Waters Rise card is revealed immediately, triggering the flood/storm phase. The player then continues drawing until they have the required number of cards. This can create exciting moments where a Draw 4 card forces multiple flood phases!', comment_id, NOW() - interval '6 hours');

    -- Mysterium Park: Clue Edition
    remix_id := gen_random_uuid();
    user_id := get_random_user_id();
    
    INSERT INTO remixes (
        id, title, description, user_id, created_at, updated_at,
        difficulty, min_players, max_players, min_duration, max_duration
    ) VALUES (
        remix_id,
        'Mysterium Park: Clue Edition',
        'Combines Mysterium and Clue with Cards Against Humanity for a humorous twist. The ghost communicates through surreal vision cards while Cards Against Humanity cards create bizarre backstories and motives for the murder.',
        user_id,
        NOW() - interval '4 hours',
        NOW() - interval '4 hours',
        3,
        4,
        7,
        60,
        60
    );

    -- Add tags for Mysterium Park: Clue Edition
    INSERT INTO remix_tags (remix_id, tag_name) VALUES
    (remix_id, 'cooperative'),
    (remix_id, 'party'),
    (remix_id, 'medium'),
    (remix_id, 'horror');

    -- Add games for Mysterium Park: Clue Edition
    INSERT INTO remix_games (remix_id, game_id, game_name, bgg_id) VALUES
    (remix_id, gen_random_uuid(), 'Mysterium', 181304),
    (remix_id, gen_random_uuid(), 'Clue', 1294),
    (remix_id, gen_random_uuid(), 'Cards Against Humanity', 50381);

    -- Add clarifying comment and answer
    comment_id := gen_random_uuid();
    INSERT INTO comments (id, remix_id, user_id, content, created_at) VALUES
    (comment_id, remix_id, get_random_user_id(), 'How do you handle potentially inappropriate Cards Against Humanity cards in a family setting?', NOW() - interval '2 hours');

    INSERT INTO comments (id, remix_id, user_id, content, parent_id, created_at) VALUES
    (gen_random_uuid(), remix_id, user_id, 'For family play, you can use the "Family Edition" of Cards Against Humanity, or create your own deck of silly but appropriate cards. Alternatively, use Dixit cards for a more whimsical but still family-friendly experience.', comment_id, NOW() - interval '1 hour');

    -- Add final batch of random votes
    INSERT INTO votes (remix_id, user_id, value)
    SELECT r.id, p.id, 
        CASE 
            WHEN random() < 0.8 THEN 1  -- 80% positive votes
            ELSE -1                     -- 20% negative votes
        END
    FROM remixes r
    CROSS JOIN profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM votes v 
        WHERE v.remix_id = r.id AND v.user_id = p.id
    );

END$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_remix_tags_remix_id ON remix_tags(remix_id);
CREATE INDEX IF NOT EXISTS idx_remix_games_remix_id ON remix_games(remix_id);
CREATE INDEX IF NOT EXISTS idx_votes_remix_id ON votes(remix_id);
CREATE INDEX IF NOT EXISTS idx_comments_remix_id ON comments(remix_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id); 