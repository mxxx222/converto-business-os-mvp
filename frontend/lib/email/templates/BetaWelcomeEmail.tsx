export function BetaWelcomeEmail({ signup }: { signup: any }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tervetuloa Converto Beta-ohjelmaan!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Tervetuloa Converto Beta-ohjelmaan!</h1>
          <p>Kiitos ilmoittautumisestasi, ${signup.contact_name}!</p>
        </div>

        <div class="content">
          <h2>Tervetuloa joukkoomme, ${signup.company_name}!</h2>

          <p>Olet nyt yksi ensimmäisistä yrityksistä, jotka testaavat Suomen johtavaa dokumenttien automaatioalustaa.</p>

          <h3>Mitä seuraavaksi tapahtuu:</h3>
          <ol>
            <li><strong>Heti:</strong> Saat vahvistuksen sähköpostitse</li>
            <li><strong>1 tunnin kuluttua:</strong> Henkilökohtainen demo-ajanvarauslinkki</li>
            <li><strong>24 tunnin sisällä:</strong> Puhelu asiakaspäälliköltämme</li>
            <li><strong>Viikon sisällä:</strong> Käyttövalmis järjestelmä yrityksellenne</li>
          </ol>

          <h3>Valitsemasi dokumenttityypit:</h3>
          <p>${signup.document_types?.join(', ') || 'Kaikki dokumenttityypit'}</p>

          <div style="text-align: center;">
            <a href="https://calendly.com/converto-demo" class="button">Varaa Demo Heti</a>
          </div>

          <p><strong>Tarvitsetko apua?</strong><br>
          Vastaamme yleensä alle 5 minuutissa: hello@converto.fi tai +358 40 123 4567</p>
        </div>

        <div class="footer">
          <p>Converto Business OS | Turku Science Park | Finland</p>
          <p>© 2025 Converto. Kaikki oikeudet pidätetään.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { html, subject: '🎉 Tervetuloa Converto Beta-ohjelmaan!' };
}