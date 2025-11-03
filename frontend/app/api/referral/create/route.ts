import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    // Generate unique referral code
    const referralCode = generateReferralCode();
    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://converto.fi'}/signup?ref=${referralCode}`;

    // Store referral in database (using Supabase or your backend)
    // For now, we'll return the code
    // In production, store in database with userId/email mapping

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink,
      message: 'Referral code created successfully',
    });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral code' },
      { status: 500 }
    );
  }
}

function generateReferralCode(): string {
  // Generate a unique 8-character code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
