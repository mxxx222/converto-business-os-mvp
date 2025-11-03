import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { demoRequestServerSchema, type DemoRequestServerData } from '@/lib/validation/demoSchema';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: NextRequest): string {
  // Try to get IP from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
  return `demo_request:${ip}`;
}

function checkRateLimit(req: NextRequest): { allowed: boolean; remaining: number; resetAfter: number } {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;

  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAfter: windowMs };
  }

  if (limit.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAfter: limit.resetTime - now };
  }

  // Increment count
  limit.count++;
  rateLimitMap.set(key, limit);
  return { allowed: true, remaining: maxRequests - limit.count, resetAfter: limit.resetTime - now };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key of Array.from(rateLimitMap.keys())) {
    const limit = rateLimitMap.get(key);
    if (limit && now > limit.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

function detectDeviceType(userAgent: string | null): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(req);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Liian monta pyyntöä. Yritä uudelleen 15 minuutin kuluttua.',
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAfter: Math.ceil(rateLimit.resetAfter / 1000),
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetAfter / 1000).toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetAfter).toISOString(),
          },
        }
      );
    }

    const body = await req.json();

    // Honeypot check (if website field is filled, it's spam)
    if (body.website && body.website.length > 0) {
      console.warn('Spam detected via honeypot field');
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Prepare server-side data with metadata
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const deviceType = detectDeviceType(userAgent);

    // Get variant from cookie
    const variantCookie = req.cookies.get('ab_test_variant');
    const pageVariant = variantCookie?.value === 'storybrand' ? 'storybrand' : 'original';

    const serverData: DemoRequestServerData = {
      ...body,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      device_type: deviceType,
      page_variant: pageVariant,
    };

    // Validate with server schema
    const validationResult = demoRequestServerSchema.safeParse(serverData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validoinnin virhe',
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Generate unique request ID
    const requestId = uuidv4();

    if (!resend) {
      console.error('Resend API key not configured');
      return NextResponse.json(
        { error: 'Sähköpostipalvelu ei ole käytettävissä' },
        { status: 500 }
      );
    }

    // Prepare email HTML templates
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); padding: 40px; border-radius: 12px; color: white;">
            <h1 style="color: #39FF14; margin-top: 0;">Kiitos demo-pyynnöstäsi!</h1>
            <p>Hei ${validatedData.name},</p>
            <p>Olemme vastaanottaneet demo-pyyntösi${validatedData.company ? ` yritykseltä ${validatedData.company}` : ''}.</p>
            <p><strong>Tiimimme ottaa sinuun yhteyttä 24 tunnin kuluessa</strong> ja sopii sopivan ajankohdan demo-tapaamiselle.</p>

            <div style="background: rgba(57, 255, 20, 0.1); border-left: 4px solid #39FF14; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="color: #39FF14; margin-top: 0;">Demo-tapaamisessa esittelemme:</h2>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Converto Business OS:n keskeiset ominaisuudet</li>
                <li>Automaatio-ratkaisut yrityksellesi</li>
                <li>ROI-laskelmat ja aikataulut</li>
                <li>Käyttöönoton suunnitelman</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://converto.fi"
                 style="background: #39FF14; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Lue lisää Converto Business OS:sta →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; margin: 0;">
              <strong>Pyyntö-ID:</strong> ${requestId}<br>
              Tämä on automaattinen vahvistusviesti. Jos et ole lähettänyt demo-pyyntöä, voit jättää tämän viestin huomiotta.
            </p>

            <p style="margin-top: 30px;">Odota kuulla meiltä!</p>
            <p><strong>Ystävällisin terveisin,</strong><br>Converto-tiimi</p>
          </div>
        </body>
      </html>
    `;

    const teamEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; padding: 40px; border-radius: 12px; color: white;">
            <h1 style="color: #39FF14; margin-top: 0;">🎯 Uusi demo-pyyntö</h1>

            <div style="background: rgba(57, 255, 20, 0.1); padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #39FF14;">
              <h2 style="color: #39FF14; margin-top: 0;">Yhteystiedot</h2>
              <p><strong>Nimi:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${validatedData.email}" style="color: #39FF14;">${validatedData.email}</a></p>
              ${validatedData.company ? `<p><strong>Yritys:</strong> ${validatedData.company}</p>` : ''}
              ${validatedData.phone ? `<p><strong>Puhelin:</strong> <a href="tel:${validatedData.phone}" style="color: #39FF14;">${validatedData.phone}</a></p>` : ''}
            </div>

            ${validatedData.message ? `
              <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #39FF14; margin-top: 0;">Viesti:</h3>
                <p style="white-space: pre-wrap;">${validatedData.message}</p>
              </div>
            ` : ''}

            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; margin: 20px 0; border-radius: 8px; font-size: 12px; color: #999;">
              <h3 style="color: #39FF14; margin-top: 0; font-size: 14px;">Metadata</h3>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Lähde:</strong> ${validatedData.source || 'website'}</p>
              <p><strong>Variantti:</strong> ${validatedData.page_variant || 'original'}</p>
              <p><strong>Laitteisto:</strong> ${validatedData.device_type || 'desktop'}</p>
              ${validatedData.utm_source ? `<p><strong>UTM Source:</strong> ${validatedData.utm_source}</p>` : ''}
              ${validatedData.utm_medium ? `<p><strong>UTM Medium:</strong> ${validatedData.utm_medium}</p>` : ''}
              ${validatedData.utm_campaign ? `<p><strong>UTM Campaign:</strong> ${validatedData.utm_campaign}</p>` : ''}
              ${validatedData.referrer ? `<p><strong>Referrer:</strong> ${validatedData.referrer}</p>` : ''}
              <p><strong>Aika:</strong> ${validatedData.timestamp}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Toiminta:</strong> Ota yhteyttä ja varaa demo-tapaaminen 24 tunnin kuluessa.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails in parallel
    const [teamEmailResult, customerEmailResult] = await Promise.all([
      resend.emails.send({
        from: 'Converto <info@converto.fi>',
        to: 'team@converto.fi',
        subject: `🎯 Uusi demo-pyyntö: ${validatedData.company || validatedData.name}`,
        html: teamEmailHtml,
        reply_to: validatedData.email,
      }),
      resend.emails.send({
        from: 'Converto <info@converto.fi>',
        to: validatedData.email,
        subject: 'Kiitos demo-pyynnöstäsi! - Converto',
        html: customerEmailHtml,
      }),
    ]);

    // Track analytics events
    try {
      // Plausible tracking (server-side)
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://converto.fi'}/api/analytics/plausible`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'demo_request',
          props: {
            company: validatedData.company || 'not_provided',
            has_phone: !!validatedData.phone,
            has_message: !!validatedData.message,
            marketing_consent: validatedData.marketingConsent || false,
            variant: validatedData.page_variant || 'original',
            device: validatedData.device_type || 'desktop',
            source: validatedData.source || 'website',
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to track Plausible goal:', error);
    }

    return NextResponse.json({
      ok: true,
      id: requestId,
      message: 'Demo-pyyntö lähetetty onnistuneesti',
      email: {
        team: teamEmailResult.data?.id,
        customer: customerEmailResult.data?.id,
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAfter: Math.ceil(rateLimit.resetAfter / 1000),
      },
    });
  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Virhe demo-pyynnön käsittelyssä',
      },
      { status: 500 }
    );
  }
}
