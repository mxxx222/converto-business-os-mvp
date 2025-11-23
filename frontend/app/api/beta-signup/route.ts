import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BetaSignupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  company: z.string().min(2),
  phone: z.string().optional(),
  monthly_invoices: z.enum(['1-50', '50-200', '200-500', '500-2000', '2000+']),
  document_types: z.array(z.string()).min(1),
  start_timeline: z.enum(['Immediately', 'Within 1 month', 'Within 3 months', 'Just exploring']),
  weekly_feedback_ok: z.boolean()
});

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey,
        urlLength: supabaseUrl?.length || 0,
        keyLength: supabaseKey?.length || 0
      });
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    // Log key prefix for debugging (first 20 chars only)
    console.log('Using Supabase config:', {
      url: supabaseUrl,
      keyPrefix: supabaseKey.substring(0, 20) + '...',
      keyLength: supabaseKey.length
    });

    const body = await request.json();
    
    // Validate input
    const validatedData = BetaSignupSchema.parse(body);
    
    // Save to Supabase using REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/beta_signups`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email: validatedData.email,
        name: validatedData.name,
        company: validatedData.company,
        phone: validatedData.phone || null,
        monthly_invoices: validatedData.monthly_invoices,
        document_types: validatedData.document_types,
        start_timeline: validatedData.start_timeline,
        weekly_feedback_ok: validatedData.weekly_feedback_ok,
        status: 'pending'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase API error:', response.status, errorText);
      
      // Parse error to provide better message
      let errorMessage = 'Failed to save signup. Please try again.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message?.includes('API key') || errorJson.message?.includes('Invalid')) {
          errorMessage = 'Invalid API key. Please contact support.';
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // If errorText is not JSON, use it as is if it contains useful info
        if (errorText.includes('API key') || errorText.includes('Invalid')) {
          errorMessage = 'Invalid API key. Please contact support.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log('Signup saved successfully:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Beta signup successful'
    });

  } catch (error) {
    console.error('Beta signup error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
