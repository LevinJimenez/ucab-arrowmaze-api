import { describe, it, expect } from 'vitest';
import { Difficulty } from '../../../src/domain/value-objects/Difficulty';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('Difficulty', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const difficulty = Difficulty.create('medium');

    // Assert
    expect(difficulty.value).toBe('medium');
  });

  it('should_reject_when_value_is_not_a_known_tier', () => {
    expect(() => Difficulty.create('extreme')).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = Difficulty.create('hard');
    const b = Difficulty.create('hard');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
