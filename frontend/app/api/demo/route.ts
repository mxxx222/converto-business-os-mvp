import { NextResponse, type NextRequest } from "next/server";

import { cfg } from "@/lib/config";
import { createDemoLead } from "@/lib/notion";
import { sendLeadEmail, sendUserConfirmEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const payload = {
    email: String(body.email),
    name: String(body.name || ""),
    company: String(body.company || ""),
    phone: String(body.phone || ""),
    notes: String(body.notes || ""),
  };

  const n = await createDemoLead(cfg.notionDemoDbId, payload);
  if (!n.ok) {
    return NextResponse.json({ error: n.error }, { status: 500 });
  }

  await sendLeadEmail({ ...payload, source: "demo-page", notionId: n.id });
  await sendUserConfirmEmail({ to: payload.email, name: payload.name, type: "demo" });

  return NextResponse.json({ ok: true, id: n.id });
}


