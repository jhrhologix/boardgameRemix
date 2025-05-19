-- Insert users into auth.users and public.profiles
DO $$
DECLARE
    user_id uuid;
    username text;
BEGIN
    -- Array of usernames
    FOR username IN (
        SELECT unnest(ARRAY[
            'Meeplemaster',
            'DiceMaiden',
            'StrategyLord',
            'CardShuffler',
            'BoardwalkEmpress',
            'TokenKeeper',
            'RollMaster',
            'TilePlacer',
            'VictoryPointHunter',
            'ResourceGatherer',
            'GameMechanist',
            'TableTopTitan',
            'CubeQueen',
            'DeckBuilder',
            'AnalysisParalysis',
            'MoveOptimizer',
            'RulebookSage',
            'WorkerPlacer',
            'ChitCollector',
            'HexNavigator',
            'CardSleever',
            'DiceWhisperer',
            'TokenCrafter',
            'StrategySeeker',
            'BoardGameBard',
            'MeepleShepherd',
            'ResourceBaron',
            'TurnTracker',
            'VictoryCounter',
            'GameTheoriest',
            'TableFlipper',
            'CubeKing',
            'DeckShuffler',
            'ActionSelector',
            'MoveCalculator',
            'RulebookScribe',
            'WorkerManager',
            'ChitSorter',
            'HexExplorer',
            'CardProtector',
            'DiceRoller',
            'TokenMaster',
            'StrategyWizard',
            'BoardGameSage',
            'MeepleKeeper',
            'ResourceTrader',
            'TurnMaster',
            'VictorySeeker',
            'GamePhilosopher',
            'TableGuardian',
            'CubeMaster',
            'DeckMaster',
            'ActionOptimizer',
            'MovePlanner',
            'RulebookMaster',
            'WorkerOptimizer',
            'ChitMaster',
            'HexMaster',
            'CardMaster',
            'DiceMaster',
            'TokenSage',
            'StrategyMaster',
            'BoardGameMaster',
            'MeepleWizard',
            'ResourceMaster',
            'TurnWizard',
            'VictoryMaster',
            'GameMaster',
            'TableMaster',
            'CubeWizard',
            'DeckWizard',
            'ActionMaster',
            'MoveWizard',
            'RulebookWizard',
            'WorkerWizard',
            'ChitWizard',
            'HexWizard',
            'CardWizard',
            'DiceWizard',
            'TokenWizard',
            'StrategyGuru',
            'BoardGameGuru',
            'MeepleGuru',
            'ResourceGuru',
            'TurnGuru',
            'VictoryGuru',
            'GameGuru',
            'TableGuru',
            'CubeGuru',
            'DeckGuru',
            'ActionGuru',
            'MoveGuru',
            'RulebookGuru',
            'WorkerGuru',
            'ChitGuru',
            'HexGuru',
            'CardGuru',
            'DiceGuru',
            'TokenGuru',
            'StrategyNinja',
            'BoardGameNinja',
            'MeepleNinja',
            'ResourceNinja',
            'TurnNinja'
        ])
    )
    LOOP
        -- Generate UUID for each user
        user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            user_id,
            '00000000-0000-0000-0000-000000000000',
            lower(username) || '@example.com',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('username', username),
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        -- Insert into public.profiles
        INSERT INTO public.profiles (
            id,
            username,
            bio,
            avatar_url,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            username,
            'Passionate board game enthusiast and strategy lover.',
            null,
            now(),
            now()
        );
        
        RAISE NOTICE 'Created user: %', username;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 