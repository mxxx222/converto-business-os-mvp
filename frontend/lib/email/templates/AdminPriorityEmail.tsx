export default function AdminPriorityEmail({
  companyName,
  contactName,
  email,
  phone,
  documentTypes,
  monthlyVolume,
  currentSystem,
  biggestChallenge,
  startTimeline,
  priority
}: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  documentTypes: string[];
  monthlyVolume: string;
  currentSystem?: string;
  biggestChallenge?: string;
  startTimeline: string;
  priority: 'high' | 'normal';
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${priority === 'high' ? '🚨 HIGH PRIORITY: ' : ''}New Beta Signup: ${companyName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${priority === 'high' ? '#dc2626' : '#2563eb'}; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .priority { background: ${priority === 'high' ? '#fef2f2' : '#eff6ff'}; border: 2px solid ${priority === 'high' ? '#dc2626' : '#2563eb'}; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${priority === 'high' ? '🚨 HIGH PRIORITY' : '🚀 New Beta Signup'}</h1>
          <h2>${companyName}</h2>
        </div>

        <div class="content">
          <div class="priority">
            <h3 style="margin-top: 0; color: ${priority === 'high' ? '#dc2626' : '#2563eb'};">${priority === 'high' ? 'URGENT ACTION REQUIRED' : 'Normal Priority'}</h3>
            <p><strong>Monthly Volume:</strong> ${monthlyVolume} documents</p>
            <p><strong>Start Timeline:</strong> ${startTimeline}</p>
          </div>

          <h3>Contact Information</h3>
          <ul>
            <li><strong>Name:</strong> ${contactName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
          </ul>

          <h3>Document Types</h3>
          <ul>
            ${documentTypes?.map(type => `<li>${type}</li>`).join('') || '<li>Not specified</li>'}
          </ul>

          ${currentSystem ? `
          <h3>Current System</h3>
          <p>${currentSystem}</p>
          ` : ''}

          ${biggestChallenge ? `
          <h3>Biggest Challenge</h3>
          <p>${biggestChallenge}</p>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${email}" class="button">📧 Reply to Customer</a>
            <a href="tel:${phone}" class="button">📞 Call Customer</a>
            <a href="https://calendly.com/converto-demo" class="button">📅 Schedule Demo</a>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Send Calendly link for demo booking</li>
            <li>Call within 24 hours for high priority</li>
            <li>Add to CRM and follow-up sequence</li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `;

  return { html, subject: `${priority === 'high' ? '[HIGH PRIORITY] ' : ''}New Beta Signup: ${companyName} (${monthlyVolume} docs/month)` };
}