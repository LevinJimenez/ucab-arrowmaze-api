import { describe, it, expect } from 'vitest';
import { Email } from '../../../src/domain/value-objects/Email';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('Email', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const email = Email.create('  Player1@Example.COM  ');

    // Assert
    expect(email.value).toBe('player1@example.com');
  });

  it('should_reject_when_format_is_invalid', () => {
    expect(() => Email.create('not-an-email')).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_null_or_undefined', () => {
    expect(() => Email.create(undefined as unknown as string)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = Email.create('player1@example.com');
    const b = Email.create('PLAYER1@example.com');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
