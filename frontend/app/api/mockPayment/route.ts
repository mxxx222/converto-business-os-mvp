import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, amount, email } = body;

    // Tarkista onko Stripe aktiivinen
    const stripeActive = process.env.STRIPE_ACTIVE === 'true';

    if (stripeActive) {
      // Oikea Stripe-integraatio (tulevaisuudessa)
      return NextResponse.json({
        success: false,
        message: 'Stripe integration not implemented yet'
      });
    } else {
      // Mock-maksu
      console.log('Mock payment processed:', { planId, amount, email });

      // Simuloi viivettä
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json({
        success: true,
        message: 'Mock payment confirmed',
        paymentId: `mock_${Date.now()}`,
        planId,
        amount,
        email,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Mock payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'mock_mode',
    stripeActive: process.env.STRIPE_ACTIVE === 'true',
    registrationOpen: process.env.NEXT_PUBLIC_REGISTRATION_OPEN === 'true'
  });
}
