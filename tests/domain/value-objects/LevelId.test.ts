import { describe, it, expect } from 'vitest';
import { LevelId } from '../../../src/domain/value-objects/LevelId';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('LevelId', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const id = LevelId.create('  level_heart  ');

    // Assert
    expect(id.value).toBe('level_heart');
  });

  it('should_reject_when_value_is_empty', () => {
    expect(() => LevelId.create('   ')).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_null_or_undefined', () => {
    expect(() => LevelId.create(undefined as unknown as string)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = LevelId.create('level_heart');
    const b = LevelId.create('level_heart');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
