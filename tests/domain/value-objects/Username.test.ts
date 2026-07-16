import { describe, it, expect } from 'vitest';
import { Username } from '../../../src/domain/value-objects/Username';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('Username', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const username = Username.create('  player1  ');

    // Assert
    expect(username.value).toBe('player1');
  });

  it('should_reject_when_value_is_too_short', () => {
    expect(() => Username.create('ab')).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_too_long', () => {
    expect(() => Username.create('a'.repeat(31))).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_null_or_undefined', () => {
    expect(() => Username.create(undefined as unknown as string)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = Username.create('player1');
    const b = Username.create('player1');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
