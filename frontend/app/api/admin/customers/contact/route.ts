/** @fileoverview Customer contact API route with Resend/Pipedrive integration */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/admin/integrations/resend";
import { createPipedriveActivity } from "@/lib/admin/integrations/pipedrive";
import { requireAdminAuth } from "@/lib/adminAuth";

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

const ContactBody = z.object({
  customerId: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1).max(140).optional(),
  message: z.string().max(5000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    const tenantId = auth.tenantId || 'default';

    // Rate limiting
    if (!checkRateLimit(tenantId, '/api/admin/customers/contact', RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = ContactBody.safeParse(raw);
    
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { customerId, email, subject, message } = parsed.data;

    // Publish contact_requested event
    await publishActivityEvent({
      type: "contact_requested",
      title: `Contact request: ${customerId}`,
      description: `Contact requested for customer ${customerId}`,
      tenant_id: tenantId,
      metadata: { customerId, email }
    }, request.headers);

    // Send email via Resend
    const subj = subject || "Regarding your DocFlow account";
    const html = message ? `<p>${escapeHtml(message)}</p>` : `<p>Hello from DocFlow. We'd like to get in touch.</p>`;
    
    try {
      const emailRes = await sendEmail({ to: email, subject: subj, html });

      // Publish contact_sent event
      await publishActivityEvent({
        type: "contact_sent",
        title: `Email sent: ${customerId}`,
        description: `Email sent to ${email}`,
        tenant_id: tenantId,
        metadata: { customerId, email, providerId: emailRes.id }
      }, request.headers);

      // Try to create Pipedrive activity (optional - don't fail if it doesn't work)
      try {
        const crm = await createPipedriveActivity({
          subject: subj,
          note: `Contacted ${email} (customerId=${customerId})`,
        });

        if (crm.success && crm.data?.id) {
          // Publish crm_activity_created event
          await publishActivityEvent({
            type: "crm_activity_created",
            title: `CRM activity: ${customerId}`,
            description: `Pipedrive activity created for customer ${customerId}`,
            tenant_id: tenantId,
            metadata: { 
              customerId, 
              email, 
              provider: "pipedrive", 
              activityId: crm.data.id 
            }
          }, request.headers);
        }
      } catch (crmError) {
        // Log CRM error but don't fail the request
        console.error("CRM integration failed:", crmError);
      }

      return NextResponse.json({ ok: true }, { status: 200 });

    } catch (emailError) {
      // Email failure should fail the request
      return NextResponse.json(
        { ok: false, error: emailError instanceof Error ? emailError.message : 'Email sending failed' },
        { status: 500 }
      );
    }

  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function publishActivityEvent(payload: any, headers: Headers) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/admin/activities`, {
      method: 'POST',
      headers: {
        'Authorization': headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Failed to publish activity event: ${response.status}`);
    }
  } catch (error) {
    console.error('Error publishing activity event:', error);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
