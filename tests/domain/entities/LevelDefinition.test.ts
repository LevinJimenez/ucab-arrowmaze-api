import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '../../../src/domain/entities/LevelDefinition';
import { LevelId } from '../../../src/domain/value-objects/LevelId';
import { LevelName } from '../../../src/domain/value-objects/LevelName';
import { Difficulty } from '../../../src/domain/value-objects/Difficulty';
import { LevelData } from '../../../src/domain/value-objects/LevelData';
import { aLevel } from '../../builders/LevelDefinitionBuilder';

describe('LevelDefinition', () => {
  it('should_create_valid_level_when_all_invariants_met', () => {
    // Act
    const level = aLevel().build();

    // Assert
    expect(level.id.value).toBe('level_heart');
    expect(level.difficulty.value).toBe('easy');
    expect(level.cellCount()).toBe(3);
    expect(level.arrowCount()).toBe(1);
  });

  it('should_count_cells_and_arrows', () => {
    // Arrange — nivel con conteos distintos al fixture por defecto del builder.
    const level = new LevelDefinition({
      id: LevelId.create('level_custom'),
      name: LevelName.create('Custom'),
      difficulty: Difficulty.create('medium'),
      data: LevelData.create({
        cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
        arrows: [
          { id: 'a1', path: [[0, 0], [0, 1]], color: '#EF476F' },
          { id: 'a2', path: [[1, 0], [1, 1]], color: '#118AB2' },
        ],
      }),
    });

    // Assert
    expect(level.cellCount()).toBe(4);
    expect(level.arrowCount()).toBe(2);
  });
});
