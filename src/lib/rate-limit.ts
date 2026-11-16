interface RateLimitTracker {
  count: number;
  resetAt: number;
}

// In-memory tracker storing attempt counts keyed by IP or identifier
const rateLimitMap = new Map<string, RateLimitTracker>();

// Clean expired keys periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check and increment rate limit for a key.
 * @param key Unique key (e.g., `login:ip:192.168.1.1` or `login:admin`)
 * @param maxAttempts Maximum allowed attempts within the window
 * @param windowSeconds Duration of the rate limit window in seconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900 // 15 minutes default
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || existing.resetAt < now) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (existing.count >= maxAttempts) {
    const remainingSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      remaining: 0,
      resetSeconds: remainingSeconds,
    };
  }

  existing.count += 1;
  const remainingSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    remaining: maxAttempts - existing.count,
    resetSeconds: remainingSeconds,
  };
}

/**
 * Reset rate limit counter on a successful login
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}