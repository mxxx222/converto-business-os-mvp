/** @fileoverview Analytics cards API route - placeholder data */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "30d";
    
    const data = [
      { label: `Docs (${range})`, value: "—" },
      { label: `Revenue (${range})`, value: "—" },
      { label: "API p95", value: "<200 ms", hint: "target" },
      { label: "OCR p95", value: "<3000 ms", hint: "target" },
    ];
    
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json(
      { ok: false, error: error?.message || "error" }, 
      { status: error?.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
