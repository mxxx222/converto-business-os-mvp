import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Stripe keys - server-side only (API routes), but check NEXT_PUBLIC for flexibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET || '';

if (!stripeSecretKey) {
  console.warn('Stripe secret key not found. Webhooks will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null as unknown as Stripe;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.converto.fi';

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Forward to backend for processing
        await fetch(`${API_URL}/api/v1/stripe/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'checkout.session.completed',
            data: {
              sessionId: session.id,
              customerEmail: session.customer_email,
              subscriptionId: session.subscription,
              metadata: session.metadata,
            },
          }),
        });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await fetch(`${API_URL}/api/v1/stripe/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: event.type,
            data: {
              subscriptionId: subscription.id,
              customerId: subscription.customer,
              status: subscription.status,
              metadata: subscription.metadata,
            },
          }),
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await fetch(`${API_URL}/api/v1/stripe/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'customer.subscription.deleted',
            data: {
              subscriptionId: subscription.id,
              customerId: subscription.customer,
            },
          }),
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription as any)?.id || null;

        await fetch(`${API_URL}/api/v1/stripe/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'invoice.payment_succeeded',
            data: {
              invoiceId: invoice.id,
              subscriptionId,
              customerId: invoice.customer,
              amountPaid: invoice.amount_paid,
            },
          }),
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription as any)?.id || null;

        await fetch(`${API_URL}/api/v1/stripe/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'invoice.payment_failed',
            data: {
              invoiceId: invoice.id,
              subscriptionId,
              customerId: invoice.customer,
            },
          }),
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
