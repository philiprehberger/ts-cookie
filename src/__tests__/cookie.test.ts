import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCookies, parseCookie, serializeCookie, cookieBuilder, signCookie, verifyCookie } from '../../dist/index.js';

describe('parseCookies', () => {
  it('should parse a single cookie', () => {
    const result = parseCookies('foo=bar');
    assert.deepStrictEqual(result, { foo: 'bar' });
  });

  it('should parse multiple cookies', () => {
    const result = parseCookies('foo=bar; baz=qux; id=123');
    assert.deepStrictEqual(result, { foo: 'bar', baz: 'qux', id: '123' });
  });

  it('should return empty object for empty string', () => {
    assert.deepStrictEqual(parseCookies(''), {});
  });

  it('should return empty object for whitespace', () => {
    assert.deepStrictEqual(parseCookies('   '), {});
  });

  it('should handle cookies with = in value', () => {
    const result = parseCookies('token=abc=def=ghi; name=test');
    assert.deepStrictEqual(result, { token: 'abc=def=ghi', name: 'test' });
  });

  it('should decode URI-encoded values', () => {
    const result = parseCookies('msg=hello%20world');
    assert.deepStrictEqual(result, { msg: 'hello world' });
  });
});

describe('parseCookie', () => {
  it('should parse a basic Set-Cookie header', () => {
    const result = parseCookie('session=abc123');
    assert.equal(result.name, 'session');
    assert.equal(result.value, 'abc123');
  });

  it('should parse Set-Cookie with all attributes', () => {
    const header =
      'id=xyz; Max-Age=3600; Expires=Thu, 01 Jan 2099 00:00:00 GMT; Domain=.example.com; Path=/; Secure; HttpOnly; SameSite=Strict; Partitioned; Priority=High';
    const result = parseCookie(header);

    assert.equal(result.name, 'id');
    assert.equal(result.value, 'xyz');
    assert.equal(result.maxAge, 3600);
    assert.ok(result.expires instanceof Date);
    assert.equal(result.domain, '.example.com');
    assert.equal(result.path, '/');
    assert.equal(result.secure, true);
    assert.equal(result.httpOnly, true);
    assert.equal(result.sameSite, 'strict');
    assert.equal(result.partitioned, true);
    assert.equal(result.priority, 'high');
  });

  it('should handle case-insensitive attributes', () => {
    const result = parseCookie('a=b; SECURE; HTTPONLY; SAMESITE=Lax');
    assert.equal(result.secure, true);
    assert.equal(result.httpOnly, true);
    assert.equal(result.sameSite, 'lax');
  });

  it('should handle empty value', () => {
    const result = parseCookie('empty=');
    assert.equal(result.name, 'empty');
    assert.equal(result.value, '');
  });
});

describe('serializeCookie', () => {
  it('should serialize a basic cookie', () => {
    const result = serializeCookie('foo', 'bar');
    assert.equal(result, 'foo=bar');
  });

  it('should encode special characters in value', () => {
    const result = serializeCookie('msg', 'hello world');
    assert.equal(result, 'msg=hello%20world');
  });

  it('should serialize with all options', () => {
    const expires = new Date('2099-01-01T00:00:00Z');
    const result = serializeCookie('id', 'xyz', {
      maxAge: 3600,
      expires,
      domain: '.example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      partitioned: true,
      priority: 'high',
    });

    assert.ok(result.includes('id=xyz'));
    assert.ok(result.includes('Max-Age=3600'));
    assert.ok(result.includes('Expires='));
    assert.ok(result.includes('Domain=.example.com'));
    assert.ok(result.includes('Path=/'));
    assert.ok(result.includes('Secure'));
    assert.ok(result.includes('HttpOnly'));
    assert.ok(result.includes('SameSite=Strict'));
    assert.ok(result.includes('Partitioned'));
    assert.ok(result.includes('Priority=High'));
  });

  it('should throw for invalid cookie name', () => {
    assert.throws(() => serializeCookie('bad name', 'val'), /Invalid cookie name/);
    assert.throws(() => serializeCookie('', 'val'), /Invalid cookie name/);
    assert.throws(() => serializeCookie('bad;name', 'val'), /Invalid cookie name/);
  });
});

describe('cookieBuilder', () => {
  it('should build a basic cookie', () => {
    const result = cookieBuilder('foo', 'bar').build();
    assert.equal(result, 'foo=bar');
  });

  it('should chain all options', () => {
    const result = cookieBuilder('session', 'abc')
      .maxAge(3600)
      .domain('.example.com')
      .path('/')
      .secure()
      .httpOnly()
      .sameSite('lax')
      .partitioned()
      .priority('high')
      .build();

    assert.ok(result.includes('session=abc'));
    assert.ok(result.includes('Max-Age=3600'));
    assert.ok(result.includes('Domain=.example.com'));
    assert.ok(result.includes('Path=/'));
    assert.ok(result.includes('Secure'));
    assert.ok(result.includes('HttpOnly'));
    assert.ok(result.includes('SameSite=Lax'));
    assert.ok(result.includes('Partitioned'));
    assert.ok(result.includes('Priority=High'));
  });

  it('should support expires', () => {
    const date = new Date('2099-06-15T00:00:00Z');
    const result = cookieBuilder('t', 'v').expires(date).build();
    assert.ok(result.includes('Expires='));
  });
});

describe('signCookie / verifyCookie', () => {
  const secret = 'my-secret-key';

  it('should sign and verify a cookie value', async () => {
    const signed = await signCookie('hello', secret);
    assert.ok(signed.startsWith('hello.'));
    assert.ok(signed.length > 'hello.'.length);

    const verified = await verifyCookie(signed, secret);
    assert.equal(verified, 'hello');
  });

  it('should return undefined for tampered value', async () => {
    const signed = await signCookie('hello', secret);
    const tampered = 'tampered' + signed.slice(5);
    const result = await verifyCookie(tampered, secret);
    assert.equal(result, undefined);
  });

  it('should return undefined for missing signature', async () => {
    const result = await verifyCookie('nosignature', secret);
    assert.equal(result, undefined);
  });

  it('should return undefined for wrong secret', async () => {
    const signed = await signCookie('hello', secret);
    const result = await verifyCookie(signed, 'wrong-secret');
    assert.equal(result, undefined);
  });

  it('should handle empty value', async () => {
    const signed = await signCookie('', secret);
    const verified = await verifyCookie(signed, secret);
    assert.equal(verified, '');
  });

  it('should handle values containing dots', async () => {
    const value = 'user.session.data';
    const signed = await signCookie(value, secret);
    const verified = await verifyCookie(signed, secret);
    assert.equal(verified, value);
  });
});

describe('edge cases', () => {
  it('should handle empty cookie value in serialize', () => {
    const result = serializeCookie('key', '');
    assert.equal(result, 'key=');
  });

  it('should handle special characters in cookie value', () => {
    const result = serializeCookie('data', 'a=b&c=d;e');
    assert.ok(result.startsWith('data='));
    const parsed = parseCookies(result);
    assert.equal(parsed['data'], 'a=b&c=d;e');
  });

  it('should round-trip through serialize and parse', () => {
    const serialized = serializeCookie('test', 'value with spaces');
    const parsed = parseCookies(serialized.split(';')[0]);
    assert.equal(parsed['test'], 'value with spaces');
  });
});
