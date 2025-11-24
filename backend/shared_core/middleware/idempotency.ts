import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const IDEMPOTENCY_HEADER = "Idempotency-Key";
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

// In-memory store for demo (use Redis in production)
const idempotencyStore = new Map<string, {
  response: any;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
}>();

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function getIdempotencyKey(request: NextRequest): string | null {
  return request.headers.get(IDEMPOTENCY_HEADER);
}

export function validateIdempotencyKey(key: string): boolean {
  // Basic validation - should be UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key);
}

export function checkIdempotency(key: string): {
  exists: boolean;
  response?: {
    body: any;
    status: number;
    headers: Record<string, string>;
  };
} {
  const stored = idempotencyStore.get(key);
  
  if (!stored) {
    return { exists: false };
  }

  // Check if expired
  if (Date.now() - stored.timestamp > IDEMPOTENCY_TTL) {
    idempotencyStore.delete(key);
    return { exists: false };
  }

  return {
    exists: true,
    response: {
      body: stored.response,
      status: stored.status,
      headers: stored.headers,
    }
  };
}

export function storeIdempotency(
  key: string, 
  response: any, 
  status: number, 
  headers: Record<string, string>
): void {
  idempotencyStore.set(key, {
    response,
    status,
    headers,
    timestamp: Date.now(),
  });
}

export function withIdempotency(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const method = req.method;
    
    // Only apply to write operations
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return handler(req);
    }

    const idempotencyKey = getIdempotencyKey(req);
    
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header required for write operations" },
        { status: 400 }
      );
    }

    if (!validateIdempotencyKey(idempotencyKey)) {
      return NextResponse.json(
        { error: "Invalid Idempotency-Key format" },
        { status: 400 }
      );
    }

    // Check if we've seen this key before
    const existing = checkIdempotency(idempotencyKey);
    if (existing.exists) {
      console.log(`🔄 Idempotency hit for key: ${idempotencyKey}`);
      return NextResponse.json(existing.response!.body, {
        status: existing.response!.status,
        headers: {
          ...existing.response!.headers,
          "X-Idempotency-Key": idempotencyKey,
          "X-Idempotency-Status": "replayed"
        }
      });
    }

    // Execute the handler
    try {
      const response = await handler(req);
      const responseBody = await response.clone().json();
      
      // Store the response for future idempotency checks
      storeIdempotency(idempotencyKey, responseBody, response.status, {
        "Content-Type": "application/json"
      });

      // Add idempotency headers to response
      response.headers.set("X-Idempotency-Key", idempotencyKey);
      response.headers.set("X-Idempotency-Status", "processed");

      return response;
    } catch (error) {
      console.error("Handler error:", error);
      throw error;
    }
  };
}

export function cleanupExpiredKeys(): void {
  const now = Date.now();
  for (const [key, stored] of idempotencyStore.entries()) {
    if (now - stored.timestamp > IDEMPOTENCY_TTL) {
      idempotencyStore.delete(key);
    }
  }
}

// Cleanup expired keys every hour
setInterval(cleanupExpiredKeys, 60 * 60 * 1000);
