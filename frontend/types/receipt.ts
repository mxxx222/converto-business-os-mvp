/**
 * Receipt type definition for Supabase receipts table.
 */
export interface Receipt {
  status?: string;
  id: string;
  vendor?: string | null;
  total_amount?: number | null;
  vat_amount?: number | null;
  net_amount?: number | null;
  category?: string | null;
  date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  image_url?: string | null;
  ocr_confidence?: number | null;
}
