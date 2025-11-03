import { createClient } from '@/lib/supabase/client';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'achievement';
  impact: 'high' | 'medium' | 'low';
  action?: string;
  action_url?: string;
  confidence: number;
  created_at: string;
}

export interface InsightsResponse {
  insights: Insight[];
  generated_at: string;
  receipt_count: number;
  total_amount: number;
  total_vat: number;
  avg_amount: number;
}

export async function fetchInsights(): Promise<InsightsResponse> {
  try {
    const supabase = createClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch('/api/finance-agent/insights/dashboard', {
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
    console.error('Error fetching insights:', error);
    throw error;
  }
}
