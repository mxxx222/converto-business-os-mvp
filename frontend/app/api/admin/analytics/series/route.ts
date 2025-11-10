/** @fileoverview Analytics series API route - placeholder time series data */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "30d";
    const days = range === "90d" ? 90 : 30;
    
    const today = new Date();
    const data = Array.from({ length: days }).map((_, i) => {
      const d = new Date(today); 
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toISOString().slice(0, 10),
        docs: 10 + Math.floor(Math.random() * 20),
        revenue: Number((50 + Math.random() * 200).toFixed(2)),
        api_p95_ms: 120 + Math.floor(Math.random() * 60),
        ocr_p95_ms: 2200 + Math.floor(Math.random() * 800),
      };
    });
    
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json(
      { ok: false, error: error?.message || "error" }, 
      { status: error?.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
