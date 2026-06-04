// Web Crypto API — compatible con Edge Runtime (middleware) y Node.js

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return buf;
}

async function getKey(): Promise<CryptoKey> {
  const password = process.env.ADMIN_PASSWORD ?? '';
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(): Promise<string> {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${nonce}.${expiresAt}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${toHex(sig)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [nonce, expiresAtStr, sigHex] = parts;
  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
  const payload = `${nonce}.${expiresAtStr}`;
  try {
    const key = await getKey();
    return await crypto.subtle.verify(
      'HMAC', key,
      fromHex(sigHex),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}
