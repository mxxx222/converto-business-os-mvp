import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Call Supabase function for stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_document_stats', { user_uuid: user.id });
    
    if (statsError) {
      console.error('Stats error:', statsError);
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }
    
    // Get VAT summary by rate
    const { data: vatSummary, error: vatError } = await supabase
      .rpc('get_vat_summary_by_rate', { user_uuid: user.id });
    
    if (vatError) {
      console.error('VAT summary error:', vatError);
    }
    
    // Get monthly stats
    const { data: monthlyStats, error: monthlyError } = await supabase
      .rpc('get_monthly_document_stats', { 
        user_uuid: user.id,
        months_back: 6 
      });
    
    if (monthlyError) {
      console.error('Monthly stats error:', monthlyError);
    }
    
    return NextResponse.json({
      overview: stats && stats.length > 0 ? stats[0] : {
        total_documents: 0,
        total_receipts: 0,
        total_invoices: 0,
        processing_documents: 0,
        completed_documents: 0,
        failed_documents: 0,
        total_amount_sum: 0,
        total_vat_sum: 0,
        avg_ocr_confidence: 0,
        fallback_usage_rate: 0,
      },
      vat_summary: vatSummary || [],
      monthly_stats: monthlyStats || [],
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}

