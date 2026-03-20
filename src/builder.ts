import type { CookieOptions, SameSite, Priority } from './types.js';
import { serializeCookie } from './serialize.js';

export interface CookieBuilder {
  /** Set the Max-Age attribute in seconds */
  maxAge(n: number): CookieBuilder;
  /** Set the Expires attribute */
  expires(d: Date): CookieBuilder;
  /** Set the Domain attribute */
  domain(s: string): CookieBuilder;
  /** Set the Path attribute */
  path(s: string): CookieBuilder;
  /** Set the Secure flag */
  secure(): CookieBuilder;
  /** Set the HttpOnly flag */
  httpOnly(): CookieBuilder;
  /** Set the SameSite attribute */
  sameSite(v: SameSite): CookieBuilder;
  /** Set the Partitioned flag (CHIPS) */
  partitioned(): CookieBuilder;
  /** Set the Priority attribute */
  priority(v: Priority): CookieBuilder;
  /** Build the Set-Cookie header string */
  build(): string;
}

/**
 * Create a chainable cookie builder.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @returns A chainable builder that produces a Set-Cookie string via `.build()`
 */
export function cookieBuilder(name: string, value: string): CookieBuilder {
  const opts: CookieOptions = {};

  const builder: CookieBuilder = {
    maxAge(n: number) { opts.maxAge = n; return builder; },
    expires(d: Date) { opts.expires = d; return builder; },
    domain(s: string) { opts.domain = s; return builder; },
    path(s: string) { opts.path = s; return builder; },
    secure() { opts.secure = true; return builder; },
    httpOnly() { opts.httpOnly = true; return builder; },
    sameSite(v: SameSite) { opts.sameSite = v; return builder; },
    partitioned() { opts.partitioned = true; return builder; },
    priority(v: Priority) { opts.priority = v; return builder; },
    build() { return serializeCookie(name, value, opts); },
  };

  return builder;
}
