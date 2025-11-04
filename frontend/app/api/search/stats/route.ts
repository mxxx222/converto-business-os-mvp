import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from Supabase receipts table (as proxy for indexed files)
    try {
      const supabase = await createClient();

      // Count receipts as indexed files
      const { count, error } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      // Get latest receipt timestamp as last_indexed_at
      const { data: latestReceipt } = await supabase
        .from('receipts')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return NextResponse.json({
        success: true,
        count: count || 0,
        last_indexed_at: latestReceipt?.created_at || new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Supabase not available, returning build time:', error);

      // Fallback: return build time from environment
      const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ||
                       process.env.RENDER_GIT_COMMIT ||
                       new Date().toISOString();

      return NextResponse.json({
        success: true,
        count: 0,
        last_indexed_at: buildTime,
        source: 'fallback',
      });
    }
  } catch (error) {
    console.error('Error fetching search stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search statistics' },
      { status: 500 }
    );
  }
}
