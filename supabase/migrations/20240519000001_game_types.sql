-- Create game_types enum
CREATE TYPE game_type AS ENUM (
  'strategy',
  'luck',
  'skill',
  'combat',
  'social',
  'time',
  'coop'
);

-- Create game_types table
CREATE TABLE game_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name game_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create junction table for games and their types
CREATE TABLE bgg_game_types (
  game_id UUID REFERENCES bgg_games(id) ON DELETE CASCADE,
  type_id UUID REFERENCES game_types(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, type_id)
);

-- Enable RLS
ALTER TABLE game_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bgg_game_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read game_types" ON game_types
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read bgg_game_types" ON bgg_game_types
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage bgg_game_types" ON bgg_game_types
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default game types
INSERT INTO game_types (name) VALUES
  ('strategy'),
  ('luck'),
  ('skill'),
  ('combat'),
  ('social'),
  ('time'),
  ('coop');

-- Add function to get game types
CREATE OR REPLACE FUNCTION get_game_types(game_id UUID)
RETURNS SETOF game_type AS $$
BEGIN
  RETURN QUERY
  SELECT gt.name
  FROM game_types gt
  JOIN bgg_game_types bgt ON gt.id = bgt.type_id
  WHERE bgt.game_id = game_id;
END;
$$ LANGUAGE plpgsql; 