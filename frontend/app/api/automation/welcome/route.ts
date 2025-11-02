import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null as unknown as Resend;

export async function POST(req: Request) {
  try {
    const { leadId, email, name, company } = await req.json()

    // OPTIMIZED: Send immediate welcome email
    await resend.emails.send({
      from: "info@converto.fi", // Updated to verified domain
      to: email,
      subject: `${name}, tervetuloa Converto Business OS™ -ekosysteemiin!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Tervetuloa Converto-ekosysteemiin!</h1>
          <p>Hei ${name},</p>
          <p>Kiitos kiinnostuksestasi Converto Business OS™:ää kohtaan! Olemme innoissamme mahdollisuudesta auttaa ${company}:a automatisoimaan prosesseja ja kasvattamaan liikevaihto.</p>
          <h2>Mitä seuraavaksi?</h2>
          <ol>
            <li><strong>Demo-kutsu</strong> - Saat kalenterikutsun 24 tunnin sisällä</li>
            <li><strong>Business OS™ -pääsy</strong> - 30 päivän ilmainen pilotti</li>
            <li><strong>ROI-analyysi</strong> - Näytämme konkreettiset säästöt</li>
          </ol>
          <p>Ystävällisin terveisin,<br><strong>Converto-tiimi</strong></p>
        </div>
      `,
    })

    // OPTIMIZED: Schedule follow-up sequence (Day 3, 7) via direct API
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

    const now = new Date()

    // Day 3: Demo reminder
    const day3 = new Date(now)
    day3.setDate(day3.getDate() + 3)
    await scheduleEmail(
      email,
      `${name}, varataanpa demo-aika Business OS:lle?`,
      `<p>Hei ${name},<br>Haluaisitko varata demo-ajan? Vastaa tähän sähköpostiin!</p>`,
      day3
    )

    // Day 7: Final follow-up
    const day7 = new Date(now)
    day7.setDate(day7.getDate() + 7)
    await scheduleEmail(
      email,
      `${name}, kuinka voimme auttaa?`,
      `<p>Hei ${name},<br>Voimme auttaa optimoimaan ${company}:n prosesseja!</p>`,
      day7
    )

    return NextResponse.json({
      success: true,
      message: "Welcome email sent + sequence scheduled",
    })
  } catch (error) {
    console.error('Welcome automation error:', error)
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    )
  }
}
