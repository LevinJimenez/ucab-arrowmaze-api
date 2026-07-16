import { describe, it, expect, beforeEach } from 'vitest';
import { UpsertLevelDefinitionUseCase } from '../../../src/domain/use-cases/UpsertLevelDefinitionUseCase';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';
import { LevelId } from '../../../src/domain/value-objects/LevelId';
import { InMemoryLevelDefinitionRepository } from '../../fakes/InMemoryLevelDefinitionRepository';
import { aLevel } from '../../builders/LevelDefinitionBuilder';

describe('UpsertLevelDefinitionUseCase', () => {
  let levels: InMemoryLevelDefinitionRepository;
  let useCase: UpsertLevelDefinitionUseCase;

  beforeEach(() => {
    levels = new InMemoryLevelDefinitionRepository();
    useCase = new UpsertLevelDefinitionUseCase(levels);
  });

  it('should_persist_level_when_definition_is_valid', async () => {
    // Arrange + Act
    await useCase.execute(aLevel().withId('level_heart').buildUpsertInput());

    // Assert — estado leído del fake.
    const stored = await levels.getById(LevelId.create('level_heart'));
    expect(stored).not.toBeNull();
    expect(stored?.name.value).toBe('Corazón');
    expect(stored?.arrowCount()).toBe(1);
  });

  it('should_update_existing_level_when_same_id_is_provided', async () => {
    // Arrange
    await useCase.execute(aLevel().withId('level_heart').withName('Original').buildUpsertInput());

    // Act — misma ID, nombre distinto
    await useCase.execute(aLevel().withId('level_heart').withName('Actualizado').buildUpsertInput());

    // Assert — solo queda la versión nueva.
    const stored = await levels.getById(LevelId.create('level_heart'));
    expect(stored?.name.value).toBe('Actualizado');
  });

  it('should_reject_level_when_difficulty_is_invalid', async () => {
    await expect(
      useCase.execute(aLevel().withDifficulty('extreme').buildUpsertInput()),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should_default_difficulty_to_medium_when_not_provided', async () => {
    // Arrange
    const input = aLevel().withId('level_heart').buildUpsertInput();
    delete input.difficulty;

    // Act
    const stored = await useCase.execute(input);

    // Assert
    expect(stored.difficulty.value).toBe('medium');
  });

  it('should_persist_level_without_par_moves_when_not_provided', async () => {
    // Arrange
    const input = aLevel().withId('level_heart').buildUpsertInput();
    delete input.parMoves;

    // Act
    const stored = await useCase.execute(input);

    // Assert
    expect(stored.parMoves).toBeUndefined();
  });
});
