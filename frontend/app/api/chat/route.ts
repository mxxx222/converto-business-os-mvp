import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    // Simulate GPT-5 response (replace with actual AI integration)
    const responses = [
      "Kiitos viestistäsi! Miten voin auttaa sinua Converto Business OS:n kanssa?",
      "Automatisoi yrityksesi tänään ja säästä aikaa. Haluaisitko aloittaa ilmaisen demon?",
      "Ilmoittaudu pilottiin ja saat 30 päivää ilmaista käyttöä. Kiinnostaisiko?",
      "Converto Business OS™ säästää keskimäärin 40% työajasta. Haluaisitko kuulla lisää?"
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    return NextResponse.json({
      response: randomResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}