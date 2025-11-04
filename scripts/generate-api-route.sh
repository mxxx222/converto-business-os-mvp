#!/bin/bash
# 🚀 Generate API Route Template - Kilo Codes Automation

ROUTE_NAME=$1

if [ -z "$ROUTE_NAME" ]; then
  echo "Usage: ./scripts/generate-api-route.sh <route-name>"
  echo "Example: ./scripts/generate-api-route.sh users"
  exit 1
fi

ROUTE_DIR="frontend/app/api/$ROUTE_NAME"
mkdir -p "$ROUTE_DIR"

cat > "$ROUTE_DIR/route.ts" << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// Edge Runtime - 10-100x faster than Serverless Functions
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'GET /api/ROUTE_NAME',
  });

  try {
    // Your logic here
    transaction.setStatus('ok');
    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'ROUTE_NAME', method: 'GET' },
    });
    transaction.setStatus('internal_error');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    transaction.finish();
  }
}

export async function POST(request: NextRequest) {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'POST /api/ROUTE_NAME',
  });

  try {
    const body = await request.json();
    // Your logic here
    transaction.setStatus('ok');
    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'ROUTE_NAME', method: 'POST' },
      extra: { requestBody: await request.json().catch(() => ({})) },
    });
    transaction.setStatus('internal_error');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    transaction.finish();
  }
}
EOF

# Replace placeholder
sed -i '' "s/ROUTE_NAME/$ROUTE_NAME/g" "$ROUTE_DIR/route.ts"

echo "✅ Generated API route: $ROUTE_DIR/route.ts"
echo "   - Edge runtime enabled"
echo "   - Sentry instrumentation included"
echo "   - GET and POST handlers ready"
