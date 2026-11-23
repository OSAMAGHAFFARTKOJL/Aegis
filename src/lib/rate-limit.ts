// Lightweight in-memory rate limiter (fixed window).
// Good enough to blunt abuse of the analyze/signup endpoints in a single
// instance. For multi-instance production, back this with Upstash Redis.

interface Bucket {
  count: number;
  resetAt: number;
}

const globalForRl = globalThis as unknown as {
  __kinguardRl?: Map<string, Bucket>;
};

function store(): Map<string, Bucket> {
  if (!globalForRl.__kinguardRl) globalForRl.__kinguardRl = new Map();
  return globalForRl.__kinguardRl;
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateResult {
  const now = Date.now();
  const map = store();
  const bucket = map.get(key);

  if (!bucket || bucket.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "anonymous";
}
