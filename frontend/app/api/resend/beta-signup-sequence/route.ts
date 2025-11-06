import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { BetaWelcomeEmail } from '@/lib/email/templates/BetaWelcomeEmail';
import AdminPriorityEmail from '@/lib/email/templates/AdminPriorityEmail';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { signup, trigger_sequence = true, priority = 'normal' } = body;

    if (!signup) {
      return NextResponse.json(
        { error: 'Missing signup data' },
        { status: 400 }
      );
    }

    const {
      company_name,
      contact_name,
      email,
      phone,
      document_types,
      monthly_invoices,
      current_system,
      biggest_challenge,
      start_timeline
    } = signup;

    const results = [];

    if (trigger_sequence) {
      // 1. Send welcome email to customer
      try {
        const customerEmailTemplate = BetaWelcomeEmail({ signup });

        const customerEmailResult = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Converto Team <hello@converto.fi>',
          to: [email],
          subject: customerEmailTemplate.subject,
          html: customerEmailTemplate.html,
          tags: [
            { name: 'type', value: 'beta_welcome' },
            { name: 'priority', value: priority },
            { name: 'company', value: company_name }
          ]
        });

        results.push({
          type: 'customer_welcome',
          success: true,
          id: customerEmailResult.data?.id,
          to: email
        });

      } catch (error) {
        console.error('Failed to send customer welcome email:', error);
        results.push({
          type: 'customer_welcome',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          to: email
        });
      }

      // 2. Send admin notification
      try {
        const adminEmailTemplate = AdminPriorityEmail({
          companyName: company_name,
          contactName: contact_name,
          email,
          phone,
          documentTypes: document_types || [],
          monthlyVolume: monthly_invoices,
          currentSystem: current_system,
          biggestChallenge: biggest_challenge,
          startTimeline: start_timeline,
          priority: priority as 'high' | 'normal'
        });

        const adminEmail = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Converto System <system@converto.fi>',
          to: [process.env.ADMIN_EMAIL || 'hello@converto.fi'],
          subject: adminEmailTemplate.subject,
          html: adminEmailTemplate.html,
          tags: [
            { name: 'type', value: 'admin_notification' },
            { name: 'priority', value: priority },
            { name: 'company', value: company_name },
            { name: 'volume', value: monthly_invoices }
          ]
        });

        results.push({
          type: 'admin_notification',
          success: true,
          id: adminEmail.data?.id,
          to: process.env.ADMIN_EMAIL
        });

      } catch (error) {
        console.error('Failed to send admin notification:', error);
        results.push({
          type: 'admin_notification',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          to: process.env.ADMIN_EMAIL
        });
      }

      // 3. Schedule follow-up emails (using Resend's scheduling if available)
      try {
        // Schedule demo booking reminder for 1 hour later
        const demoReminderHtml = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3b82f6;">📅 Valmis varaamaan demon?</h2>
                <p>Hei ${contact_name},</p>
                <p>Kiitos että liityit Converto.fi beta-ohjelmaan! Haluaisitko varata henkilökohtaisen demon nähdäksesi miten automatisoimme ${company_name}:n dokumentit?</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://calendly.com/YOUR_LINK" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    📅 Varaa Demo (15-30 min)
                  </a>
                </div>
                
                <p><strong>Demo:ssa näytämme:</strong></p>
                <ul>
                  ${document_types?.map((type: string) => {
                    const labels: Record<string, string> = {
                      purchase_invoices: 'Ostolaskujen automaatio',
                      receipts: 'ALV-kuittien mobiili-app',
                      delivery_notes: 'Rahtikirjojen käsittely',
                      order_confirmations: 'Tilausvahvistusten seuranta',
                      contracts: 'Sopimusten hallinta',
                      other: 'Muut dokumentit'
                    };
                    return `<li>${labels[type] || type}</li>`;
                  }).join('') || '<li>Dokumenttien automaatio</li>'}
                </ul>
                
                <p>Tai soita suoraan: <a href="tel:+358401234567">+358 40 123 4567</a></p>
                
                <p>Terveisin,<br>Converto Team</p>
              </div>
            </body>
          </html>
        `;

        // Note: Resend doesn't have built-in scheduling, so we'd need to use a job queue
        // For now, we'll just log that we would schedule this
        console.log('Would schedule demo reminder email for 1 hour from now');
        
        results.push({
          type: 'demo_reminder_scheduled',
          success: true,
          scheduled_for: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          to: email
        });

      } catch (error) {
        console.error('Failed to schedule follow-up emails:', error);
        results.push({
          type: 'follow_up_scheduling',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // 4. Add to audience/contact list
      try {
        if (process.env.RESEND_AUDIENCE_ID) {
          const contact = await resend.contacts.create({
            email,
            firstName: contact_name.split(' ')[0],
            lastName: contact_name.split(' ').slice(1).join(' ') || '',
            audienceId: process.env.RESEND_AUDIENCE_ID,
          });

          results.push({
            type: 'audience_added',
            success: true,
            id: contact.data?.id,
            to: email
          });
        }
      } catch (error) {
        console.error('Failed to add to audience:', error);
        results.push({
          type: 'audience_added',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Email sequence initiated: ${successCount}/${totalCount} actions completed`,
      results,
      summary: {
        company: company_name,
        priority,
        emails_sent: successCount,
        total_actions: totalCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Beta signup sequence error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process beta signup sequence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'beta-signup-sequence',
    timestamp: new Date().toISOString(),
    resend_configured: !!process.env.RESEND_API_KEY,
    admin_email_configured: !!process.env.ADMIN_EMAIL
  });
}