import { describe, it, expect, beforeEach } from 'vitest';
import { UpsertLevelDefinitionUseCase } from '../../../src/domain/use-cases/UpsertLevelDefinitionUseCase';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';
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
    await useCase.execute(aLevel().withId('level_heart').buildProps());

    // Assert — estado leído del fake.
    const stored = await levels.getById('level_heart');
    expect(stored).not.toBeNull();
    expect(stored?.name).toBe('Corazón');
    expect(stored?.arrowCount()).toBe(1);
  });

  it('should_reject_level_when_it_has_no_cells', async () => {
    await expect(
      useCase.execute(aLevel().withoutCells().buildProps()),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should_update_existing_level_when_same_id_is_provided', async () => {
    // Arrange
    await useCase.execute(aLevel().withId('level_heart').withName('Original').buildProps());

    // Act — misma ID, nombre distinto
    await useCase.execute(aLevel().withId('level_heart').withName('Actualizado').buildProps());

    // Assert — solo queda la versión nueva.
    const stored = await levels.getById('level_heart');
    expect(stored?.name).toBe('Actualizado');
  });
});
