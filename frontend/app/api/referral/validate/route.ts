import { NextRequest, NextResponse } from 'next/server';

// Enable Edge Runtime for fast referral validation
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Validate referral code
    // In production, check database for valid code
    // For now, we'll just validate format

    const isValid = /^[A-Z0-9]{8}$/.test(code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code,
      discount: 10, // 10% discount for referral
      message: 'Referral code is valid',
    });
  } catch (error) {
    console.error('Referral validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
