// In-memory rate limiter — tracks requests per IP with a sliding window
// For serverless deployments, consider Upstash Redis or Vercel KV for persistence across instances

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests within the window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,   // 1 minute window
  maxRequests: 10,        // 10 roasts per minute per IP
};

export function checkRateLimit(
  ip: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };
  const now = Date.now();
  const key = `roast:${ip}`;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start fresh
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// For Vercel serverless: provide a simple per-invocation fallback that
// always allows the request (rate limiting becomes best-effort in serverless)
export function checkRateLimitServerless(
  ip: string,
  config?: Partial<RateLimitConfig>
): { allowed: boolean; remaining: number; resetAt: number } {
  try {
    return checkRateLimit(ip, config);
  } catch {
    // If the store fails for any reason, allow the request to proceed
    return { allowed: true, remaining: 1, resetAt: Date.now() + 60000 };
  }
}
