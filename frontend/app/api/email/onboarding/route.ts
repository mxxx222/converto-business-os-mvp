import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend API key - can be server-side only (no NEXT_PUBLIC needed for API routes)
const resend = (process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY) ? new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY || '') : null as unknown as Resend;

const ONBOARDING_SEQUENCE = [
  {
    delay: 0, // Immediate
    subject: 'Tervetuloa Converto Business OS:ään! 🚀',
    template: 'welcome',
  },
  {
    delay: 1, // Day 1
    subject: 'Aloita ensimmäiset automaatiosi',
    template: 'day1',
  },
  {
    delay: 3, // Day 3
    subject: '5 vinkkiä maksimaaliseen säästöön',
    template: 'day3',
  },
  {
    delay: 7, // Day 7
    subject: 'Miten menee? Auta meitä auttamaan sinua',
    template: 'day7',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, plan } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Send welcome email immediately
    await sendWelcomeEmail(email, name || email.split('@')[0], plan);

    // Schedule other emails (would use a job queue in production)
    // For now, we'll return success and let backend handle scheduling

    return NextResponse.json({
      success: true,
      message: 'Onboarding sequence started'
    });
  } catch (error) {
    console.error('Onboarding email error:', error);
    return NextResponse.json(
      { error: 'Failed to start onboarding sequence' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, name: string, plan?: string) {
  const welcomeEmail = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tervetuloa Convertoon!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Tervetuloa Converto Business OS:ään!</h1>
        </div>

        <p>Hei ${name},</p>

        <p>Kiitos että liityit Converto Business OS -yhteisöön! Olet nyt yhden askeleen lähempänä täysin automatisoitua yritystäsi.</p>

        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h2 style="margin-top: 0; color: #1e40af;">📋 Seuraavat askeleet:</h2>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li style="margin: 8px 0;"><strong>Kokeile OCR-kuittien skannaus</strong> - Lataa ensimmäinen kuitti ja katso miten AI tunnistaa sen automaattisesti</li>
            <li style="margin: 8px 0;"><strong>Tutustu dashboardiin</strong> - Näe yrityksesi talouskatsaus yhdellä silmäyksellä</li>
            <li style="margin: 8px 0;"><strong>Aseta automaatiot</strong> - Valitse mitkä prosessit haluat automatisoida</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://converto.fi/dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Avaa Dashboard →
          </a>
        </div>

        <p>Jos sinulla on kysymyksiä, vastaa tähän viestiin tai ota yhteyttä <a href="mailto:hello@converto.fi">hello@converto.fi</a>.</p>

        <p>Mukavaa automatisoimista!<br>
        <strong>Converto Team</strong></p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Converto Business OS | <a href="https://converto.fi">converto.fi</a> |
          <a href="https://converto.fi/unsubscribe?email=${encodeURIComponent(email)}">Peruuta tilaus</a>
        </p>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Converto <hello@converto.fi>',
    to: email,
    subject: 'Tervetuloa Converto Business OS:ään! 🚀',
    html: welcomeEmail,
  });
}
