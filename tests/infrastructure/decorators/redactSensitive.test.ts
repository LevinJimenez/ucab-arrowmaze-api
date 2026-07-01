import { describe, it, expect } from 'vitest';
import { redactSensitive } from '../../../src/infrastructure/decorators/redactSensitive';

describe('redactSensitive', () => {
  it('should_mask_known_sensitive_keys_case_insensitively', () => {
    // Arrange
    const input = {
      Password: 'secret123',
      passwordHash: 'hashed::secret',
      token: 'jwt-token',
      authorization: 'Bearer xyz',
      secret: 'api-secret',
    };

    // Act
    const result = redactSensitive(input) as Record<string, unknown>;

    // Assert
    expect(result.Password).toBe('[REDACTED]');
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
  });

  it('should_leave_non_sensitive_fields_untouched', () => {
    // Arrange
    const input = { username: 'alice', score: 42 };

    // Act
    const result = redactSensitive(input) as Record<string, unknown>;

    // Assert
    expect(result.username).toBe('alice');
    expect(result.score).toBe(42);
  });

  it('should_pass_through_null_unchanged', () => {
    expect(redactSensitive(null)).toBeNull();
  });

  it('should_pass_through_arrays_unchanged', () => {
    // Arrange
    const input = [{ password: 'secret123' }];

    // Act
    const result = redactSensitive(input);

    // Assert — los arrays no se recorren; pasan intactos.
    expect(result).toBe(input);
  });

  it('should_pass_through_strings_unchanged', () => {
    expect(redactSensitive('plain string')).toBe('plain string');
  });

  it('should_not_mutate_the_original_object', () => {
    // Arrange
    const input = { password: 'secret123' };

    // Act
    redactSensitive(input);

    // Assert — la referencia original conserva el valor en claro.
    expect(input.password).toBe('secret123');
  });
});
