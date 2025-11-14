type UnknownObject = Record<string, any>;

export function scrub<T extends UnknownObject | null | undefined>(payload: T): T {
  if (!payload) {
    return payload;
  }

  const clone = JSON.parse(JSON.stringify(payload));

  if (clone.headers?.authorization) {
    clone.headers.authorization = '[REDACTED]';
  }
  if (clone.headers?.cookie) {
    clone.headers.cookie = '[REDACTED]';
  }
  if (clone.cookies) {
    clone.cookies = '[REDACTED]';
  }
  if (clone.user?.email) {
    clone.user.email = '[REDACTED]';
  }

  return clone;
}
