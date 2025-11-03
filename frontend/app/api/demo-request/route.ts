import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { trackEvent } from '@/lib/analytics';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : (null as unknown as Resend);

// Track Plausible goal server-side
async function trackPlausibleGoal(goal: string, props?: Record<string, any>) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://converto.fi'}/api/analytics/plausible`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: goal, props }),
    });
  } catch (error) {
    console.warn('Failed to track Plausible goal:', error);
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, company, phone, message, source = 'storybrand' } = await req.json();

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Nimi, sähköposti ja yritys ovat pakollisia kenttiä' },
        { status: 400 }
      );
    }

    // Send emails in parallel
    const [teamEmail, userEmail] = await Promise.all([
      // Email to team
      resend.emails.send({
        from: 'info@converto.fi',
        to: 'team@converto.fi',
        subject: `Uusi demo-pyyntö: ${company}`,
        html: `
          <h2>Uusi demo-pyyntö</h2>
          <p><strong>Yritys:</strong> ${company}</p>
          <p><strong>Yhteyshenkilö:</strong> ${name}</p>
          <p><strong>Sähköposti:</strong> ${email}</p>
          ${phone ? `<p><strong>Puhelin:</strong> ${phone}</p>` : ''}
          ${message ? `<p><strong>Viesti:</strong> ${message}</p>` : ''}
          <p><strong>Lähde:</strong> ${source}</p>
          <p>Ota yhteyttä ja varaa demo-tapaaminen!</p>
        `,
      }),
      // Confirmation email to user
      resend.emails.send({
        from: 'info@converto.fi',
        to: email,
        subject: 'Kiitos demo-pyynnöstäsi! - Converto',
        html: `
          <h2>Kiitos demo-pyynnöstäsi!</h2>
          <p>Hei ${name},</p>
          <p>Olemme vastaanottaneet demo-pyyntösi yritykseltä ${company}.</p>
          <p>Tiimimme ottaa sinuun yhteyttä <strong>24 tunnin kuluessa</strong> ja sopii sopivan ajankohdan demo-tapaamiselle.</p>
          <p>Demo-tapaamisessa esittelemme:</p>
          <ul>
            <li>Converto Business OS:n keskeiset ominaisuudet</li>
            <li>Automaatio-ratkaisut yrityksellesi</li>
            <li>ROI-laskelmat ja aikataulut</li>
            <li>Käyttöönoton suunnitelman</li>
          </ul>
          <p style="margin: 30px 0;">
            <a href="https://converto.fi"
               style="background: linear-gradient(to right, #276BEE, #A855F7); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Lue lisää Converto Business OS:sta →
            </a>
          </p>
          <p>Odota kuulla meiltä!</p>
          <p>Ystävällisin terveisin,<br>Converto-tiimi</p>
        `,
      }),
    ]);

    // Track analytics events
    await Promise.all([
      trackPlausibleGoal('Demo Request', {
        company,
        email,
        source,
        phone: phone || 'not_provided',
      }),
      // PostHog tracking (if enabled)
      trackEvent('demo_request_submitted', {
        company,
        email,
        source,
        variant: source === 'storybrand' ? 'storybrand' : 'original',
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Demo-pyyntö lähetetty onnistuneesti',
      team_email_id: teamEmail.data?.id,
      user_email_id: userEmail.data?.id,
    });
  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      { error: 'Virhe demo-pyynnön käsittelyssä' },
      { status: 500 }
    );
  }
}
