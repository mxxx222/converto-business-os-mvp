/**
 * Document API client for Vercel serverless endpoints
 */

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  content_type: string;
  document_type: 'receipt' | 'invoice' | 'unknown';
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'approved' | 'rejected';
  ocr_confidence?: number;
  ocr_provider?: 'gpt-4o-mini' | 'gpt-4o';
  fallback_used?: boolean;
  extracted_data?: any;
  vendor?: string;
  y_tunnus?: string;
  total_amount?: number;
  vat_amount?: number;
  vat_rate?: number;
  net_amount?: number;
  currency?: string;
  document_date?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VATAnalysis {
  id: string;
  document_id: string;
  y_tunnus?: string;
  y_tunnus_valid?: boolean;
  y_tunnus_formatted?: string;
  company_name?: string;
  company_info?: any;
  detected_vat_rate?: number;
  expected_vat_rate?: number;
  vat_rate_name?: string;
  rate_matches_vendor?: boolean;
  calculation_valid?: boolean;
  calculation_errors?: any[];
  calculation_warnings?: any[];
  items_vat_breakdown?: any;
  suggestions?: any[];
  analyzed_at: string;
}

export interface DocumentWithAnalysis {
  document: Document;
  vat_analysis: VATAnalysis | null;
}

export interface UploadResponse {
  success: boolean;
  document: {
    id: string;
    status: string;
    file_name: string;
    created_at: string;
  };
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface DocumentStats {
  overview: {
    total_documents: number;
    total_receipts: number;
    total_invoices: number;
    processing_documents: number;
    completed_documents: number;
    failed_documents: number;
    total_amount_sum: number;
    total_vat_sum: number;
    avg_ocr_confidence: number;
    fallback_usage_rate: number;
  };
  vat_summary: Array<{
    vat_rate: number;
    vat_percentage: string;
    document_count: number;
    total_net_amount: number;
    total_vat_amount: number;
    total_amount: number;
  }>;
  monthly_stats: Array<{
    month: string;
    document_count: number;
    total_amount: number;
    total_vat: number;
    avg_confidence: number;
  }>;
}

/**
 * Upload a document for OCR processing
 */
export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

/**
 * Get document by ID with VAT analysis
 */
export async function getDocument(id: string): Promise<DocumentWithAnalysis> {
  const response = await fetch(`/api/documents/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get document');
  }

  return response.json();
}

/**
 * Get document processing status
 */
export async function getDocumentStatus(id: string): Promise<{
  id: string;
  status: string;
  ocr_confidence?: number;
  ocr_provider?: string;
  fallback_used?: boolean;
  processed_at?: string;
  is_processing: boolean;
  is_completed: boolean;
  is_failed: boolean;
}> {
  const response = await fetch(`/api/documents/${id}/status`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get status');
  }

  return response.json();
}

/**
 * Update document
 */
export async function updateDocument(
  id: string,
  updates: Partial<Document>
): Promise<{ document: Document }> {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update document');
  }

  return response.json();
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete document');
  }

  return response.json();
}

/**
 * List documents with filters
 */
export async function listDocuments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  document_type?: string;
  search?: string;
}): Promise<DocumentListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  if (params?.status) searchParams.append('status', params.status);
  if (params?.document_type) searchParams.append('document_type', params.document_type);
  if (params?.search) searchParams.append('search', params.search);

  const response = await fetch(`/api/documents/list?${searchParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list documents');
  }

  return response.json();
}

/**
 * Get document statistics
 */
export async function getDocumentStats(): Promise<DocumentStats> {
  const response = await fetch('/api/documents/stats');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get statistics');
  }

  return response.json();
}

/**
 * Poll document status until completed or failed
 */
export async function pollDocumentStatus(
  id: string,
  onUpdate?: (status: any) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getDocumentStatus(id);
    
    if (onUpdate) {
      onUpdate(status);
    }
    
    if (status.is_completed || status.is_failed) {
      return status;
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error('Processing timeout');
}

