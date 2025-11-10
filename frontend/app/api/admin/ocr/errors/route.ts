/** @fileoverview Admin OCR Errors API routes - List and manage OCR error activities */

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
    if (!checkRateLimit(tenantId, '/api/admin/ocr/errors', RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Call backend API to list activities
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/admin/activities?tenant_id=${encodeURIComponent(tenantId)}&limit=200`, {
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
    
    // Filter OCR error activities
    // Backend returns activities with type, metadata.ocrAction, etc.
    const activities = (backendData.activities || [])
      .filter((item: { type?: string; metadata?: Record<string, unknown> }) => {
        const ocrAction = item.metadata?.ocrAction;
        const itemType = item.type;
        // Filter by ocrAction in metadata or by OCR-related types
        return ocrAction && ['retry_requested', 'error_acknowledged', 'error_escalated'].includes(String(ocrAction)) ||
               itemType && ['ocr_failed', 'system_error', 'error'].includes(itemType);
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
      .slice(0, 200);

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
    if (!checkRateLimit(tenantId, '/api/admin/ocr/errors', RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, docId, errorId } = body;

    if (!action) {
      return NextResponse.json(
        { ok: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    let activityType = 'admin_action'; // Backend ActivityType.ADMIN_ACTION
    let title = '';
    let description = '';
    let metadata: Record<string, unknown> = {};

    if (action === 'retry' && docId) {
      title = `OCR Retry: ${docId.slice(-8)}`;
      description = `OCR retry requested for document ${docId}`;
      metadata = { docId, action: 'retry', ocrAction: 'retry_requested', status: 'retrying' };
    } else if (action === 'acknowledge' && errorId) {
      title = `OCR Error Acknowledged: ${errorId.slice(-8)}`;
      description = `OCR error ${errorId} acknowledged`;
      metadata = { errorId, docId, action: 'acknowledge', ocrAction: 'error_acknowledged', status: 'acknowledged' };
    } else if (action === 'escalate' && docId && errorId) {
      title = `OCR Error Escalated: ${errorId.slice(-8)}`;
      description = `OCR error ${errorId} escalated to support team`;
      metadata = { errorId, docId, action: 'escalate', ocrAction: 'error_escalated', status: 'escalated' };
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid action or missing IDs' },
        { status: 400 }
      );
    }

    // Publish activity to backend bus (ActivityInput schema)
    const activityPayload = {
      type: activityType,
      title,
      description,
      tenant_id: tenantId,
      metadata
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
      { ok: true, message: `OCR ${action} initiated`, data: activity },
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

