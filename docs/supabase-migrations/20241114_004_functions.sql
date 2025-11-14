-- Migration: Helper functions for document processing
-- Created: 2024-11-14
-- Description: Utility functions for document and VAT analysis

-- Function to get document statistics for a user
CREATE OR REPLACE FUNCTION get_user_document_stats(user_uuid UUID)
RETURNS TABLE (
    total_documents BIGINT,
    total_receipts BIGINT,
    total_invoices BIGINT,
    processing_documents BIGINT,
    completed_documents BIGINT,
    failed_documents BIGINT,
    total_amount_sum DECIMAL,
    total_vat_sum DECIMAL,
    avg_ocr_confidence FLOAT,
    fallback_usage_rate FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_documents,
        COUNT(*) FILTER (WHERE document_type = 'receipt')::BIGINT as total_receipts,
        COUNT(*) FILTER (WHERE document_type = 'invoice')::BIGINT as total_invoices,
        COUNT(*) FILTER (WHERE status = 'processing')::BIGINT as processing_documents,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_documents,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_documents,
        COALESCE(SUM(total_amount), 0) as total_amount_sum,
        COALESCE(SUM(vat_amount), 0) as total_vat_sum,
        COALESCE(AVG(ocr_confidence), 0) as avg_ocr_confidence,
        COALESCE(
            COUNT(*) FILTER (WHERE fallback_used = true)::FLOAT / NULLIF(COUNT(*)::FLOAT, 0),
            0
        ) as fallback_usage_rate
    FROM documents
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search documents by vendor or Y-tunnus
CREATE OR REPLACE FUNCTION search_documents(
    user_uuid UUID,
    search_query TEXT,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    document_type TEXT,
    status TEXT,
    vendor TEXT,
    y_tunnus TEXT,
    total_amount DECIMAL,
    document_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    ocr_confidence FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.file_name,
        d.document_type,
        d.status,
        d.vendor,
        d.y_tunnus,
        d.total_amount,
        d.document_date,
        d.created_at,
        d.ocr_confidence
    FROM documents d
    WHERE d.user_id = user_uuid
    AND (
        d.vendor ILIKE '%' || search_query || '%'
        OR d.y_tunnus ILIKE '%' || search_query || '%'
        OR d.file_name ILIKE '%' || search_query || '%'
    )
    ORDER BY d.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get VAT summary by rate
CREATE OR REPLACE FUNCTION get_vat_summary_by_rate(
    user_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    vat_rate DECIMAL,
    vat_percentage TEXT,
    document_count BIGINT,
    total_net_amount DECIMAL,
    total_vat_amount DECIMAL,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.vat_rate,
        (d.vat_rate || '%')::TEXT as vat_percentage,
        COUNT(*)::BIGINT as document_count,
        COALESCE(SUM(d.net_amount), 0) as total_net_amount,
        COALESCE(SUM(d.vat_amount), 0) as total_vat_amount,
        COALESCE(SUM(d.total_amount), 0) as total_amount
    FROM documents d
    WHERE d.user_id = user_uuid
    AND d.status = 'completed'
    AND (start_date IS NULL OR d.document_date >= start_date)
    AND (end_date IS NULL OR d.document_date <= end_date)
    AND d.vat_rate IS NOT NULL
    GROUP BY d.vat_rate
    ORDER BY d.vat_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly document statistics
CREATE OR REPLACE FUNCTION get_monthly_document_stats(
    user_uuid UUID,
    months_back INTEGER DEFAULT 12
)
RETURNS TABLE (
    month DATE,
    document_count BIGINT,
    total_amount DECIMAL,
    total_vat DECIMAL,
    avg_confidence FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('month', d.document_date)::DATE as month,
        COUNT(*)::BIGINT as document_count,
        COALESCE(SUM(d.total_amount), 0) as total_amount,
        COALESCE(SUM(d.vat_amount), 0) as total_vat,
        COALESCE(AVG(d.ocr_confidence), 0) as avg_confidence
    FROM documents d
    WHERE d.user_id = user_uuid
    AND d.status = 'completed'
    AND d.document_date >= CURRENT_DATE - INTERVAL '1 month' * months_back
    AND d.document_date IS NOT NULL
    GROUP BY DATE_TRUNC('month', d.document_date)
    ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION get_user_document_stats IS 'Get comprehensive document statistics for a user';
COMMENT ON FUNCTION search_documents IS 'Full-text search for documents by vendor, Y-tunnus, or filename';
COMMENT ON FUNCTION get_vat_summary_by_rate IS 'Get VAT summary grouped by rate for a date range';
COMMENT ON FUNCTION get_monthly_document_stats IS 'Get monthly document statistics for analytics dashboard';

