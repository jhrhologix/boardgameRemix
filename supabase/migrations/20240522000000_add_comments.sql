-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false
);

-- Create index for faster comment lookups
CREATE INDEX comments_remix_id_idx ON comments(remix_id);
CREATE INDEX comments_parent_id_idx ON comments(parent_id);

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
-- Everyone can read comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

-- Only authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Remix owners can update any comment on their remixes (for pinning/resolving)
CREATE POLICY "Remix owners can update comments" ON comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM remixes
      WHERE remixes.id = comments.remix_id
      AND remixes.user_id = auth.uid()
    )
  ); 