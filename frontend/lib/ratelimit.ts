/** @fileoverview Rate limiting utility with proper Retry-After and X-RateLimit headers */

// Mock implementation - in real use, you'd integrate with Redis or similar
const rateLimitStore = new Map<string, { count: number; ttl: number }>();

export async function rlConsume(key: string, limit: number) {
  const now = Date.now();
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.ttl) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, ttl: now + 60000 }); // 1 minute TTL
    return { count: 1, ttl: 60 };
  }
  
  current.count++;
  return { count: current.count, ttl: Math.ceil((current.ttl - now) / 1000) };
}

export async function enforceRateLimit(key: string, limitPerMin = 60) {
  const { count, ttl } = await rlConsume(key, limitPerMin);
  if (count > limitPerMin) {
    const retryAfter = Math.max(1, Math.ceil(ttl));
    const headers = new Headers();
    headers.set('Retry-After', String(retryAfter));
    headers.set('X-RateLimit-Limit', String(limitPerMin));
    headers.set('X-RateLimit-Remaining', String(Math.max(0, limitPerMin - count)));
    headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now()/1000 + ttl)));
    throw new Response('Too Many Requests', { status: 429, headers });
  }
}