import { describe, it, expect } from 'vitest';
import { Duration } from '../../../src/domain/value-objects/Duration';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('Duration', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const duration = Duration.create(120);

    // Assert
    expect(duration.value).toBe(120);
  });

  it('should_reject_when_value_is_a_decimal', () => {
    expect(() => Duration.create(1.5)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_zero', () => {
    expect(() => Duration.create(0)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_negative', () => {
    expect(() => Duration.create(-1)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = Duration.create(120);
    const b = Duration.create(120);

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
