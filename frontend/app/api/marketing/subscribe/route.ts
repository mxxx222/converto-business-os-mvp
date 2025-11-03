import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics/posthog';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Subscribe email for marketing
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Track event (PostHog tracks client-side, so we'll log server-side for now)
    // Client-side tracking happens in the component that calls this API
    console.log('Marketing subscribe:', { email, source: 'landing_page', timestamp: new Date().toISOString() });

    // TODO: Add to email list (Resend, Mailchimp, etc.)
    // For now, just track and return success

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error: any) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

