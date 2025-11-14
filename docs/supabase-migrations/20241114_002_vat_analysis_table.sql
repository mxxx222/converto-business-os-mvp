-- Migration: Create VAT analysis table
-- Created: 2024-11-14
-- Description: Stores detailed Finnish VAT analysis results

-- Create vat_analysis table
CREATE TABLE IF NOT EXISTS vat_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    
    -- Y-tunnus analysis
    y_tunnus TEXT,
    y_tunnus_valid BOOLEAN,
    y_tunnus_formatted TEXT,
    company_name TEXT,
    company_info JSONB, -- PRH data
    
    -- VAT rate analysis
    detected_vat_rate DECIMAL(5, 2),
    expected_vat_rate DECIMAL(5, 2),
    vat_rate_name TEXT, -- GENERAL, FOOD, BOOKS, EXEMPT
    rate_matches_vendor BOOLEAN,
    
    -- VAT calculation validation
    calculation_valid BOOLEAN,
    calculation_errors JSONB,
    calculation_warnings JSONB,
    
    -- Item-level VAT breakdown
    items_vat_breakdown JSONB,
    
    -- Suggestions and corrections
    suggestions JSONB,
    auto_corrections JSONB,
    
    -- Metadata
    analysis_version TEXT DEFAULT '1.0',
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vat_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from documents)

-- Users can view VAT analysis for their own documents
CREATE POLICY "Users can view own vat analysis" 
    ON vat_analysis FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = vat_analysis.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- Users can insert VAT analysis for their own documents
CREATE POLICY "Users can insert own vat analysis" 
    ON vat_analysis FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = vat_analysis.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- Users can update VAT analysis for their own documents
CREATE POLICY "Users can update own vat analysis" 
    ON vat_analysis FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = vat_analysis.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX idx_vat_analysis_document_id ON vat_analysis(document_id);
CREATE INDEX idx_vat_analysis_y_tunnus ON vat_analysis(y_tunnus) WHERE y_tunnus IS NOT NULL;
CREATE INDEX idx_vat_analysis_created_at ON vat_analysis(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_vat_analysis_updated_at 
    BEFORE UPDATE ON vat_analysis
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE vat_analysis IS 'Detailed Finnish VAT intelligence analysis for documents';
COMMENT ON COLUMN vat_analysis.y_tunnus_valid IS 'Whether Y-tunnus passes format and checksum validation';
COMMENT ON COLUMN vat_analysis.company_info IS 'Company information from PRH Avoin Data API';
COMMENT ON COLUMN vat_analysis.items_vat_breakdown IS 'VAT breakdown by rate for all line items';
COMMENT ON COLUMN vat_analysis.suggestions IS 'Automated suggestions for corrections';

