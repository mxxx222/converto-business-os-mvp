-- Migration: Create documents table for receipt and invoice OCR
-- Created: 2024-11-14
-- Description: Core documents table with Finnish VAT support

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- File information
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INTEGER,
    content_type TEXT,
    
    -- Document type and status
    document_type TEXT CHECK (document_type IN ('receipt', 'invoice', 'unknown')) DEFAULT 'unknown',
    status TEXT CHECK (status IN ('uploading', 'processing', 'completed', 'failed', 'approved', 'rejected')) DEFAULT 'uploading',
    
    -- OCR results
    ocr_confidence FLOAT,
    ocr_provider TEXT, -- 'gpt-4o-mini' or 'gpt-4o'
    fallback_used BOOLEAN DEFAULT FALSE,
    extracted_data JSONB,
    
    -- Financial data
    vendor TEXT,
    y_tunnus TEXT,
    total_amount DECIMAL(10, 2),
    vat_amount DECIMAL(10, 2),
    vat_rate DECIMAL(5, 2),
    net_amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'EUR',
    
    -- Dates
    document_date DATE,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own documents
CREATE POLICY "Users can view own documents" 
    ON documents FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents" 
    ON documents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents" 
    ON documents FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents" 
    ON documents FOR DELETE 
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_document_date ON documents(document_date DESC) WHERE document_date IS NOT NULL;
CREATE INDEX idx_documents_y_tunnus ON documents(y_tunnus) WHERE y_tunnus IS NOT NULL;
CREATE INDEX idx_documents_vendor ON documents(vendor) WHERE vendor IS NOT NULL;

-- Full-text search index on vendor
CREATE INDEX idx_documents_vendor_fts ON documents USING gin(to_tsvector('finnish', vendor)) WHERE vendor IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE documents IS 'Stores receipts and invoices with OCR and VAT analysis';
COMMENT ON COLUMN documents.ocr_provider IS 'Which OpenAI model was used: gpt-4o-mini or gpt-4o';
COMMENT ON COLUMN documents.fallback_used IS 'Whether gpt-4o fallback was triggered due to low confidence';
COMMENT ON COLUMN documents.y_tunnus IS 'Finnish business ID (Y-tunnus) in format 1234567-8';
COMMENT ON COLUMN documents.vat_rate IS 'VAT rate as decimal (e.g., 24.00 for 24%)';

