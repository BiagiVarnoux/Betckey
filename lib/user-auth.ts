// Web Crypto — compatible con Edge Runtime y Node.js

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const PBKDF2_ITERATIONS = 100_000;
const USER_SESSION_COOKIE = 'user_session';

export { USER_SESSION_COOKIE };

// ─── Helpers hex ─────────────────────────────────────────────────────────────

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return buf;
}

// ─── HMAC key para firmar sesiones ───────────────────────────────────────────

async function getSignKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? 'fallback-secret';
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('user:' + secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

// ─── Password hashing (PBKDF2) ────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return `${toHex(salt.buffer)}:${toHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return toHex(bits) === hashHex;
}

// ─── Session tokens ───────────────────────────────────────────────────────────

export async function createUserSessionToken(userId: number): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  const key = await getSignKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${toHex(sig)}`;
}

export async function verifyUserSessionToken(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userIdStr, expiresAtStr, sigHex] = parts;
  const userId = Number(userIdStr);
  const expiresAt = Number(expiresAtStr);
  if (isNaN(userId) || isNaN(expiresAt) || Date.now() > expiresAt) return null;
  const payload = `${userIdStr}.${expiresAtStr}`;
  try {
    const key = await getSignKey();
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      fromHex(sigHex),
      new TextEncoder().encode(payload),
    );
    return valid ? userId : null;
  } catch {
    return null;
  }
}
