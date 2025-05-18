-- Add setup_instructions column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'remixes' 
        AND column_name = 'setup_instructions'
    ) THEN
        ALTER TABLE remixes 
        ADD COLUMN setup_instructions TEXT NOT NULL DEFAULT '';
    END IF;
END $$; 