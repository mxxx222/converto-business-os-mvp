/** @fileoverview Admin Queue API routes - List and manage queue activities */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';

// Rate limiting: simple in-memory counter (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(tenantId: string, endpoint: string, maxRequests: number, windowMs: number): boolean {
  const key = `${tenantId}:${endpoint}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    const tenantId = auth.tenantId || 'default';

    // Rate limiting
    if (!checkRateLimit(tenantId, '/api/admin/queue', RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Call backend API to list activities
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/admin/activities?tenant_id=${encodeURIComponent(tenantId)}&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    
    // Filter queue-related activities
    // Backend returns activities with type, metadata.queueAction, etc.
    const activities = (backendData.activities || [])
      .filter((item: { type?: string; metadata?: Record<string, unknown> }) => {
        const queueAction = item.metadata?.queueAction;
        const itemType = item.type;
        // Filter by queueAction in metadata or by type
        return queueAction && ['requeue', 'retry', 'cancel'].includes(String(queueAction)) ||
               itemType && ['upload', 'queued', 'processing', 'completed', 'failed', 'document_uploaded', 'document_processed', 'document_failed'].includes(itemType);
      })
      .map((item: { timestamp?: string; created_at?: string; metadata?: Record<string, unknown> }) => ({
        ...item,
        ts: item.timestamp || item.created_at || new Date().toISOString(),
        details: item.metadata || {}
      }))
      .sort((a: { ts?: string }, b: { ts?: string }) => {
        const aTime = a.ts ? new Date(a.ts).getTime() : 0;
        const bTime = b.ts ? new Date(b.ts).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 100);

    return NextResponse.json({ ok: true, data: activities });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    const tenantId = auth.tenantId || 'default';

    // Rate limiting
    if (!checkRateLimit(tenantId, '/api/admin/queue', RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, docId } = body;

    if (!action || !docId) {
      return NextResponse.json(
        { ok: false, error: 'Invalid action or missing docId' },
        { status: 400 }
      );
    }

    // Map action to activity type (using ActivityType enum values)
    // For queue actions, we use ADMIN_ACTION type and put specific action in metadata
    const activityType = 'admin_action'; // Backend ActivityType.ADMIN_ACTION

    // Publish activity to backend bus (ActivityInput schema)
    const activityPayload = {
      type: activityType,
      title: `Document ${action}: ${docId.slice(-8)}`,
      description: `Document ${docId} ${action === 'requeue' ? 'requeued' : action === 'retry' ? 'retry initiated' : 'cancelled'}`,
      tenant_id: tenantId,
      metadata: {
        docId,
        action,
        queueAction: action, // 'requeue', 'retry', or 'cancel'
        status: action === 'requeue' ? 'requeued' : action === 'retry' ? 'retrying' : 'cancelled'
      }
    };

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/admin/activities`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityPayload)
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend API error: ${backendResponse.status} - ${errorText}`);
    }

    const activity = await backendResponse.json();

    return NextResponse.json(
      { ok: true, message: `Document ${action} initiated`, data: activity },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

