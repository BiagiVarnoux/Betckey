import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function hmacKey() {
  const key = process.env.ADMIN_PASSWORD;
  if (!key) throw new Error('ADMIN_PASSWORD no configurado');
  return key;
}

export function createSessionToken(): string {
  const nonce = randomBytes(16).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${nonce}:${expiresAt}`;
  const sig = createHmac('sha256', hmacKey()).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [nonce, expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
  const payload = `${nonce}:${expiresAtStr}`;
  const expected = createHmac('sha256', hmacKey()).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
