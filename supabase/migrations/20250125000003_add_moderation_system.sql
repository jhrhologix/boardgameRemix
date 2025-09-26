-- Add user roles and AI moderation system
-- This migration adds user roles, moderation queue, and AI analysis tracking

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Create moderation queue table
CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('remix', 'comment', 'edit')),
    content_id UUID NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_data JSONB NOT NULL, -- Store the actual content being moderated
    ai_analysis JSONB, -- Store AI analysis results
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create user flagging history table
CREATE TABLE IF NOT EXISTS public.user_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('spam', 'promotional', 'low_quality', 'ai_generated', 'inappropriate')),
    content_id UUID,
    content_type TEXT,
    flag_count INTEGER DEFAULT 1,
    last_flagged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create AI analysis results table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    analysis_data JSONB NOT NULL, -- Store the full AI analysis response
    content_score INTEGER CHECK (content_score >= 0 AND content_score <= 100),
    decision TEXT CHECK (decision IN ('APPROVE', 'REVIEW', 'REJECT')),
    spam_risk TEXT CHECK (spam_risk IN ('LOW', 'MEDIUM', 'HIGH')),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10),
    ai_detected BOOLEAN DEFAULT FALSE,
    anthropic_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content_type ON public.moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON public.moderation_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_user_flags_user_id ON public.user_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flags_flag_type ON public.user_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_content_id ON public.ai_analysis(content_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_decision ON public.ai_analysis(decision);

-- Enable RLS on new tables
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for moderation_queue
CREATE POLICY "Admins and moderators can view all moderation queue items" ON public.moderation_queue
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins and moderators can update moderation queue items" ON public.moderation_queue
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Create RLS policies for user_flags
CREATE POLICY "Admins and moderators can view user flags" ON public.user_flags
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can insert user flags" ON public.user_flags
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Create RLS policies for ai_analysis
CREATE POLICY "Admins and moderators can view AI analysis" ON public.ai_analysis
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can insert AI analysis" ON public.ai_analysis
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.moderation_queue TO authenticated;
GRANT SELECT, INSERT ON public.user_flags TO authenticated;
GRANT SELECT, INSERT ON public.ai_analysis TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_moderation_queue_updated_at 
    BEFORE UPDATE ON public.moderation_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_flags_updated_at 
    BEFORE UPDATE ON public.user_flags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you'll need to replace with actual admin user ID)
-- This is a placeholder - you should manually set admin roles in Supabase dashboard
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-admin-user-id-here';
