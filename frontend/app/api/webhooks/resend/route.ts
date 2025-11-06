import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const payload = await request.json();
    const { type, data } = payload;

    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('resend-signature');
    if (process.env.RESEND_WEBHOOK_SECRET && signature) {
      // Implement signature verification here
    }

    // RESEND PREMIUM: Webhook events
    switch (type) {
      case 'email.sent':
        await trackEmailEvent(supabase, 'sent', data);
        break;

      case 'email.delivered':
        await trackEmailEvent(supabase, 'delivered', data);
        break;

      case 'email.opened':
        await trackEmailEvent(supabase, 'opened', data);
        break;

      case 'email.clicked':
        await trackEmailEvent(supabase, 'clicked', data);
        break;

      case 'email.bounced':
        await trackEmailEvent(supabase, 'bounced', data);
        await handleBounce(supabase, data);
        break;

      case 'email.complained':
        await trackEmailEvent(supabase, 'complained', data);
        await handleComplaint(supabase, data);
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function trackEmailEvent(supabase: any, event: string, data: any) {
  try {
    await supabase.from('email_events').insert({
      email_id: data.email_id,
      event_type: event,
      recipient: data.to,
      timestamp: new Date().toISOString(),
      metadata: data
    });
  } catch (error) {
    console.error('Failed to track email event:', error);
  }
}

async function handleBounce(supabase: any, data: any) {
  try {
    // Mark email as invalid
    await supabase
      .from('beta_signups')
      .update({ email_status: 'bounced' })
      .eq('email', data.to);
  } catch (error) {
    console.error('Failed to handle bounce:', error);
  }
}

async function handleComplaint(supabase: any, data: any) {
  try {
    // Unsubscribe immediately
    await supabase
      .from('beta_signups')
      .update({ email_status: 'complained', unsubscribed: true })
      .eq('email', data.to);
  } catch (error) {
    console.error('Failed to handle complaint:', error);
  }
}