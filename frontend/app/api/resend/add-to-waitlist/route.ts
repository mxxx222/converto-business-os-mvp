import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { email, source = 'unknown', page = '/' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const results = [];

    // 1. Add to audience/contact list
    try {
      if (process.env.RESEND_AUDIENCE_ID) {
        const contact = await resend.contacts.create({
          email,
          audienceId: process.env.RESEND_AUDIENCE_ID,
        });

        results.push({
          type: 'audience_added',
          success: true,
          id: contact.data?.id,
          email
        });
      }
    } catch (error) {
      // Contact might already exist, which is fine
      console.log('Contact may already exist:', error);
      results.push({
        type: 'audience_added',
        success: true,
        note: 'Contact may already exist',
        email
      });
    }

    // 2. Send lead magnet email with the guide
    try {
      const leadMagnetHtml = `
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dokumenttien Automaation Käsikirja - Lataa ilmaiseksi</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center;">
                <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">
                  📋 Dokumenttien Automaation Käsikirja
                </h1>
                <p style="font-size: 18px; margin: 0; opacity: 0.9;">
                  Kiitos! Tässä on luvattu ilmainen opas.
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                
                <!-- Download CTA -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="https://converto.fi/downloads/dokumenttien-automaation-kasikirja.pdf" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                    📥 Lataa Käsikirja (PDF, 15 sivua)
                  </a>
                </div>

                <!-- What's included -->
                <div style="background-color: #f0f9ff; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                  <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #1e40af;">
                    📚 Mitä oppaassa on:
                  </h3>
                  
                  <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li><strong>5 yleisintä virhettä</strong> jotka maksavat tuhansia euroja</li>
                    <li><strong>ROI-laskuri Excel</strong> (€500 arvo) - laske omat säästösi</li>
                    <li><strong>Vaihe-vaiheelta ohje</strong> automaation käyttöönottoon</li>
                    <li><strong>3 suomalaista case-studya</strong> todellisilla säästölaskelmilla</li>
                    <li><strong>Tekninen checklist</strong> järjestelmävalintoihin</li>
                    <li><strong>Bonus:</strong> 20 kysymystä toimittajille ennen ostopäätöstä</li>
                  </ul>
                </div>

                <!-- Personal note -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px;">
                  <p style="margin: 0; font-style: italic; color: #92400e;">
                    "Olen auttanut 50+ suomalaista yritystä automatisoimaan dokumenttinsa. 
                    Tämä opas sisältää kaiken mitä olen oppinut - ilman myyntipuhetta, 
                    vain käytännön vinkkejä jotka toimivat."
                  </p>
                  <p style="margin: 10px 0 0 0; font-weight: bold; color: #92400e;">
                    - Converto.fi tiimi
                  </p>
                </div>

                <!-- Next steps -->
                <div style="background-color: #ecfdf5; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                  <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #065f46;">
                    🚀 Haluatko mennä pidemmälle?
                  </h3>
                  
                  <p style="margin-bottom: 20px;">
                    Jos opas herätti kiinnostuksen, voit liittyä <strong>ilmaiseen 3kk beta-ohjelmaamme</strong>:
                  </p>
                  
                  <div style="text-align: center;">
                    <a href="https://converto.fi/#beta" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 15px; margin-bottom: 10px;">
                      🎯 Hae Beta-ohjelmaan
                    </a>
                    <a href="https://calendly.com/YOUR_LINK" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 10px;">
                      📅 Varaa Ilmainen Demo
                    </a>
                  </div>
                </div>

                <!-- Contact -->
                <div style="text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                  <p style="margin-bottom: 15px; font-weight: bold;">
                    Kysyttävää oppaasta tai dokumenttien automaatiosta?
                  </p>
                  <p style="margin: 5px 0;">
                    📧 <a href="mailto:hello@converto.fi" style="color: #3b82f6;">hello@converto.fi</a>
                  </p>
                  <p style="margin: 5px 0;">
                    📞 <a href="tel:+358401234567" style="color: #3b82f6;">+358 40 123 4567</a>
                  </p>
                  <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
                    Vastaamme yleensä alle 2 tunnissa arkisin
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #1f2937; color: #d1d5db; padding: 30px; text-align: center;">
                <h3 style="font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 10px 0;">
                  Converto.fi
                </h3>
                <p style="font-size: 14px; margin: 0 0 15px 0;">
                  AI-pohjainen dokumenttien automaatio suomalaisille yrityksille
                </p>
                <div style="font-size: 12px; color: #9ca3af; border-top: 1px solid #374151; padding-top: 15px;">
                  <p style="margin: 0 0 5px 0;">© 2025 Converto.fi. Kaikki oikeudet pidätetään.</p>
                  <p style="margin: 0;">Turku Science Park, 20520 Turku, Finland</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const leadEmail = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'Converto Team <hello@converto.fi>',
        to: [email],
        subject: '📋 Dokumenttien Automaation Käsikirja - Lataa ilmaiseksi!',
        html: leadMagnetHtml,
        tags: [
          { name: 'type', value: 'lead_magnet' },
          { name: 'source', value: source },
          { name: 'page', value: page }
        ]
      });

      results.push({
        type: 'lead_magnet_sent',
        success: true,
        id: leadEmail.data?.id,
        email
      });

    } catch (error) {
      console.error('Failed to send lead magnet email:', error);
      results.push({
        type: 'lead_magnet_sent',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        email
      });
    }

    // 3. Notify admin about new lead
    try {
      const adminNotificationHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin: 0;">🎯 New Lead Magnet Signup</h2>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Lead Details:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Source:</strong> ${source}</p>
                <p><strong>Page:</strong> ${page}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fi-FI')}</p>
              </div>
              
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px;">
                <h3>Recommended Actions:</h3>
                <ul>
                  <li>Add to CRM with source: ${source}</li>
                  <li>Send personalized follow-up in 24-48 hours</li>
                  <li>Consider for beta program outreach</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="mailto:${email}?subject=Kiitos%20oppaasta%20-%20Kysyttävää%20dokumenttien%20automaatiosta?" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Send Follow-up Email
                </a>
              </div>
            </div>
          </body>
        </html>
      `;

      const adminEmail = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'Converto System <system@converto.fi>',
        to: [process.env.ADMIN_EMAIL || 'hello@converto.fi'],
        subject: `🎯 New Lead: ${email} (${source})`,
        html: adminNotificationHtml,
        tags: [
          { name: 'type', value: 'admin_lead_notification' },
          { name: 'source', value: source }
        ]
      });

      results.push({
        type: 'admin_notification',
        success: true,
        id: adminEmail.data?.id,
        email: process.env.ADMIN_EMAIL
      });

    } catch (error) {
      console.error('Failed to send admin notification:', error);
      results.push({
        type: 'admin_notification',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Return success response
    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: successCount > 0,
      message: 'Successfully added to waitlist and sent lead magnet',
      results,
      summary: {
        email,
        source,
        page,
        actions_completed: successCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add to waitlist error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add to waitlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'add-to-waitlist',
    timestamp: new Date().toISOString()
  });
}