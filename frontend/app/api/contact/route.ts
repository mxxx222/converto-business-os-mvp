import { NextResponse } from "next/server"

function required(v?: string): string {
  if (!v || !String(v).trim()) throw new Error('Pakollinen tieto puuttuu')
  return v.trim()
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const payload = {
      firstName: required(formData.get('firstName')?.toString()),
      lastName: required(formData.get('lastName')?.toString()),
      email: required(formData.get('email')?.toString()),
      company: formData.get('company')?.toString() || '',
      topic: formData.get('topic')?.toString() || 'general',
      message: required(formData.get('message')?.toString()),
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(payload.email)) {
      throw new Error('Virheellinen sähköpostiosoite')
    }

    // TODO: Send email via Resend or SMTP
    // await resend.emails.send({
    //   from: 'DocFlow <no-reply@converto.fi>',
    //   to: 'support@converto.fi',
    //   subject: `Yhteydenotto: ${payload.topic} - ${payload.firstName} ${payload.lastName}`,
    //   html: `
    //     <h2>Uusi yhteydenotto DocFlow-sivustolta</h2>
    //     <p><strong>Nimi:</strong> ${payload.firstName} ${payload.lastName}</p>
    //     <p><strong>Sähköposti:</strong> ${payload.email}</p>
    //     <p><strong>Yritys:</strong> ${payload.company || 'Ei ilmoitettu'}</p>
    //     <p><strong>Aihe:</strong> ${payload.topic}</p>
    //     <p><strong>Viesti:</strong></p>
    //     <p>${payload.message.replace(/\n/g, '<br>')}</p>
    //   `,
    // })

    // Send confirmation email to user
    // await resend.emails.send({
    //   from: 'DocFlow <no-reply@converto.fi>',
    //   to: payload.email,
    //   subject: 'Kiitos yhteydenotostasi - DocFlow',
    //   html: `
    //     <h2>Kiitos yhteydenotostasi!</h2>
    //     <p>Hei ${payload.firstName},</p>
    //     <p>Olemme vastaanottaneet viestisi ja vastaamme sinulle 1 arkipäivän kuluessa.</p>
    //     <p>Terveisin,<br>DocFlow-tiimi</p>
    //   `,
    // })

    console.log('Contact form submission:', payload)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { error: error.message || "Viestin lähetys epäonnistui" }, 
      { status: 400 }
    )
  }
}
