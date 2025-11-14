import { describe, expect, it } from 'vitest';
import { scrub } from './pii';

describe('scrub', () => {
  it('redacts sensitive header fields', () => {
    const payload = {
      headers: {
        authorization: 'Bearer secret',
        cookie: 'tenant_id=abc',
        'x-other': 'value'
      },
      cookies: [{ name: 'tenant_id', value: 'abc' }],
      user: { email: 'user@example.com' }
    };

    const result = scrub(payload);

    expect(result.headers.authorization).toBe('[REDACTED]');
    expect(result.headers.cookie).toBe('[REDACTED]');
    expect(result.cookies).toBe('[REDACTED]');
    expect(result.user.email).toBe('[REDACTED]');
    expect(result.headers['x-other']).toBe('value');
  });
});
