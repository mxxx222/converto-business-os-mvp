-- Utility functions for VEROPILOT-AI

-- Function to update document status
CREATE OR REPLACE FUNCTION update_document_status(doc_id UUID, new_status TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE documents
    SET status = new_status, updated_at = NOW()
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get document statistics for a user
CREATE OR REPLACE FUNCTION get_user_document_stats(p_user_id UUID)
RETURNS TABLE (
    total_documents BIGINT,
    completed_documents BIGINT,
    total_vat_deductible NUMERIC,
    avg_confidence NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(d.id)::BIGINT as total_documents,
        COUNT(CASE WHEN d.status = 'completed' THEN 1 END)::BIGINT as completed_documents,
        COALESCE(SUM(v.total_vat_deductible), 0)::NUMERIC as total_vat_deductible,
        COALESCE(AVG(d.ocr_confidence), 0)::NUMERIC as avg_confidence
    FROM documents d
    LEFT JOIN vat_analysis v ON d.id = v.document_id
    WHERE d.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_document_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_document_stats TO authenticated;
