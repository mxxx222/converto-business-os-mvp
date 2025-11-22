CREATE TABLE IF NOT EXISTS public.beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  monthly_invoices TEXT DEFAULT '1-50',
  weekly_feedback_ok BOOLEAN DEFAULT false,
  start_timeline TEXT DEFAULT 'Within 1 month',
  document_types JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON public.beta_signups(status);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON public.beta_signups(created_at DESC);

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public beta signup inserts"
  ON public.beta_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read beta signups"
  ON public.beta_signups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update beta signups"
  ON public.beta_signups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_beta_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_beta_signups_updated_at
  BEFORE UPDATE ON public.beta_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_signups_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.beta_signups;

