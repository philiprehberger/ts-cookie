const encoder = new TextEncoder();

/**
 * Convert an ArrayBuffer to a base64url-encoded string.
 */
function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert a base64url-encoded string to an ArrayBuffer.
 */
function fromBase64Url(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Import a secret string as an HMAC-SHA256 CryptoKey.
 */
async function getKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/**
 * Sign a cookie value with HMAC-SHA256.
 *
 * @param value - The cookie value to sign
 * @param secret - The secret key for signing
 * @returns The signed value in the format `value.signature`
 */
export async function signCookie(value: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return `${value}.${toBase64Url(signature)}`;
}

/**
 * Verify a signed cookie value.
 *
 * @param signed - The signed value (format: `value.signature`)
 * @param secret - The secret key used for signing
 * @returns The original value if valid, or `undefined` if tampered
 */
export async function verifyCookie(signed: string, secret: string): Promise<string | undefined> {
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return undefined;

  const value = signed.slice(0, lastDot);
  const signature = signed.slice(lastDot + 1);

  try {
    const key = await getKey(secret);
    const sigBuffer = fromBase64Url(signature);
    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBuffer,
      encoder.encode(value),
    );
    return valid ? value : undefined;
  } catch {
    return undefined;
  }
}
