-- DocFlow Beta Feedback Table Schema
-- Run this script in your Supabase SQL Editor to set up the beta_feedback table

-- ============================================
-- Beta Feedback Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  satisfaction_score INTEGER NOT NULL CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
  nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
  whats_working TEXT,
  improvements TEXT,
  feature_requests TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON public.beta_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_satisfaction ON public.beta_feedback(satisfaction_score);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_nps ON public.beta_feedback(nps_score);

-- ============================================
-- Enable Realtime
-- ============================================
-- Enable Realtime for beta_feedback table (for admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.beta_feedback;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Enable RLS on beta_feedback table
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own feedback
CREATE POLICY "Users can read their own feedback"
  ON public.beta_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.beta_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users (admins) can read all feedback
CREATE POLICY "Authenticated users can read all feedback"
  ON public.beta_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- Functions
-- ============================================
-- Function to calculate NPS from feedback
CREATE OR REPLACE FUNCTION calculate_nps()
RETURNS TABLE (
  promoters INTEGER,
  detractors INTEGER,
  passives INTEGER,
  nps_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE nps_score >= 9)::INTEGER as promoters,
    COUNT(*) FILTER (WHERE nps_score <= 6)::INTEGER as detractors,
    COUNT(*) FILTER (WHERE nps_score IN (7, 8))::INTEGER as passives,
    ROUND(
      (COUNT(*) FILTER (WHERE nps_score >= 9)::NUMERIC / NULLIF(COUNT(*), 0) * 100) -
      (COUNT(*) FILTER (WHERE nps_score <= 6)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
      2
    ) as nps_score
  FROM beta_feedback
  WHERE created_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Verification
-- ============================================
-- Verify table exists
SELECT
  'beta_feedback' as table_name,
  COUNT(*) as row_count
FROM public.beta_feedback;

-- Verify Realtime is enabled
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'beta_feedback';

