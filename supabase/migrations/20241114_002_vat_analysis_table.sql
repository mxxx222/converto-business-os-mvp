-- Create vat_analysis table for VEROPILOT-AI
CREATE TABLE IF NOT EXISTS vat_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    y_tunnus TEXT,
    company_info JSONB,
    line_items JSONB,
    total_vat_deductible FLOAT,
    suggested_booking JSONB,
    vat_confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vat_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own vat_analysis"
    ON vat_analysis FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vat_analysis"
    ON vat_analysis FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vat_analysis"
    ON vat_analysis FOR UPDATE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vat_analysis_document_id ON vat_analysis(document_id);
CREATE INDEX IF NOT EXISTS idx_vat_analysis_user_id ON vat_analysis(user_id);

-- Updated_at trigger
CREATE TRIGGER update_vat_analysis_updated_at
    BEFORE UPDATE ON vat_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
