export type SameSite = 'strict' | 'lax' | 'none';
export type Priority = 'low' | 'medium' | 'high';

export interface CookieOptions {
  /** Max age in seconds */
  maxAge?: number;
  /** Expiry date */
  expires?: Date;
  /** Domain scope */
  domain?: string;
  /** Path scope */
  path?: string;
  /** HTTPS only */
  secure?: boolean;
  /** No JavaScript access */
  httpOnly?: boolean;
  /** Cross-site request policy */
  sameSite?: SameSite;
  /** CHIPS partitioned cookie */
  partitioned?: boolean;
  /** Cookie priority hint */
  priority?: Priority;
}

export interface ParsedCookie {
  name: string;
  value: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSite;
  partitioned?: boolean;
  priority?: Priority;
}
