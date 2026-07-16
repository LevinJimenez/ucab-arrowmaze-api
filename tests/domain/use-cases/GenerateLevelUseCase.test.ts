import { describe, it, expect } from 'vitest';
import { GenerateLevelUseCase } from '../../../src/domain/use-cases/GenerateLevelUseCase';
import { FakeLevelGenerator } from '../../fakes/FakeLevelGenerator';

describe('GenerateLevelUseCase', () => {
  it('should_return_the_level_produced_by_the_generator', async () => {
    // Arrange
    const generator = new FakeLevelGenerator();
    const useCase = new GenerateLevelUseCase(generator);

    // Act
    const level = await useCase.execute({ prompt: 'a maze with a heart shape' });

    // Assert — salida observable, sin espiar el generador.
    expect(level.cells).toHaveLength(3);
    expect(level.arrows).toHaveLength(1);
  });

  it('should_delegate_the_spec_to_the_generator_unchanged', async () => {
    // Arrange
    const generator = new FakeLevelGenerator();
    const useCase = new GenerateLevelUseCase(generator);
    const spec = { prompt: 'a hard maze', difficulty: 'hard' };

    // Act
    await useCase.execute(spec);

    // Assert
    expect(generator.lastSpec).toEqual(spec);
  });
});
