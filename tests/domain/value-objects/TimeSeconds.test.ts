import { describe, it, expect } from 'vitest';
import { TimeSeconds } from '../../../src/domain/value-objects/TimeSeconds';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('TimeSeconds', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const time = TimeSeconds.create(45);

    // Assert
    expect(time.value).toBe(45);
  });

  it('should_reject_when_value_is_a_decimal', () => {
    expect(() => TimeSeconds.create(1.5)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_negative', () => {
    expect(() => TimeSeconds.create(-1)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = TimeSeconds.create(45);
    const b = TimeSeconds.create(45);

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
