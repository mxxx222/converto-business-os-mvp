import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null as unknown as Resend;

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
    const { name, email, company } = await req.json()

    // Validate input
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "Kaikki kentät ovat pakollisia" },
        { status: 400 }
      )
    }

    // OPTIMIZED: Send both emails immediately (using parallel requests)
    const [teamEmail, userEmail] = await Promise.all([
      resend.emails.send({
        from: "info@converto.fi", // Updated to verified domain
        to: "team@converto.fi",
        subject: `Uusi pilotti-ilmoittautuminen: ${company}`,
        html: `
          <h2>Uusi pilotti-ilmoittautuminen</h2>
          <p><strong>Yritys:</strong> ${company}</p>
          <p><strong>Yhteyshenkilö:</strong> ${name}</p>
          <p><strong>Sähköposti:</strong> ${email}</p>
          <p>Ota yhteyttä ja aloita pilottiohjelma!</p>
        `,
      }),
      resend.emails.send({
        from: "info@converto.fi",
        to: email,
        subject: "Tervetuloa Converto Business OS pilottiin!",
        html: `
          <h2>Kiitos ilmoittautumisesta!</h2>
          <p>Hei ${name},</p>
          <p>Olemme vastaanottaneet ilmoittautumisesi Converto Business OS pilottiohjelmaan.</p>
          <p>Tiimimme ottaa sinuun yhteyttä pian ja auttaa sinua pääsemään alkuun.</p>
          <p>Odota kuulla meiltä!</p>
          <p>Ystävällisin terveisin,<br>Converto-tiimi</p>
        `,
      }),
    ])

    // OPTIMIZED: Schedule welcome sequence (Day 3, 7) via direct API
    const day3 = new Date()
    day3.setDate(day3.getDate() + 3)

    const day7 = new Date()
    day7.setDate(day7.getDate() + 7)

    // Schedule follow-up emails using direct API calls
    const scheduleEmail = async (to: string, subject: string, html: string, scheduledAt: Date) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "info@converto.fi",
          to,
          subject,
          html,
          scheduled_at: scheduledAt.toISOString(),
        }),
      })
      return response.json()
    }

    await Promise.all([
      scheduleEmail(
        email,
        `${name}, kuinka eteneekä Business OS:lla?`,
        `<p>Hei ${name},<br>Kysymyksiä? Vastaa tähän sähköpostiin!</p>`,
        day3
      ),
      scheduleEmail(
        email,
        `${name}, tarvitsetko apua Business OS:lla?`,
        `<p>Hei ${name},<br>Voimme auttaa optimoimaan käyttöäsi!</p>`,
        day7
      ),
    ])

            // OPTIMIZED: Track Plausible goal (Pilot Signup)
            await trackPlausibleGoal('Pilot Signup', {
              company,
              email,
              source: 'pilot_signup_form',
            });

            return NextResponse.json({
              ok: true,
              message: "Ilmoittautuminen lähetetty + sequence scheduled",
              team_email_id: teamEmail.data?.id,
              user_email_id: userEmail.data?.id,
            })
  } catch (error) {
    console.error("Pilot signup error:", error)
    return NextResponse.json(
      { error: "Virhe ilmoittautumisen käsittelyssä" },
      { status: 500 }
    )
  }
}
