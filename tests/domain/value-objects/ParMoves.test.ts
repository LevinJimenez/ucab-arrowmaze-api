import { describe, it, expect } from 'vitest';
import { ParMoves } from '../../../src/domain/value-objects/ParMoves';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('ParMoves', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const parMoves = ParMoves.create(12);

    // Assert
    expect(parMoves.value).toBe(12);
  });

  it('should_reject_when_value_is_a_decimal', () => {
    expect(() => ParMoves.create(1.5)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_nan', () => {
    expect(() => ParMoves.create(NaN)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_zero_or_negative', () => {
    expect(() => ParMoves.create(0)).toThrow(ValidationError);
    expect(() => ParMoves.create(-1)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = ParMoves.create(12);
    const b = ParMoves.create(12);

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
