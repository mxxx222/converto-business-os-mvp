/** @fileoverview Billing cards API route - placeholder MRR/ARPU data */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
    
    const data = [
      { label: "MRR", value: "—" }, 
      { label: "ARPU", value: "—" }
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
