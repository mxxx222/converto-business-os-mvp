import { Resend } from "resend";
import { cfg } from "@/lib/config";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendLeadEmail(payload: Record<string, unknown>) {
  if (!resend) return { ok: false, error: "RESEND_API_KEY puuttuu" };

  const { data, error } = await resend.emails.send({
    from: cfg.resendFrom,
    to: cfg.resendTo,
    subject: `Uusi ROI-liidi: ${(payload as any).company ?? "N/A"}`,
    text: JSON.stringify(payload, null, 2),
  });

  if (error) return { ok: false, error: String(error) };
  return { ok: true, id: data?.id };
}

export async function sendUserConfirmEmail(props: {
  to: string;
  type: "roi" | "demo";
  name?: string;
}) {
  if (!resend) return { ok: false, error: "RESEND_API_KEY puuttuu" };

  const subject =
    props.type === "demo"
      ? "Vahvistus: 20 min demo – Converto"
      : "Vahvistus: ROI-laskelma vastaanotettu – Converto";

  const body = `Hei ${props.name || ""}

Kiitos yhteydenotosta.

${
    props.type === "demo"
      ? "Vahvistamme 20 min demon ja lähetämme kalenterikutsun."
      : "Laskelmasi on vastaanotettu. Voimme käydä sen läpi 20 min demon aikana."
  }

Kiitos-sivu: https://converto.fi/thanks?type=${props.type}

Varaa aika myöhemmin: https://converto.fi/demo

Terveisin,
Converto™`;

  const { data, error } = await resend.emails.send({
    from: cfg.resendFrom,
    to: props.to,
    subject,
    text: body,
  });

  if (error) return { ok: false, error: String(error) };
  return { ok: true, id: data?.id };
}


