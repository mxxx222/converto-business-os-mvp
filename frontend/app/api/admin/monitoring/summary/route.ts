/** @fileoverview API monitoring summary route - placeholder performance data */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
    
    // Placeholder API monitoring data
    // In PR5d, this will be replaced with real Prometheus metrics
    const data = [
      { 
        route: "/api/documents/upload", 
        p95_ms: 180, 
        rate5xx: 0.002, 
        req_rate: 1.2, 
        status5xx: 2 
      },
      { 
        route: "/api/ocr/process", 
        p95_ms: 2700, 
        rate5xx: 0.005, 
        req_rate: 0.4, 
        status5xx: 1 
      },
      { 
        route: "/api/admin/activities", 
        p95_ms: 95, 
        rate5xx: 0.001, 
        req_rate: 2.8, 
        status5xx: 0 
      },
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
