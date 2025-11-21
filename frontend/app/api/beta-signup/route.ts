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

// Initialize Supabase client (using anon key for public inserts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = BetaSignupSchema.parse(body);
    
    // Save to Supabase beta_signups table
    if (supabase) {
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('beta_signups')
        .insert({
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
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase insert error:', supabaseError);
        // Continue to backend API call even if Supabase insert fails
      }
    }
    
    // Also send to backend API (for email automation)
    let backendResult = null;
    try {
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/beta-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (backendResponse.ok) {
        backendResult = await backendResponse.json();
      } else {
        console.warn('Backend API call failed, but Supabase save succeeded');
      }
    } catch (backendError) {
      console.warn('Backend API error (non-critical):', backendError);
      // Continue even if backend API fails
    }

    const result = backendResult || { success: true };

    // Send Mari story email sequence
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Maksim Jylhä <maksim@docflow.fi>',
            to: [validatedData.email],
            subject: 'Klo 3 yöllä, 87 laskua, 6h deadline',
            html: generateMariStoryEmail(validatedData.name),
          }),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the signup if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Beta signup successful',
      data: result 
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMariStoryEmail(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klo 3 yöllä, 87 laskua</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  
  <div style="background-color: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827;">
      Klo 3 yöllä, 87 laskua, 6h deadline
    </h1>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
      Hei <strong>${firstName}</strong>,
    </p>
    
    <!-- Mari's Problem -->
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 12px 0;">
        Mari heräsi <strong>klo 3 yöllä</strong> kylmässä hiessä.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 12px 0;">
        ALV-ilmoitus piti palauttaa 6 tunnin päästä.<br>
        <strong>87 laskua</strong> oli vielä käsittelemättä.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
        Hän oli tehnyt 12 tuntia ylitöitä tällä viikolla.<br>
        Mikään ei riittänyt.
      </p>
    </div>
    
    <!-- Mari's Success -->
    <div style="background-color: #f0fdf4; border-left: 4px solid: #22c55e; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 18px; font-weight: 600; color: #166534; margin: 0 0 8px 0;">
        Tänään Mari käsittelee 200 laskua <strong>6 tunnissa kuukaudessa</strong>.
      </p>
      <p style="font-size: 16px; color: #374151; margin: 0;">
        Ei ylitöitä. Ei stressiä. Ei virheitä.
      </p>
    </div>
    
    <p style="font-size: 20px; font-weight: bold; color: #2563eb; text-align: center; margin: 24px 0;">
      Haluatko saman?
    </p>
    
    <!-- 3 Steps -->
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #111827;">
        🚀 Beta-ohjelma alkaa (3 askelta, 15 min)
      </h3>
      
      <ol style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 12px; line-height: 1.6; color: #374151;">
          <strong>Kickoff-puhelu</strong> (15 min)<br>
          Käymme läpi tarpeesi ja konfiguroimme DocFlow:n
        </li>
        <li style="margin-bottom: 12px; line-height: 1.6; color: #374151;">
          <strong>Testaa omilla laskuilla</strong> (30 min)<br>
          Lähetä 5-10 laskua ja katso miten OCR toimii
        </li>
        <li style="margin-bottom: 0; line-height: 1.6; color: #374151;">
          <strong>Integraatio Netvisoriin</strong> (15 min)<br>
          Yhdistämme API:n ja testaamme automaattisen lähetyksen
        </li>
      </ol>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://calendly.com/docflow-beta/kickoff" 
         style="display: inline-block; background-color: #2563eb; color: white; padding: 16px 32px; 
                text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        📅 Varaa kickoff-puhelu (15 min)
      </a>
    </div>
    
    <!-- Beta Benefits -->
    <div style="background-color: #fffbeb; border: 2px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="font-size: 14px; font-weight: 600; color: #92400e; margin: 0 0 8px 0;">
        🎉 Beta-edut:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f;">
        <li>6 kuukautta ilmaiseksi (arvo €1 794)</li>
        <li>Prioriteettituki suomeksi</li>
        <li>Vaikutat tuotteen kehitykseen</li>
        <li>Ensimmäisenä uudet ominaisuudet</li>
      </ul>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
        Terveisin,<br>
        <strong>Maksim Jylhä</strong><br>
        Founder, DocFlow.fi
      </p>
      
      <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0;">
        <strong>P.S.</strong> Vain 8 paikkaa beta-ohjelmassa. Varaa aikasi tänään!
      </p>
    </div>
    
  </div>
  
</body>
</html>
  `;
}
