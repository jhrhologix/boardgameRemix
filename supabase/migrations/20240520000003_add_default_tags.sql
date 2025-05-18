-- Ensure tags table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tags') THEN
        CREATE TABLE IF NOT EXISTS tags (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
    END IF;
END $$;

-- Insert default tags for board game remixes
INSERT INTO tags (name) VALUES
  -- Game Types
  ('strategy'),
  ('party'),
  ('family'),
  ('dexterity'),
  ('card'),
  ('dice'),
  ('miniatures'),
  ('cooperative'),
  ('competitive'),
  ('solo'),
  
  -- Player Count
  ('2-player'),
  ('4-player'),
  ('6-player'),
  ('large-group'),
  
  -- Game Length
  ('quick'),
  ('medium'),
  ('long'),
  ('filler'),
  
  -- Complexity
  ('beginner-friendly'),
  ('casual'),
  ('complex'),
  ('hardcore'),
  
  -- Mechanics
  ('deck-building'),
  ('worker-placement'),
  ('area-control'),
  ('drafting'),
  ('tile-laying'),
  ('hand-management'),
  ('resource-management'),
  ('trading'),
  ('negotiation'),
  ('bluffing'),
  
  -- Themes
  ('fantasy'),
  ('sci-fi'),
  ('historical'),
  ('economic'),
  ('adventure'),
  ('war'),
  ('civilization'),
  ('horror'),
  
  -- Experience
  ('social'),
  ('thinky'),
  ('luck-based'),
  ('skill-based'),
  ('storytelling'),
  ('puzzle'),
  ('memory'),
  ('real-time'),
  
  -- Remix Specific
  ('mashup'),
  ('variant'),
  ('house-rule'),
  ('expansion'),
  ('simplified'),
  ('enhanced'),
  ('kid-friendly'),
  ('party-variant'),
  ('tournament'),
  ('teaching-tool')
ON CONFLICT (name) DO NOTHING; 