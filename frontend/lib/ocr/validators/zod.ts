import { z } from "zod";

export const ocrResultSchema = z.object({
  id: z.string().uuid(),
  receipt_id: z.string().uuid(),
  tenant_id: z.string(),
  status: z.string(),
  raw_text: z.string().nullable(),
  data: z.record(z.any()).nullable(),
  confidence: z.coerce.number().nullable(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const receiptSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string(),
  external_id: z.string().max(128).nullable(),
  file_name: z.string().min(1).max(255),
  storage_path: z.string().min(1).max(512),
  content_type: z.string().max(64).nullable(),
  total_amount: z.coerce.number().nullable(),
  currency: z.string().length(3),
  status: z.string(),
  issued_at: z.string().nullable(),
  processed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  ocr_result: ocrResultSchema.nullable(),
});

export const receiptListSchema = z.array(receiptSchema);

export const receiptCreateSchema = z.object({
  external_id: z.string().max(128).optional(),
  file_name: z.string().min(1).max(255),
  storage_path: z.string().min(1).max(512),
  content_type: z.string().max(64).optional(),
  total_amount: z.coerce.number().optional(),
  currency: z.string().length(3).default("EUR"),
  status: z.string().optional(),
  issued_at: z.string().optional(),
  processed_at: z.string().optional(),
});

export const receiptUpdateSchema = receiptCreateSchema.partial();

export type ReceiptCreateInput = z.infer<typeof receiptCreateSchema>;
export type ReceiptUpdateInput = z.infer<typeof receiptUpdateSchema>;
export type ReceiptOutput = z.infer<typeof receiptSchema>;
export type OcrResultOutput = z.infer<typeof ocrResultSchema>;
