import type { CookieOptions } from './types.js';

const INVALID_NAME_CHARS = /[\s(),/<>?@[\\\]{}=";]/;

/**
 * Serialize a cookie name, value, and options into a Set-Cookie header string.
 *
 * @param name - Cookie name (must not contain special characters)
 * @param value - Cookie value (will be URI-encoded)
 * @param options - Optional cookie attributes
 * @returns A formatted Set-Cookie header string
 * @throws {Error} If the cookie name contains invalid characters
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  if (!name || INVALID_NAME_CHARS.test(name)) {
    throw new Error(`Invalid cookie name: "${name}"`);
  }

  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${Math.floor(options.maxAge)}`;
  }

  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.secure) {
    cookie += '; Secure';
  }

  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }

  if (options.sameSite) {
    const sameSiteValue = options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1);
    cookie += `; SameSite=${sameSiteValue}`;
  }

  if (options.partitioned) {
    cookie += '; Partitioned';
  }

  if (options.priority) {
    const priorityValue = options.priority.charAt(0).toUpperCase() + options.priority.slice(1);
    cookie += `; Priority=${priorityValue}`;
  }

  return cookie;
}
