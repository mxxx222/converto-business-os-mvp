import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.converto.fi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, name, company, document_types } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate document_types if provided
    if (document_types && !Array.isArray(document_types)) {
      return NextResponse.json(
        { error: 'document_types must be an array' },
        { status: 400 }
      );
    }

    // Prepare backend request with required fields
    const backendPayload = {
      email,
      name: name || email.split('@')[0], // Use email prefix if name not provided
      company: company || 'Not provided',
      document_types: document_types || [],
    };

    // Forward to backend API
    const response = await fetch(`${API_URL}/api/v1/email/pilot-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `Backend API error: ${response.status}`,
      }));

      console.error('Backend API error:', error);
      return NextResponse.json(
        { error: error.detail || 'Failed to process signup' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      { success: true, ...result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Pilot signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

