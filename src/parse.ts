import type { ParsedCookie, SameSite, Priority } from './types.js';

/**
 * Parse a Cookie header string into a key-value record.
 *
 * @param header - The Cookie header value (e.g. "foo=bar; baz=qux")
 * @returns A record mapping cookie names to their decoded values
 */
export function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (!header || !header.trim()) {
    return result;
  }

  const pairs = header.split('; ');

  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) continue;

    const name = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();

    if (!name) continue;

    try {
      result[name] = decodeURIComponent(value);
    } catch {
      result[name] = value;
    }
  }

  return result;
}

/**
 * Parse a Set-Cookie header string into a structured object.
 *
 * @param setCookieHeader - The full Set-Cookie header value
 * @returns A parsed cookie object with name, value, and all attributes
 */
export function parseCookie(setCookieHeader: string): ParsedCookie {
  const parts = setCookieHeader.split('; ');
  const firstPart = parts[0];

  const eqIndex = firstPart.indexOf('=');
  const name = eqIndex === -1 ? firstPart.trim() : firstPart.slice(0, eqIndex).trim();
  const rawValue = eqIndex === -1 ? '' : firstPart.slice(eqIndex + 1).trim();

  let value: string;
  try {
    value = decodeURIComponent(rawValue);
  } catch {
    value = rawValue;
  }

  const cookie: ParsedCookie = { name, value };

  for (let i = 1; i < parts.length; i++) {
    const attrPart = parts[i];
    const attrEq = attrPart.indexOf('=');
    const attrName = (attrEq === -1 ? attrPart : attrPart.slice(0, attrEq)).trim().toLowerCase();
    const attrValue = attrEq === -1 ? '' : attrPart.slice(attrEq + 1).trim();

    switch (attrName) {
      case 'max-age': {
        const parsed = parseInt(attrValue, 10);
        if (!isNaN(parsed)) cookie.maxAge = parsed;
        break;
      }
      case 'expires': {
        const date = new Date(attrValue);
        if (!isNaN(date.getTime())) cookie.expires = date;
        break;
      }
      case 'domain':
        cookie.domain = attrValue;
        break;
      case 'path':
        cookie.path = attrValue;
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = attrValue.toLowerCase() as SameSite;
        break;
      case 'partitioned':
        cookie.partitioned = true;
        break;
      case 'priority':
        cookie.priority = attrValue.toLowerCase() as Priority;
        break;
    }
  }

  return cookie;
}
