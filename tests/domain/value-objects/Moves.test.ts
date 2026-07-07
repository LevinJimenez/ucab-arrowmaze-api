import { describe, it, expect } from 'vitest';
import { Moves } from '../../../src/domain/value-objects/Moves';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('Moves', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const moves = Moves.create(8);

    // Assert
    expect(moves.value).toBe(8);
  });

  it('should_reject_when_value_is_a_decimal', () => {
    expect(() => Moves.create(1.5)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_negative', () => {
    expect(() => Moves.create(-1)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = Moves.create(8);
    const b = Moves.create(8);

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
