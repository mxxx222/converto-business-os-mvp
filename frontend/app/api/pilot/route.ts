import { NextResponse } from "next/server"

function required(v?: string): string {
  if (!v || !String(v).trim()) throw new Error('Pakollinen tieto puuttuu')
  return v.trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = {
      name: required(body.name),
      email: required(body.email),
      company: required(body.company),
      businessId: body.businessId || '',
      plan: body.plan || 'business',
      goal: body.goal || '',
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(payload.email)) {
      throw new Error('Virheellinen sähköpostiosoite')
    }

    // Validate plan
    const validPlans = ['starter', 'business', 'professional', 'enterprise']
    if (!validPlans.includes(payload.plan)) {
      payload.plan = 'business' // Default to business if invalid
    }

    // TODO: Send welcome email via Resend
    // await resend.emails.send({
    //   from: 'DocFlow <onboarding@converto.fi>',
    //   to: payload.email,
    //   subject: 'Tervetuloa DocFlow\'n kokeiluun!',
    //   html: `
    //     <h2>Tervetuloa, ${payload.name.split(' ')[0]}!</h2>
    //     <p>Loistavaa että testaat DocFlow'ta. Aloitamme onboardingin ja lähetämme tunnukset pian.</p>
    //     <p>Valitsit ${payload.plan}-paketin. Voit vaihtaa pakettia milloin tahansa kokeilun aikana.</p>
    //     <p>Voit myös varata suoraan 15 min aloitussoiton: <a href="https://converto.fi/demo">https://converto.fi/demo</a></p>
    //     <p>Terveisin,<br>DocFlow-tiimi</p>
    //   `,
    // })

    // TODO: Send internal notification
    // await resend.emails.send({
    //   from: 'DocFlow <alerts@converto.fi>',
    //   to: 'sales@converto.fi',
    //   subject: `Uusi trial: ${payload.company} (${payload.plan})`,
    //   html: `
    //     <h3>Uusi DocFlow trial</h3>
    //     <ul>
    //       <li><strong>Nimi:</strong> ${payload.name}</li>
    //       <li><strong>Sähköposti:</strong> ${payload.email}</li>
    //       <li><strong>Yritys:</strong> ${payload.company}</li>
    //       <li><strong>Y-tunnus:</strong> ${payload.businessId || 'Ei ilmoitettu'}</li>
    //       <li><strong>Paketti:</strong> ${payload.plan}</li>
    //       <li><strong>Tavoite:</strong> ${payload.goal || 'Ei ilmoitettu'}</li>
    //     </ul>
    //   `,
    // })

    console.log(`New DocFlow trial signup:`, payload)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Error processing pilot form:", error)
    return NextResponse.json(
      { error: error.message || "Rekisteröinti epäonnistui" }, 
      { status: 400 }
    )
  }
}