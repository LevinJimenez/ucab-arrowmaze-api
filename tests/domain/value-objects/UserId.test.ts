import { describe, it, expect } from 'vitest';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('UserId', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const id = UserId.create('  user-1  ');

    // Assert
    expect(id.value).toBe('user-1');
  });

  it('should_reject_when_value_is_empty', () => {
    expect(() => UserId.create('   ')).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_null_or_undefined', () => {
    expect(() => UserId.create(undefined as unknown as string)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = UserId.create('user-1');
    const b = UserId.create('user-1');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
