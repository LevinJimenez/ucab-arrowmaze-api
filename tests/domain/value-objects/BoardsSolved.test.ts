import { describe, it, expect } from 'vitest';
import { BoardsSolved } from '../../../src/domain/value-objects/BoardsSolved';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('BoardsSolved', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const boardsSolved = BoardsSolved.create(7);

    // Assert
    expect(boardsSolved.value).toBe(7);
  });

  it('should_allow_zero_boards_solved', () => {
    // Act
    const boardsSolved = BoardsSolved.create(0);

    // Assert
    expect(boardsSolved.value).toBe(0);
  });

  it('should_reject_when_value_is_a_decimal', () => {
    expect(() => BoardsSolved.create(1.5)).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_negative', () => {
    expect(() => BoardsSolved.create(-1)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = BoardsSolved.create(7);
    const b = BoardsSolved.create(7);

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
