import { createClient } from '@/lib/supabase/client';

export interface Receipt {
  id: string;
  filename?: string;
  amount: number;
  currency: string;
  date?: string;
  category?: string;
  status: 'pending' | 'processed' | 'error';
  vat_amount: number;
  created_at: string;
}

export interface ReceiptsResponse {
  receipts: Receipt[];
  total: number;
  skip: number;
  limit: number;
}

export async function fetchReceipts(
  skip: number = 0,
  limit: number = 50,
  status?: string
): Promise<ReceiptsResponse> {
  try {
    const supabase = createClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await fetch(`/api/v1/receipts?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
}

export async function uploadReceipt(file: File): Promise<{ receipt_id: string; status: string; message: string }> {
  try {
    const supabase = createClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/v1/receipts/scan', {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
}

export async function deleteReceipt(receiptId: string): Promise<{ message: string }> {
  try {
    const supabase = createClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(`/api/v1/receipts/${receiptId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Delete error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
}
