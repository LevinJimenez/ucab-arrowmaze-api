import { describe, it, expect } from 'vitest';
import { Score } from '../../../src/domain/value-objects/Score';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('Score', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const score = Score.create(900);

    // Assert
    expect(score.value).toBe(900);
  });

  it('should_reject_when_value_is_a_decimal', () => {
    expect(() => Score.create(1.5)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_negative', () => {
    expect(() => Score.create(-1)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = Score.create(900);
    const b = Score.create(900);

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
