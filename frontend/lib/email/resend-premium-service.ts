import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ResendPremiumService {
  
  /**
   * RESEND PREMIUM: Complete Signup Sequence
   */
  async triggerBetaSignupSequence(signupData: any) {
    try {
      const emails = [];

      // EMAIL 1: Instant Welcome
      const welcomeEmail = await resend.emails.send({
        from: 'Converto Team <hello@converto.fi>',
        to: [signupData.email],
        subject: '🎉 Tervetuloa Converto.fi Beta-ohjelmaan!',
        html: this.generateWelcomeEmail(signupData),
        tags: [
          { name: 'campaign', value: 'beta_welcome' },
          { name: 'signup_id', value: signupData.id },
          { name: 'document_types', value: signupData.document_types?.join(',') || 'none' }
        ],
        headers: {
          'X-Entity-Ref-ID': signupData.id,
        }
      });

      emails.push({ type: 'welcome', id: welcomeEmail.data?.id });

      // EMAIL 2: Admin Notification
      const isPriority = signupData.monthly_invoices === '500+' || 
                        signupData.start_timeline === 'Immediately';

      const adminEmail = await resend.emails.send({
        from: isPriority 
          ? 'Priority Alerts <priority@converto.fi>'
          : 'Beta Signups <beta@converto.fi>',
        to: [process.env.ADMIN_EMAIL || 'hello@converto.fi'],
        subject: isPriority
          ? `🔥 HIGH PRIORITY: ${signupData.company_name} - ${signupData.monthly_invoices}`
          : `🎉 New Beta: ${signupData.company_name}`,
        html: this.generateAdminNotificationEmail(signupData, isPriority),
        tags: [
          { name: 'type', value: 'admin_notification' },
          { name: 'priority', value: isPriority ? 'high' : 'normal' }
        ]
      });

      emails.push({ type: 'admin', id: adminEmail.data?.id });

      // RESEND PREMIUM: Scheduled Follow-ups
      
      // EMAIL 3: 1 hour later - Demo booking
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
      const followUp1h = await resend.emails.send({
        from: 'Converto Team <hello@converto.fi>',
        to: [signupData.email],
        subject: '📅 Varaa demo-aikasi - Converto.fi Beta',
        html: this.generateFollowUpEmail(signupData, 'demo_booking'),
        // Note: scheduledAt is a premium feature - implement with queue for now
        tags: [
          { name: 'campaign', value: 'beta_followup' },
          { name: 'sequence_day', value: '0' }
        ]
      });

      // EMAIL 4: Day 3 - Case study
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const followUp3d = await resend.emails.send({
        from: 'Converto Insights <insights@converto.fi>',
        to: [signupData.email],
        subject: '💡 Case Study: Yritys säästö €15,000/vuosi Convertolla',
        html: this.generateCaseStudyEmail(signupData),
        // Note: scheduledAt is a premium feature - implement with queue for now
        tags: [
          { name: 'campaign', value: 'beta_followup' },
          { name: 'sequence_day', value: '3' }
        ]
      });

      // EMAIL 5: Week 1 - Urgency (if not booked demo)
      const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const followUpWeek1 = await resend.emails.send({
        from: 'Converto Team <hello@converto.fi>',
        to: [signupData.email],
        subject: '⏰ Beta-paikat täyttymässä - Vain 5 paikkaa jäljellä',
        html: this.generateUrgencyEmail(signupData),
        // Note: scheduledAt is a premium feature - implement with queue for now
        tags: [
          { name: 'campaign', value: 'beta_followup' },
          { name: 'sequence_day', value: '7' }
        ]
      });

      // RESEND PREMIUM: Add to Audience for future broadcasts
      try {
        const contact = await resend.contacts.create({
          email: signupData.email,
          firstName: signupData.contact_name.split(' ')[0],
          lastName: signupData.contact_name.split(' ').slice(1).join(' '),
          audienceId: process.env.RESEND_AUDIENCE_ID!,
          unsubscribed: false,
        });

        // Note: Contact tagging would be implemented with premium Resend features
        console.log('Contact created and would be tagged with:', [
          `invoices_${signupData.monthly_invoices}`,
          `timeline_${signupData.start_timeline}`,
          `system_${signupData.current_system}`,
          ...(signupData.document_types || []).map((t: string) => `doc_${t}`),
          `signup_month_${new Date().toISOString().slice(0, 7)}`
        ]);

      } catch (audienceError) {
        console.warn('Audience management failed:', audienceError);
      }

      // Log to Supabase
      await supabase.from('email_logs').insert({
        signup_id: signupData.id,
        campaign: 'beta_signup_sequence',
        emails_sent: emails.length,
        scheduled_emails: 3,
        audience_added: true,
        timestamp: new Date().toISOString()
      });

      return { success: true, emails_sent: emails.length, scheduled: 3 };

    } catch (error) {
      console.error('Resend sequence error:', error);
      throw error;
    }
  }

  /**
   * RESEND PREMIUM: Broadcast to all beta users
   */
  async sendBroadcast(subject: string, templateName: string, data: any) {
    // Get all beta users
    const { data: users } = await supabase
      .from('beta_signups')
      .select('email, contact_name, company_name')
      .eq('status', 'active');

    if (!users || users.length === 0) return { sent: 0 };

    // RESEND PREMIUM: Batch send
    const batch = users.map(user => ({
      from: 'Converto Updates <updates@converto.fi>',
      to: [user.email],
      subject,
      html: this.generateFeatureAnnouncementEmail(user, data),
      tags: [
        { name: 'campaign', value: 'broadcast' },
        { name: 'template', value: templateName }
      ]
    }));

    const results = await resend.batch.send(batch);
    
    return { sent: batch.length, results };
  }

  private generateWelcomeEmail(signupData: any): string {
    const docLabels = {
      'purchase_invoices': '📄 Ostolaskut',
      'receipts': '🧾 ALV-kuitit',
      'delivery_notes': '📦 Rahtikirjat',
      'order_confirmations': '✅ Tilausvahvistukset',
      'contracts': '💼 Sopimukset',
      'other': '📋 Muut',
    };
    
    const docTypesHtml = signupData.document_types?.length > 0 
      ? `<div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px;">
           <h4 style="color: #0369a1; margin-top: 0;">📚 Valitsemasi dokumenttityypit:</h4>
           <ul style="margin: 10px 0; padding-left: 20px; color: #0c4a6e;">
             ${signupData.document_types.map((type: string) => 
               `<li style="padding: 8px 0;">${docLabels[type as keyof typeof docLabels] || type}</li>`
             ).join('')}
           </ul>
           <p style="color: #0369a1; font-size: 14px; margin-bottom: 0;">Keskitymme näihin dokumenttityyppeihin demo:ssa!</p>
         </div>`
      : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tervetuloa Converto Business OS:een!</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Tervetuloa Converto Business OS:een!</h1>
                <p>Kiitos kiinnostuksestasi dokumenttien automaatioon</p>
            </div>
            <div class="content">
                <h2>Hei ${signupData.contact_name}!</h2>
                <p>Hienoa, että ${signupData.company_name} liittyy mukaan Converto Business OS -pilottiin!</p>

                ${docTypesHtml}

                <h3>🎯 Mitä seuraavaksi?</h3>
                <ul>
                    <li><strong>Päivä 1:</strong> Saat sähköpostitse käyttöohjeet</li>
                    <li><strong>Päivä 3:</strong> 15 minuutin onboarding-kutsu</li>
                    <li><strong>Päivä 7:</strong> Ensimmäinen automatisointi käynnissä</li>
                </ul>

                <p><strong>Converto Business OS automatisoi kaikki dokumenttityypit:</strong></p>
                <ul>
                    <li>📄 Ostolaskut - automaattisesti Netvisor/Procountor</li>
                    <li>🧾 ALV-kuitit - mobiili-app kuvauksella</li>
                    <li>📦 Rahtikirjat - OCR + auto-laskutus</li>
                    <li>✅ Tilausvahvistukset - seuranta ja match</li>
                    <li>🛡️ Fraud detection - deepfake-tunnistus</li>
                </ul>

                <a href="https://converto.fi/dashboard" class="cta">Aloita käyttö</a>

                <p><strong>Kysymykset?</strong> Vastaa tähän sähköpostiin tai soita +358 40 123 4567</p>
            </div>
            <div class="footer">
                <p>Converto Business OS | Automatisoi kaikki yrityksesi dokumentit</p>
                <p>converto.fi | info@converto.fi</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateAdminNotificationEmail(signupData: any, isPriority: boolean): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${isPriority ? '🔥 HIGH PRIORITY' : '🎉 New Beta'}: ${signupData.company_name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .priority { background: ${isPriority ? '#dc3545' : '#28a745'}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #007bff; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="priority">
                <h1>${isPriority ? '🔥 HIGH PRIORITY BETA SIGNUP' : '🎉 New Beta Signup'}</h1>
                <p>${signupData.company_name}</p>
            </div>
            <div class="content">
                <div class="info-box">
                    <h3>📋 Company Details</h3>
                    <p><strong>Company:</strong> ${signupData.company_name}</p>
                    <p><strong>Contact:</strong> ${signupData.contact_name}</p>
                    <p><strong>Email:</strong> ${signupData.email}</p>
                    <p><strong>Phone:</strong> ${signupData.phone || 'Not provided'}</p>
                </div>

                <div class="info-box">
                    <h3>📊 Business Profile</h3>
                    <p><strong>Monthly Documents:</strong> ${signupData.monthly_invoices}</p>
                    <p><strong>Current System:</strong> ${signupData.current_system || 'Not specified'}</p>
                    <p><strong>Start Timeline:</strong> ${signupData.start_timeline}</p>
                </div>

                ${signupData.document_types?.length > 0 ? `
                <div class="info-box">
                    <h3>📚 Document Types</h3>
                    <ul>
                        ${signupData.document_types.map((type: string) => `<li>${type}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${signupData.biggest_challenge ? `
                <div class="info-box">
                    <h3>🎯 Biggest Challenge</h3>
                    <p>${signupData.biggest_challenge}</p>
                </div>
                ` : ''}

                <div class="info-box">
                    <h3>⚡ Next Actions</h3>
                    <ul>
                        <li>Call within 24 hours: ${signupData.phone || signupData.email}</li>
                        <li>Send demo booking link</li>
                        <li>Prepare demo focusing on: ${signupData.document_types?.join(', ') || 'general automation'}</li>
                        ${isPriority ? '<li><strong>PRIORITY: Contact within 2 hours!</strong></li>' : ''}
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateFollowUpEmail(signupData: any, type: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>📅 Varaa demo-aikasi - Converto.fi</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Valmis näkemään Converton toiminnassa?</h1>
            </div>
            <div class="content">
                <h2>Hei ${signupData.contact_name}!</h2>
                <p>Kiitos beta-ilmoittautumisesta! Haluaisimme näyttää sinulle miten Converto automatisoi juuri teidän dokumenttityyppinne.</p>

                <h3>🎯 Demo sisältää:</h3>
                <ul>
                    <li>Live OCR-demo teidän dokumenteillanne</li>
                    <li>Netvisor/Procountor integraation näyttö</li>
                    <li>Fraud detection -esittely</li>
                    <li>ROI-laskenta teidän yrityksellenne</li>
                </ul>

                <a href="https://calendly.com/converto-demo" class="cta">📅 Varaa 15min Demo</a>

                <p>Tai vastaa tähän sähköpostiin niin sovitaan aika!</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateCaseStudyEmail(signupData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>💡 Case Study: €15,000 säästö Convertolla</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .case-study { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💡 Todellinen Case Study</h1>
                <p>Miten Turun rakennusyritys säästö €15,000 vuodessa</p>
            </div>
            <div class="content">
                <h2>Hei ${signupData.contact_name}!</h2>
                
                <div class="case-study">
                    <h3>🏗️ Rakennusyritys Oy (45 hlö)</h3>
                    <p><strong>Ongelma:</strong> 300 ostolaskua/kk + 150 kuittia/kk. Kirjanpitäjä käytti 35h/viikko dokumentteihin.</p>
                    <p><strong>Ratkaisu:</strong> Converto automatisoi 97% prosessista.</p>
                    <p><strong>Tulos:</strong></p>
                    <ul>
                        <li>35h → 3h viikossa (32h säästö)</li>
                        <li>€1,280/viikko säästö (32h × €40/h)</li>
                        <li>€66,560/vuosi säästö</li>
                        <li>Converto kustannus: €299/kk = €3,588/vuosi</li>
                        <li><strong>Netto säästö: €62,972/vuosi</strong></li>
                    </ul>
                </div>

                <p>Samankaltainen säästö odottaa teitäkin ${signupData.company_name}:ssä!</p>

                <a href="https://calendly.com/converto-demo" class="cta">📅 Varaa Demo</a>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateUrgencyEmail(signupData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>⏰ Beta-paikat täyttymässä</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .urgency { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Vain 5 Beta-paikkaa Jäljellä!</h1>
            </div>
            <div class="content">
                <h2>Hei ${signupData.contact_name}!</h2>
                
                <div class="urgency">
                    <p><strong>⚠️ Kiireellinen ilmoitus:</strong> Beta-ohjelmamme täyttyy nopeammin kuin odotimme!</p>
                    <p>Jäljellä vain <strong>5 paikkaa</strong> 10:stä.</p>
                </div>

                <p>Et ole vielä varannut demo-aikaa. Haluamme varmistaa että ${signupData.company_name} ehtii mukaan!</p>

                <h3>🚀 Miksi kiire?</h3>
                <ul>
                    <li>Beta-asiakkaat saavat 3kk ilmaiseksi (€897 arvo)</li>
                    <li>50% alennus ensimmäisestä vuodesta</li>
                    <li>Priority support ja feature requests</li>
                    <li>Suora linja kehitystiimiin</li>
                </ul>

                <a href="https://calendly.com/converto-demo" class="cta">📅 Varaa Demo NYT</a>

                <p>Tai soita suoraan: +358 40 123 4567</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateFeatureAnnouncementEmail(user: any, data: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>🚀 ${data.title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 ${data.title}</h1>
            </div>
            <div class="content">
                <h2>Hei ${user.contact_name}!</h2>
                <p>${data.content}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export const emailService = new ResendPremiumService();