import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe keys - server-side only (API routes), but check NEXT_PUBLIC for flexibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.warn('Stripe secret key not found. Checkout will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null as unknown as Stripe;

// Price IDs - check both server-side and NEXT_PUBLIC
const getEnvVar = (key: string, fallback: string) =>
  process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || fallback;

const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  Starter: {
    monthly: getEnvVar('STRIPE_PRICE_STARTER_MONTHLY', 'price_starter_monthly'),
    yearly: getEnvVar('STRIPE_PRICE_STARTER_YEARLY', 'price_starter_yearly'),
  },
  Professional: {
    monthly: getEnvVar('STRIPE_PRICE_PROFESSIONAL_MONTHLY', 'price_professional_monthly'),
    yearly: getEnvVar('STRIPE_PRICE_PROFESSIONAL_YEARLY', 'price_professional_yearly'),
  },
  Enterprise: {
    monthly: getEnvVar('STRIPE_PRICE_ENTERPRISE_MONTHLY', 'price_enterprise_monthly'),
    yearly: getEnvVar('STRIPE_PRICE_ENTERPRISE_YEARLY', 'price_enterprise_yearly'),
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billingCycle, email, successUrl, cancelUrl } = body;

    if (!plan || !billingCycle || !email) {
      return NextResponse.json(
        { error: 'Plan, billing cycle, and email are required' },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[plan]?.[billingCycle === 'yearly' ? 'yearly' : 'monthly'];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://converto.fi';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${baseUrl}/kiitos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/premium?canceled=true`,
      metadata: {
        plan,
        billingCycle,
        source: 'premium_pricing',
      },
      subscription_data: {
        metadata: {
          plan,
          billingCycle,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
