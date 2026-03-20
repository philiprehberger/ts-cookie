# @philiprehberger/cookie-ts

[![CI](https://github.com/philiprehberger/ts-cookie/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-cookie/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/cookie-ts)](https://www.npmjs.com/package/@philiprehberger/cookie-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Parse, serialize, and manage HTTP cookies with full typing

## Requirements

- Node.js >= 18.0.0

## Installation

```bash
npm install @philiprehberger/cookie-ts
```

## Usage

### Parse Cookies

```ts
import { parseCookies, parseCookie } from '@philiprehberger/cookie-ts';

// Parse a Cookie header into key-value pairs
const cookies = parseCookies('session=abc123; theme=dark');
// { session: 'abc123', theme: 'dark' }

// Parse a Set-Cookie header into a structured object
const cookie = parseCookie(
  'id=xyz; Max-Age=3600; Domain=.example.com; Path=/; Secure; HttpOnly; SameSite=Strict'
);
// { name: 'id', value: 'xyz', maxAge: 3600, domain: '.example.com', ... }
```

### Serialize Cookies

```ts
import { serializeCookie } from '@philiprehberger/cookie-ts';

const header = serializeCookie('session', 'abc123', {
  maxAge: 3600,
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
});
// "session=abc123; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax"
```

### Cookie Builder

```ts
import { cookieBuilder } from '@philiprehberger/cookie-ts';

const header = cookieBuilder('session', 'abc123')
  .maxAge(3600)
  .path('/')
  .secure()
  .httpOnly()
  .sameSite('lax')
  .build();
// "session=abc123; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax"
```

### Sign and Verify

```ts
import { signCookie, verifyCookie } from '@philiprehberger/cookie-ts';

const signed = await signCookie('user123', 'my-secret');
// "user123.HmacSignatureBase64Url"

const value = await verifyCookie(signed, 'my-secret');
// "user123" (or undefined if tampered)
```

### Client-Side (Browser)

```ts
import { getCookie, setCookie, deleteCookie } from '@philiprehberger/cookie-ts';

// Read a cookie
const theme = getCookie('theme'); // "dark" or undefined

// Set a cookie
setCookie('theme', 'dark', { maxAge: 86400, path: '/' });

// Delete a cookie
deleteCookie('theme', { path: '/' });
```

## API

| Function | Description |
| --- | --- |
| `parseCookies(header)` | Parse a `Cookie` header string into a `Record<string, string>` |
| `parseCookie(setCookieHeader)` | Parse a `Set-Cookie` header into a `ParsedCookie` object |
| `serializeCookie(name, value, options?)` | Serialize a cookie into a `Set-Cookie` header string |
| `cookieBuilder(name, value)` | Create a chainable builder that produces a `Set-Cookie` string |
| `signCookie(value, secret)` | Sign a cookie value with HMAC-SHA256 |
| `verifyCookie(signed, secret)` | Verify a signed cookie, returns value or `undefined` |
| `getCookie(name)` | Get a cookie by name from `document.cookie` |
| `setCookie(name, value, options?)` | Set a cookie via `document.cookie` |
| `deleteCookie(name, options?)` | Delete a cookie by setting Max-Age to 0 |

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
