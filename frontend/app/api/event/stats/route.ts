import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventName = searchParams.get('name');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    try {
      const supabase = await createClient();

      // Build query
      let query = supabase.from('events').select('*');

      if (eventName) {
        query = query.eq('event_name', eventName);
      }

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Calculate statistics
      const stats = {
        total_events: data?.length || 0,
        unique_users: new Set(data?.map((e: any) => e.user_id).filter(Boolean)).size,
        unique_sessions: new Set(data?.map((e: any) => e.session_id).filter(Boolean)).size,
        events_by_name: {} as Record<string, number>,
        events_by_variant: {} as Record<string, number>,
        events_by_date: {} as Record<string, number>,
      };

      // Group by event name
      data?.forEach((event: any) => {
        const name = event.event_name || event.name;
        stats.events_by_name[name] = (stats.events_by_name[name] || 0) + 1;

        // Group by variant
        if (event.variant) {
          stats.events_by_variant[event.variant] =
            (stats.events_by_variant[event.variant] || 0) + 1;
        }

        // Group by date
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        stats.events_by_date[date] = (stats.events_by_date[date] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        stats,
        period: {
          start_date: startDate || null,
          end_date: endDate || null,
        },
      });
    } catch (error) {
      console.warn('Supabase not available, returning mock stats:', error);

      // Return mock stats when database not available
      return NextResponse.json({
        success: true,
        stats: {
          total_events: 0,
          unique_users: 0,
          unique_sessions: 0,
          events_by_name: {},
          events_by_variant: {},
          events_by_date: {},
        },
        period: {
          start_date: startDate || null,
          end_date: endDate || null,
        },
        source: 'mock',
      });
    }
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event statistics' },
      { status: 500 }
    );
  }
}
