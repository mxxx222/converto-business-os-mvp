import { NextResponse } from 'next/server';
import { register } from '@/lib/obs/metrics';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const body = await register.metrics();
  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': register.contentType }
  });
}
