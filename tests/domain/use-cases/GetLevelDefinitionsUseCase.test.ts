import { describe, it, expect, beforeEach } from 'vitest';
import { GetLevelDefinitionsUseCase } from '../../../src/domain/use-cases/GetLevelDefinitionsUseCase';
import { InMemoryLevelDefinitionRepository } from '../../fakes/InMemoryLevelDefinitionRepository';
import { aLevel } from '../../builders/LevelDefinitionBuilder';

describe('GetLevelDefinitionsUseCase', () => {
  let levels: InMemoryLevelDefinitionRepository;
  let useCase: GetLevelDefinitionsUseCase;

  beforeEach(async () => {
    levels = new InMemoryLevelDefinitionRepository();
    useCase = new GetLevelDefinitionsUseCase(levels);
    await levels.save(aLevel().withId('level_heart').build());
    await levels.save(aLevel().withId('level_star').withName('Estrella').build());
  });

  it('should_return_all_levels_when_listing', async () => {
    // Act
    const all = await useCase.execute();

    // Assert
    expect(all).toHaveLength(2);
  });

  it('should_return_the_level_when_found_by_id', async () => {
    // Act
    const level = await useCase.getById('level_star');

    // Assert
    expect(level?.name).toBe('Estrella');
  });

  it('should_return_null_when_level_is_not_found_by_id', async () => {
    // Act
    const level = await useCase.getById('missing');

    // Assert
    expect(level).toBeNull();
  });
});
