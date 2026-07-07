import { describe, it, expect } from 'vitest';
import { LevelName } from '../../../src/domain/value-objects/LevelName';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

describe('LevelName', () => {
  it('should_create_when_value_is_valid', () => {
    // Act
    const name = LevelName.create('  Corazón  ');

    // Assert
    expect(name.value).toBe('Corazón');
  });

  it('should_reject_when_value_is_empty', () => {
    expect(() => LevelName.create('   ')).toThrow(ValidationError);
  });

  it('should_reject_when_value_is_null_or_undefined', () => {
    expect(() => LevelName.create(undefined as unknown as string)).toThrow(ValidationError);
  });

  it('should_consider_two_equal_values_equal', () => {
    // Arrange
    const a = LevelName.create('Corazón');
    const b = LevelName.create('Corazón');

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });
});
