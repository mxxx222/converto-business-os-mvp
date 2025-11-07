import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// import Stripe from 'stripe';

export const runtime = 'nodejs';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature')!;
    
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('Stripe not configured, skipping webhook processing');
      return NextResponse.json({ ok: true, message: 'Stripe not configured' });
    }

    // TODO: Uncomment when Stripe is configured
    // let event: Stripe.Event;
    // try {
    //   event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    // } catch (e: any) {
    //   console.error('Stripe webhook signature verification failed:', e.message);
    //   return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    // }

    // Handle the event
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     const session = event.data.object as Stripe.Checkout.Session;
    //     // TODO: Update subscription in Supabase
    //     // TODO: Send welcome email via Resend
    //     break;
    //   case 'invoice.payment_succeeded':
    //     // TODO: Handle successful payment
    //     break;
    //   case 'customer.subscription.deleted':
    //     // TODO: Handle subscription cancellation
    //     break;
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    console.log('Stripe webhook received:', { signature: sig.substring(0, 20) + '...' });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
