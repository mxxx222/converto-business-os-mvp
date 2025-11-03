import { createClient } from '@/lib/supabase/client';

export interface ReportData {
  type: 'vat' | 'cashflow' | 'income' | 'expenses' | 'customers';
  period: string;
  data: any;
  generated_at: string;
}

export interface ReportsResponse {
  reports: ReportData[];
  generated_at: string;
  period: string;
  receipt_count: number;
}

export async function generateReports(period: string): Promise<ReportsResponse> {
  try {
    const supabase = createClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(`/api/reports/generate?period=${period}`, {
      method: 'POST',
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
    console.error('Error generating reports:', error);
    throw error;
  }
}

export async function downloadReport(
  reportType: string,
  period: string,
  format: string = 'pdf'
) {
  try {
    const supabase = createClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `/api/reports/download?report_type=${reportType}&period=${period}&format=${format}`,
      {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Download error: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${period}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}
