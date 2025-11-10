/** @fileoverview Analytics PDF export API route with RBAC + fi-FI locale */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, assertRole } from "@/lib/adminAuth";
import { exportPdf } from "@/lib/export";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, role } = await requireAdminAuth(req);
    assertRole(role, ['admin','support']);
    const { range = "30d" } = await req.json().catch(() => ({}));
    
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Analytics Report</title>
  <style>
    body { font: 14px system-ui, -apple-system, sans-serif; padding: 20px; }
    h1 { font-size: 18px; color: #1f2937; margin-bottom: 16px; }
    p { color: #6b7280; line-height: 1.5; }
    .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .placeholder { color: #9ca3af; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <h1>DocFlow Analytics Summary (${range})</h1>
    <p>Generated on ${new Date().toLocaleDateString('fi-FI')} at ${new Date().toLocaleTimeString('fi-FI')}</p>
  </div>
  
  <div class="section">
    <h2>Overview</h2>
    <p class="placeholder">This is a placeholder PDF report. In PR5d, this will be replaced with real analytics data from Prometheus metrics.</p>
  </div>
  
  <div class="section">
    <h2>Key Metrics</h2>
    <ul>
      <li>Document Processing: Placeholder data</li>
      <li>Revenue Trends: Placeholder data</li>
      <li>API Performance (p95): &lt;200ms target</li>
      <li>OCR Performance (p95): &lt;3000ms target</li>
    </ul>
  </div>
  
  <div class="section">
    <h2>Time Range</h2>
    <p>Report covers the last ${range} period.</p>
  </div>
</body>
</html>`;

    return await exportPdf(html, {
      locale: 'fi-FI',
      timeZone: 'Europe/Helsinki',
      format: 'A4'
    });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json(
      { ok: false, error: error?.message || "error" }, 
      { status: error?.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
