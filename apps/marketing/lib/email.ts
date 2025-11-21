import { Resend } from 'resend'

// Initialize Resend only if API key is available (not during build)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || 'DocFlow <noreply@docflow.fi>'
}: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}) {
  if (!resend) {
    console.warn('Resend not configured - email not sent')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}

