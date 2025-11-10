/** @fileoverview Resend email integration with mock mode support */

export interface EmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResponse {
  id: string;
  status?: string;
}

export async function sendEmail(input: EmailInput): Promise<EmailResponse> {
  if (process.env.NO_EXTERNAL_SEND === "true") {
    return { id: "mock-email", status: "mocked" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required");
  }

  const from = input.from || process.env.RESEND_FROM || process.env.EMAIL_FROM || "noreply@converto.fi";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}
