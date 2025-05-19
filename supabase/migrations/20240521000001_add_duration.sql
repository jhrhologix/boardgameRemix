-- Add duration column to remixes table
ALTER TABLE remixes
ADD COLUMN IF NOT EXISTS duration INTEGER CHECK (duration > 0);

-- Add comment to explain the column
COMMENT ON COLUMN remixes.duration IS 'Duration of the remix in minutes';

-- Update existing remixes to have a default duration of 30 minutes
UPDATE remixes SET duration = 30 WHERE duration IS NULL; 