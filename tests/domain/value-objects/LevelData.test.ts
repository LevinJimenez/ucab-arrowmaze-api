import { describe, it, expect } from 'vitest';
import { LevelData } from '../../../src/domain/value-objects/LevelData';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';

const validProps = {
  cells: [[0, 0], [0, 1]] as [number, number][],
  arrows: [{ id: 'a1', path: [[0, 0], [0, 1]] as [number, number][], color: '#EF476F' }],
  lives: 5,
};

describe('LevelData', () => {
  it('should_create_when_cells_and_arrows_are_valid', () => {
    // Act
    const data = LevelData.create(validProps);

    // Assert
    expect(data.cells).toEqual(validProps.cells);
    expect(data.arrows).toEqual(validProps.arrows);
    expect(data.lives).toBe(5);
  });

  it('should_reject_when_cells_is_empty', () => {
    expect(() => LevelData.create({ ...validProps, cells: [] })).toThrow(ValidationError);
  });

  it('should_reject_when_arrows_is_empty', () => {
    expect(() => LevelData.create({ ...validProps, arrows: [] })).toThrow(ValidationError);
  });

  it('should_round_trip_through_toPrimitives', () => {
    // Arrange
    const data = LevelData.create(validProps);

    // Act
    const primitives = data.toPrimitives();

    // Assert
    expect(primitives).toEqual(validProps);
  });
});
