import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { trackPilotSignup } from '@/lib/analytics/posthog';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send launch announcement email
 */
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    // Track signup
    trackPilotSignup(email, 'launch_announcement');

    // Send welcome email
    if (!resend) {
      console.warn('Resend API key not configured, skipping email send');
      return NextResponse.json({ success: true, message: 'Launch announcement queued (email not configured)' });
    }

    await resend.emails.send({
      from: 'info@converto.fi',
      to: email,
      subject: '🎉 Converto Business OS on Nyt Live!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Converto Business OS - Live Now!</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #276BEE; font-size: 32px; margin-bottom: 10px;">🎉 Converto Business OS on Nyt Live!</h1>
              <p style="font-size: 18px; color: #666;">Aloita ilmainen 30 päivän pilotti tänään</p>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px; text-align: center;">
              <h2 style="margin-top: 0; font-size: 24px;">Hei ${name}! 👋</h2>
              <p style="font-size: 18px; margin-bottom: 20px;">
                Converto Business OS on nyt virallisesti tuotannossa! Automatisoi yrityksesi kirjanpito, ALV-laskelmat ja asiakaspalvelu.
              </p>
              <div style="background: white; color: #333; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #276BEE; margin-bottom: 10px;">ROI: +800%</div>
                <div style="font-size: 16px;">Säästä 8h/viikko • Takaisinmaksuaika 3-6 kk</div>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #276BEE; margin-top: 0;">🎁 Ensimmäiset 50 Yritystä Saavat:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;">✅ <strong>30 päivää ilmaiseksi</strong> (ei korttitietoja)</li>
                <li style="margin-bottom: 10px;">✅ <strong>Prioritoidut tuki</strong> (nopea vastausaika)</li>
                <li style="margin-bottom: 10px;">✅ <strong>ROI-analyysi</strong> (automaattinen säästölaskelma)</li>
                <li style="margin-bottom: 10px;">✅ <strong>20% launch-alennus</strong> ensimmäiseltä vuosilta</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://converto.fi/business-os/pilot"
                 style="display: inline-block; background: linear-gradient(135deg, #276BEE 0%, #A855F7 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                Aloita Ilmainen Pilotti →
              </a>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #1976d2; margin-top: 0;">📊 Performance Metrics</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #1976d2;">1.8s</div>
                  <div style="font-size: 12px; color: #666;">LCP (Largest Contentful Paint)</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #1976d2;">45ms</div>
                  <div style="font-size: 12px; color: #666;">FID (First Input Delay)</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #1976d2;">99.95%</div>
                  <div style="font-size: 12px; color: #666;">Uptime</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #1976d2;">92%</div>
                  <div style="font-size: 12px; color: #666;">Cache Hit Rate</div>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
              <p>Kiitos kiinnostuksestasi! Jos sinulla on kysymyksiä, vastaa tähän viestiin.</p>
              <p style="margin-top: 20px;">
                <a href="https://converto.fi" style="color: #276BEE; text-decoration: none;">converto.fi</a> |
                <a href="https://converto.fi/launch" style="color: #276BEE; text-decoration: none;">Launch Page</a> |
                <a href="mailto:info@converto.fi" style="color: #276BEE; text-decoration: none;">info@converto.fi</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, message: 'Launch announcement email sent' });
  } catch (error: any) {
    console.error('Error sending launch announcement:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
