-- Create remixes table
CREATE TABLE remixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL
);

-- Create remix_tags junction table
CREATE TABLE remix_tags (
  remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (remix_id, tag_id)
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (remix_id, user_id)
);

-- Create favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_id UUID REFERENCES remixes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (remix_id, user_id)
);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_count(remix_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE remixes
  SET 
    upvotes = (SELECT COUNT(*) FROM votes WHERE remix_id = remix_id_param AND vote_type = 'upvote'),
    downvotes = (SELECT COUNT(*) FROM votes WHERE remix_id = remix_id_param AND vote_type = 'downvote')
  WHERE id = remix_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update vote counts automatically
CREATE OR REPLACE FUNCTION trigger_update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_vote_count(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.remix_id
      ELSE NEW.remix_id
    END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER votes_after_insert_update_delete
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION trigger_update_vote_count();

-- Create RLS policies
ALTER TABLE remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Everyone can read remixes, tags, and remix_tags
CREATE POLICY "Anyone can read remixes" ON remixes FOR SELECT USING (true);
CREATE POLICY "Anyone can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Anyone can read remix_tags" ON remix_tags FOR SELECT USING (true);

-- Only authenticated users can create/update/delete their own remixes
CREATE POLICY "Users can create their own remixes" ON remixes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own remixes" ON remixes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own remixes" ON remixes FOR DELETE USING (auth.uid() = user_id);

-- Only authenticated users can vote, and they can only vote once per remix
CREATE POLICY "Users can read votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Only authenticated users can favorite remixes
CREATE POLICY "Users can read their favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
