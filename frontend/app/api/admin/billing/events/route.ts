/** @fileoverview Billing events API route - placeholder Stripe events */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
    
    // Return empty events array as placeholder
    // In PR5e, this will be replaced with real Stripe API integration
    return NextResponse.json({ 
      ok: true, 
      data: [], 
      paging: { has_more: false } 
    });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json(
      { ok: false, error: error?.message || "error" }, 
      { status: error?.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
