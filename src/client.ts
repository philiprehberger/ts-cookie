import type { CookieOptions } from './types.js';
import { parseCookies } from './parse.js';
import { serializeCookie } from './serialize.js';

/**
 * Get a cookie value by name from `document.cookie`.
 *
 * @param name - The cookie name to look up
 * @returns The decoded cookie value, or `undefined` if not found
 */
export function getCookie(name: string): string | undefined {
  const cookies = parseCookies(document.cookie);
  return cookies[name];
}

/**
 * Set a cookie via `document.cookie`.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Optional cookie attributes
 */
export function setCookie(name: string, value: string, options?: CookieOptions): void {
  document.cookie = serializeCookie(name, value, options);
}

/**
 * Delete a cookie by setting its Max-Age to 0.
 *
 * @param name - Cookie name to delete
 * @param options - Optional domain and path to match the cookie being deleted
 */
export function deleteCookie(
  name: string,
  options?: Pick<CookieOptions, 'domain' | 'path'>,
): void {
  document.cookie = serializeCookie(name, '', {
    ...options,
    maxAge: 0,
  });
}
