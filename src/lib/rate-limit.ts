/**
 * Tiny in-memory sliding-window limiter for abuse prevention.
 * Suitable for a single-process deployment; state lives on `globalThis`
 * so it survives dev-server reloads.
 */

interface Window {
  timestamps: number[];
}

const globalForLimiter = globalThis as unknown as {
  __bijoyaRateBuckets?: Map<string, Window>;
};

function buckets(): Map<string, Window> {
  globalForLimiter.__bijoyaRateBuckets ??= new Map();
  return globalForLimiter.__bijoyaRateBuckets;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const store = buckets();
  const window = store.get(key) ?? { timestamps: [] };
  window.timestamps = window.timestamps.filter((ts) => now - ts < windowMs);

  if (window.timestamps.length >= limit) {
    const oldest = window.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000),
    );
    store.set(key, window);
    return { ok: false, retryAfterSeconds };
  }

  window.timestamps.push(now);
  store.set(key, window);
  return { ok: true, retryAfterSeconds: 0 };
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  return `${scope}:${ip}`;
}
