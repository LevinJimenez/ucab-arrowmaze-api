const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'authorization',
  'secret',
]);

export function redactSensitive(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const redacted: Record<string, unknown> = { ...obj };
    for (const key of Object.keys(redacted)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      }
    }
    return redacted;
  }
  return value;
}
