import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { betaSignupCustomerEmail, betaSignupAdminEmail } from '@/lib/email-templates'

// Initialize Supabase client only if env vars are available (not during build)
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    return null
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

const schema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  contact_name: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  monthly_invoices: z.string().optional(),
  weekly_feedback_ok: z.boolean().optional().default(false)
})

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const data = schema.parse(body)

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('beta_signups')
      .insert([{
        company: data.company_name,
        name: data.contact_name,
        email: data.email,
        phone: data.phone || null,
        monthly_invoices: data.monthly_invoices || '1-50',
        weekly_feedback_ok: data.weekly_feedback_ok || false,
        start_timeline: 'Within 1 month',
        document_types: [],
        status: 'pending',
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save signup. Please try again.' },
        { status: 500 }
      )
    }

    // Send customer confirmation email (don't block on failure)
    sendEmail({
      to: data.email,
      subject: '🎉 Tervetuloa DocFlow Beta-ohjelmaan!',
      html: betaSignupCustomerEmail(data.contact_name, data.company_name)
    }).catch(err => console.error('Customer email failed:', err))

    // Send admin notification (don't block on failure)
    const adminEmail = process.env.ADMIN_EMAIL || 'maksim@docflow.fi'
    sendEmail({
      to: adminEmail,
      subject: `🎯 New Beta Signup: ${data.company_name}`,
      html: betaSignupAdminEmail(data)
    }).catch(err => console.error('Admin email failed:', err))

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Beta signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

