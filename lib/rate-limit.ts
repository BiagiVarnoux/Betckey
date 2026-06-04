const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 10;

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  let bucket = store.get(ip);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, bucket);
  }

  bucket.count++;

  if (bucket.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  return { allowed: true, retryAfterMs: 0 };
}
