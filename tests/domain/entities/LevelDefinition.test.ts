import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '../../../src/domain/entities/LevelDefinition';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';
import { aLevel } from '../../builders/LevelDefinitionBuilder';

describe('LevelDefinition', () => {
  it('should_create_valid_level_when_all_invariants_met', () => {
    // Act
    const level = aLevel().build();

    // Assert
    expect(level.id).toBe('level_heart');
    expect(level.difficulty).toBe('easy');
    expect(level.cellCount()).toBe(3);
    expect(level.arrowCount()).toBe(1);
  });

  it('should_default_difficulty_to_medium_when_not_provided', () => {
    // Arrange
    const props = aLevel().buildProps();
    delete props.difficulty;

    // Act
    const level = new LevelDefinition(props);

    // Assert
    expect(level.difficulty).toBe('medium');
  });

  it('should_reject_level_when_id_is_empty', () => {
    expect(() => new LevelDefinition(aLevel().withId('').buildProps())).toThrow(ValidationError);
  });

  it('should_reject_level_when_name_is_empty', () => {
    expect(() => new LevelDefinition(aLevel().withName('   ').buildProps())).toThrow(ValidationError);
  });

  it('should_reject_level_when_difficulty_is_not_a_known_tier', () => {
    expect(() => new LevelDefinition(aLevel().withDifficulty('extreme').buildProps())).toThrow(ValidationError);
  });

  it('should_reject_level_when_par_moves_is_zero_or_negative', () => {
    expect(() => new LevelDefinition(aLevel().withParMoves(0).buildProps())).toThrow(ValidationError);
  });

  it('should_reject_level_when_it_has_no_cells', () => {
    expect(() => new LevelDefinition(aLevel().withoutCells().buildProps())).toThrow(ValidationError);
  });

  it('should_reject_level_when_it_has_no_arrows', () => {
    expect(() => new LevelDefinition(aLevel().withoutArrows().buildProps())).toThrow(ValidationError);
  });
});
