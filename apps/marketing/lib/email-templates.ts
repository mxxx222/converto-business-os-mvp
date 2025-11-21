export function betaSignupCustomerEmail(name: string, company: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .content h3 {
          color: #111827;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .content ol {
          padding-left: 20px;
        }
        .content li {
          margin-bottom: 8px;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 500;
        }
        .button:hover {
          background: #5568d3;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .container {
            padding: 10px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Tervetuloa DocFlow Betaan!</h1>
        </div>
        <div class="content">
          <p>Hei ${name},</p>
          
          <p>Kiitos mielenkiinnosta DocFlow'ta kohtaan! Olemme vastaanottaneet beta-ilmoittautumisesi yritykselle <strong>${company}</strong>.</p>
          
          <h3>Mitä seuraavaksi?</h3>
          <ol>
            <li>Käymme läpi beta-ilmoittautumisesi 1-2 arkipäivän sisällä</li>
            <li>Lähetämme sinulle henkilökohtaiset kirjautumistunnukset</li>
            <li>Sovimme 15 min kickoff-puhelun, jossa pääset alkuun</li>
          </ol>
          
          <p>Haluatko jo nyt varata ajan?</p>
          <a href="https://calendly.com/docflow/kickoff" class="button">📅 Varaa kickoff-aika</a>
          
          <p>Jos sinulla on kysyttävää, vastaamme mielellämme:</p>
          <ul>
            <li>📧 Email: <a href="mailto:support@docflow.fi">support@docflow.fi</a></li>
            <li>💬 Live chat: <a href="https://docflow.fi">docflow.fi</a></li>
          </ul>
          
          <p>Nähdään pian DocFlow'ssa!</p>
          <p><strong>DocFlow Team</strong></p>
        </div>
        <div class="footer">
          <p>DocFlow — Automatisoi dokumentit, säästä 70% ajasta</p>
          <p><a href="https://docflow.fi">docflow.fi</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function betaSignupAdminEmail(data: {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  monthly_invoices?: string
  weekly_feedback_ok?: boolean
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          padding: 20px;
          background: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
          color: #111827;
          margin-top: 0;
        }
        table {
          width: 100%;
          margin: 20px 0;
          border-collapse: collapse;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        td:first-child {
          font-weight: 600;
          width: 180px;
        }
        .highlight {
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
        }
        .next-steps {
          background: #eff6ff;
          padding: 16px;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        .next-steps ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .action-link {
          display: inline-block;
          margin-top: 16px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎯 New Beta Signup - DocFlow</h2>
        
        <table>
          <tr>
            <td>Company:</td>
            <td><span class="highlight">${data.company_name}</span></td>
          </tr>
          <tr>
            <td>Contact:</td>
            <td>${data.contact_name}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td>${data.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td>Monthly invoices:</td>
            <td>${data.monthly_invoices || 'Not provided'}</td>
          </tr>
          <tr>
            <td>Weekly feedback OK:</td>
            <td>${data.weekly_feedback_ok ? '✅ Yes' : '❌ No'}</td>
          </tr>
        </table>
        
        <div class="next-steps">
          <h3 style="margin-top: 0;">Next Steps:</h3>
          <ol>
            <li>Review company profile and fit</li>
            <li>Create Supabase account for ${data.email}</li>
            <li>Schedule kickoff call via Calendly</li>
            <li>Send welcome email with credentials</li>
          </ol>
        </div>
        
        <a href="https://supabase.com/dashboard/project/foejjbrcudpvuwdisnpz/editor" class="action-link">
          → View in Supabase Dashboard
        </a>
      </div>
    </body>
    </html>
  `
}

