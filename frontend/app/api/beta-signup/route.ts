import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase client only if env vars are available (not during build)
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: fetch
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    // Log env vars for debugging (without exposing secrets)
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Env vars check:', { hasUrl, hasKey: !!hasKey });
    
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      console.error('Supabase client not initialized', { hasUrl, hasKey });
      return NextResponse.json(
        { error: 'Database not configured', details: { hasUrl, hasKey } },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = BetaSignupSchema.parse(body);
    
    // Save to Supabase beta_signups table
    const { error: dbError } = await supabase
      .from('beta_signups')
      .insert([{
        email: validatedData.email,
        name: validatedData.name,
        company: validatedData.company,
        phone: validatedData.phone || null,
        monthly_invoices: validatedData.monthly_invoices,
        document_types: validatedData.document_types,
        start_timeline: validatedData.start_timeline,
        weekly_feedback_ok: validatedData.weekly_feedback_ok,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

    if (dbError) {
      console.error('Database error:', dbError);
      console.error('Error details:', JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: 'Failed to save signup. Please try again.', details: dbError.message },
        { status: 500 }
      );
    }

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
