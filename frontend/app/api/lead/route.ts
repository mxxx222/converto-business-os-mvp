import { NextResponse, type NextRequest } from "next/server";

import { sendLeadEmail, sendUserConfirmEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const meta = {
    email: String(body.email),
    name: String(body.name || ""),
    company: String(body.company || ""),
    phone: String(body.phone || ""),
    notes: String(body.notes || ""),
    context: body.context,
    ts: new Date().toISOString(),
    source: "roi-page",
  };

  const res = await sendLeadEmail(meta);
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }

  await sendUserConfirmEmail({ to: meta.email, name: meta.name, type: "roi" });

  return NextResponse.json({ ok: true, id: res.id });
}



