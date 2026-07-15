/**
 * Minimal in-memory rate limiter for auth endpoints.
 *
 * NOTE: state lives in a single server instance's memory, so on serverless /
 * multi-instance deployments it is best-effort. For strict guarantees, back
 * this with a durable store (e.g. Upstash Redis). It still meaningfully slows
 * down rapid brute-force attempts against a given identifier.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const rec = buckets.get(key);

  if (!rec || now > rec.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (rec.count >= limit) {
    return { ok: false, retryAfterMs: rec.resetAt - now };
  }
  rec.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

// Occasionally evict expired buckets so the map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }, 5 * 60_000).unref?.();
}
