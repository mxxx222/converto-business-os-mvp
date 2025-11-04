import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple in-memory storage for events (fallback when KV/DB not available)
const eventStore = new Map<string, any[]>();
const MAX_STORE_SIZE = 1000;

interface EventData {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  variant?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EventData = await request.json();
    const { name, properties = {}, timestamp, userId, sessionId, variant } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    const event = {
      name,
      properties,
      timestamp: timestamp || new Date().toISOString(),
      userId: userId || null,
      sessionId: sessionId || null,
      variant: variant || null,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] ||
          request.headers.get('x-real-ip') ||
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Try to store in Supabase if available
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('events').insert({
        event_name: name,
        properties: properties,
        timestamp: event.timestamp,
        user_id: userId,
        session_id: sessionId,
        variant: variant,
        ip_address: event.ip,
        user_agent: event.userAgent,
      });

      if (error) {
        console.warn('Failed to store event in Supabase, using in-memory store:', error);
        // Fallback to in-memory storage
        storeEventInMemory(event);
      }
    } catch (error) {
      console.warn('Supabase not available, using in-memory store:', error);
      // Fallback to in-memory storage
      storeEventInMemory(event);
    }

    // Track in Plausible (if configured)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://converto.fi'}/api/analytics/plausible`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          props: properties,
        }),
      });
    } catch (error) {
      console.warn('Failed to track in Plausible:', error);
    }

    return NextResponse.json({
      success: true,
      event: {
        name,
        timestamp: event.timestamp,
      },
    });
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

function storeEventInMemory(event: any) {
  const key = 'events';
  const events = eventStore.get(key) || [];

  // Prevent memory overflow
  if (events.length >= MAX_STORE_SIZE) {
    events.shift(); // Remove oldest event
  }

  events.push(event);
  eventStore.set(key, events);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventName = searchParams.get('name');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    // Try to fetch from Supabase
    try {
      const supabase = await createClient();
      let query = supabase.from('events').select('*').order('timestamp', { ascending: false }).limit(limit);

      if (eventName) {
        query = query.eq('event_name', eventName);
      }

      const { data, error } = await query;

      if (!error && data) {
        return NextResponse.json({
          success: true,
          events: data,
          count: data.length,
        });
      }
    } catch (error) {
      console.warn('Supabase not available, using in-memory store:', error);
    }

    // Fallback to in-memory storage
    const events = eventStore.get('events') || [];
    const filtered = eventName
      ? events.filter((e) => e.name === eventName)
      : events;

    return NextResponse.json({
      success: true,
      events: filtered.slice(0, limit),
      count: filtered.length,
      source: 'memory',
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
