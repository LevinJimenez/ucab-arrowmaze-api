import { describe, it, expect } from 'vitest';
import { PasswordHash } from '../../../src/domain/value-objects/PasswordHash';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('PasswordHash', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const hash = PasswordHash.create('hashed::securePass123');

    // Assert
    expect(hash.value).toBe('hashed::securePass123');
  });

  it('should_reject_when_value_is_empty', () => {
    expect(() => PasswordHash.create('')).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = PasswordHash.create('hashed::securePass123');
    const b = PasswordHash.create('hashed::securePass123');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
