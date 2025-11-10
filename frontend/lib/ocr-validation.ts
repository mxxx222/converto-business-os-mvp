import { z } from "zod";

// Document types
export const DocumentType = {
  RECEIPT: 'receipt',
  INVOICE: 'invoice',
  CONTRACT: 'contract',
  UNKNOWN: 'unknown'
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

// Document status
export const DocumentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  ERROR: 'error',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type DocumentStatus = typeof DocumentStatus[keyof typeof DocumentStatus];

// Extended OCR result schema for documents
export const documentOcrResultSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string(),
  file_name: z.string(),
  storage_path: z.string(),
  content_type: z.string().nullable(),
  file_size: z.number().nullable(),
  document_type: z.string(),
  status: z.string(),
  ocr_confidence: z.number().nullable(),
  extracted_data: z.record(z.any()).nullable(),
  raw_ocr_text: z.string().nullable(),
  vendor: z.string().nullable(),
  total_amount: z.number().nullable(),
  vat_amount: z.number().nullable(),
  vat_rate: z.number().nullable(),
  currency: z.string().default("EUR"),
  document_date: z.string().nullable(),
  due_date: z.string().nullable(),
  processed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Editable fields schema
export const editableDocumentSchema = z.object({
  vendor: z.string().min(1, "Myyjä on pakollinen").max(255),
  total_amount: z.number().min(0, "Summa ei voi olla negatiivinen"),
  vat_amount: z.number().min(0, "ALV ei voi olla negatiivinen").optional(),
  vat_rate: z.number().min(0).max(100, "ALV-prosentti ei voi olla yli 100%").optional(),
  document_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Päivämäärä tulee olla muodossa YYYY-MM-DD"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Eräpäivä tulee olla muodossa YYYY-MM-DD").optional(),
  status: z.enum(['pending', 'processing', 'processed', 'error', 'approved', 'rejected']),
});

export type DocumentOcrResult = z.infer<typeof documentOcrResultSchema>;
export type EditableDocument = z.infer<typeof editableDocumentSchema>;

// Validation helpers
export const validateAmount = (amount: string): { isValid: boolean; error?: string; value?: number } => {
  const numericValue = parseFloat(amount.replace(',', '.'));
  
  if (isNaN(numericValue)) {
    return { isValid: false, error: "Syötä kelvollinen numero" };
  }
  
  if (numericValue < 0) {
    return { isValid: false, error: "Summa ei voi olla negatiivinen" };
  }
  
  return { isValid: true, value: numericValue };
};

export const validateDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: "Päivämäärä on pakollinen" };
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { isValid: false, error: "Päivämäärä tulee olla muodossa YYYY-MM-DD" };
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: "Virheellinen päivämäärä" };
  }
  
  return { isValid: true };
};

export const validateVendor = (vendor: string): { isValid: boolean; error?: string } => {
  if (!vendor || vendor.trim().length === 0) {
    return { isValid: false, error: "Myyjä on pakollinen" };
  }
  
  if (vendor.length > 255) {
    return { isValid: false, error: "Myyjän nimi on liian pitkä (max 255 merkkiä)" };
  }
  
  return { isValid: true };
};

// Confidence level helpers
export const getConfidenceLevel = (confidence: number | null): 'low' | 'medium' | 'high' => {
  if (!confidence) return 'low';
  if (confidence < 0.6) return 'low';
  if (confidence < 0.8) return 'medium';
  return 'high';
};

export const getConfidenceColor = (confidence: number | null): string => {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'low': return 'text-red-600 bg-red-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'high': return 'text-green-600 bg-green-50';
  }
};

export const getConfidenceText = (confidence: number | null): string => {
  if (!confidence) return 'Tuntematon';
  const percentage = Math.round(confidence * 100);
  const level = getConfidenceLevel(confidence);
  
  switch (level) {
    case 'low': return `${percentage}% - Matala luotettavuus`;
    case 'medium': return `${percentage}% - Keskitasoinen luotettavuus`;
    case 'high': return `${percentage}% - Korkea luotettavuus`;
  }
};

// Format helpers
export const formatCurrency = (amount: number | null, currency: string = 'EUR'): string => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fi-FI').format(date);
  } catch {
    return dateString;
  }
};

export const formatPercentage = (rate: number | null): string => {
  if (rate === null || rate === undefined) return '-';
  return `${rate}%`;
};
