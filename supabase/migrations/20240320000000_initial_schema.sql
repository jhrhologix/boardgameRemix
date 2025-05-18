-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE game_category AS ENUM ('strategy', 'party', 'family', 'card', 'dice', 'other');

-- Enable Row Level Security
ALTER DATABASE postgres SET "auth.enable_row_level_security" = on;

-- Create tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.original_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    publisher TEXT,
    description TEXT,
    min_players INTEGER,
    max_players INTEGER,
    avg_play_time INTEGER,
    category game_category,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.remixes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_game_id UUID REFERENCES public.original_games ON DELETE CASCADE,
    creator_id UUID REFERENCES public.profiles ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rules TEXT NOT NULL,
    difficulty difficulty_level,
    min_players INTEGER,
    max_players INTEGER,
    avg_play_time INTEGER,
    materials_needed TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
    remix_id UUID REFERENCES public.remixes ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, remix_id)
);

CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
    remix_id UUID REFERENCES public.remixes ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, remix_id)
);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.original_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view games" ON public.original_games
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert games" ON public.original_games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view remixes" ON public.remixes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create remixes" ON public.remixes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own remixes" ON public.remixes
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own remixes" ON public.remixes
    FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage their favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their ratings" ON public.ratings
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS remixes_original_game_id_idx ON public.remixes(original_game_id);
CREATE INDEX IF NOT EXISTS remixes_creator_id_idx ON public.remixes(creator_id);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_remix_id_idx ON public.favorites(remix_id);
CREATE INDEX IF NOT EXISTS ratings_remix_id_idx ON public.ratings(remix_id); 