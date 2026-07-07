import { describe, it, expect, beforeEach } from 'vitest';
import { GetLevelByIdUseCase } from '../../../src/domain/use-cases/GetLevelByIdUseCase';
import { InMemoryLevelDefinitionRepository } from '../../fakes/InMemoryLevelDefinitionRepository';
import { aLevel } from '../../builders/LevelDefinitionBuilder';

describe('GetLevelByIdUseCase', () => {
  let levels: InMemoryLevelDefinitionRepository;
  let useCase: GetLevelByIdUseCase;

  beforeEach(async () => {
    levels = new InMemoryLevelDefinitionRepository();
    useCase = new GetLevelByIdUseCase(levels);
    await levels.save(aLevel().withId('level_heart').build());
    await levels.save(aLevel().withId('level_star').withName('Estrella').build());
  });

  it('should_return_the_level_when_found_by_id', async () => {
    // Act
    const level = await useCase.execute('level_star');

    // Assert
    expect(level?.name.value).toBe('Estrella');
  });

  it('should_return_null_when_level_is_not_found_by_id', async () => {
    // Act
    const level = await useCase.execute('missing');

    // Assert
    expect(level).toBeNull();
  });
});
