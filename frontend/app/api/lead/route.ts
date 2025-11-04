import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, message, source = 'storybrand' } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!resend) {
      console.error('Resend API key not configured');
      return NextResponse.json(
        { error: 'Email service not available' },
        { status: 500 }
      );
    }

    // Prepare email HTML
    const teamEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; padding: 40px; border-radius: 12px; color: white;">
            <h1 style="color: #39FF14; margin-top: 0;">🎯 Uusi lead StoryBrand lomakkeesta</h1>

            <div style="background: rgba(57, 255, 20, 0.1); padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #39FF14;">
              <h2 style="color: #39FF14; margin-top: 0;">Yhteystiedot</h2>
              <p><strong>Nimi:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #39FF14;">${email}</a></p>
              ${company ? `<p><strong>Yritys:</strong> ${company}</p>` : ''}
            </div>

            ${message ? `
              <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #39FF14; margin-top: 0;">Viesti:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            ` : ''}

            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; margin: 20px 0; border-radius: 8px; font-size: 12px; color: #999;">
              <h3 style="color: #39FF14; margin-top: 0; font-size: 14px;">Metadata</h3>
              <p><strong>Lähde:</strong> ${source}</p>
              <p><strong>Aika:</strong> ${new Date().toISOString()}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Toiminta:</strong> Ota yhteyttä ja seurannutup.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const result = await resend.emails.send({
      from: 'Converto <info@converto.fi>',
      to: 'team@converto.fi',
      subject: `🎯 Uusi lead: ${company || name}`,
      html: teamEmailHtml,
      reply_to: email,
    });

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      email: {
        id: result.data?.id,
      },
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to submit lead',
      },
      { status: 500 }
    );
  }
}
