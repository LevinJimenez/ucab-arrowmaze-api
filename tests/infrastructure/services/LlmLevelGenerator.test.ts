import { describe, it, expect, vi } from 'vitest';
import { LevelGenerationError } from '../../../src/domain/errors/DomainErrors';

// Sin ANTHROPIC_API_KEY, el adaptador debe fallar ANTES de construir el
// cliente Anthropic o hacer cualquier llamada de red (defensa síncrona).
vi.mock('../../../src/config/env', () => ({
  env: {
    ANTHROPIC_API_KEY: undefined,
    LLM_MODEL: 'claude-opus-4-8',
    LLM_TIMEOUT_MS: 30_000,
    LLM_EFFORT: undefined,
  },
}));

import { LlmLevelGenerator, gridToCells } from '../../../src/infrastructure/services/LlmLevelGenerator';

describe('LlmLevelGenerator', () => {
  it('should_reject_with_LevelGenerationError_when_api_key_is_not_configured', async () => {
    // Arrange
    const generator = new LlmLevelGenerator();

    // Act + Assert — sin key, no hay llamada de red posible.
    await expect(
      generator.generate({ prompt: 'a maze shaped like a heart' }),
    ).rejects.toBeInstanceOf(LevelGenerationError);
  });
});

describe('gridToCells', () => {
  it('should_convert_binary_rows_to_row_col_coordinates', () => {
    // Arrange
    const grid = ['0110', '1001', '0000'];

    // Act
    const cells = gridToCells(grid);

    // Assert
    expect(cells).toEqual([[0, 1], [0, 2], [1, 0], [1, 3]]);
  });

  it('should_return_empty_list_for_all_zero_grid', () => {
    expect(gridToCells(['000', '000'])).toEqual([]);
    expect(gridToCells([])).toEqual([]);
  });

  it('should_treat_any_character_other_than_1_as_empty', () => {
    // El modelo podría desviarse del alfabeto pedido; nada de eso debe
    // convertirse en celda jugable.
    expect(gridToCells(['1x1', ' .0'])).toEqual([[0, 0], [0, 2]]);
  });

  it('should_tolerate_ragged_rows', () => {
    expect(gridToCells(['1', '011'])).toEqual([[0, 0], [1, 1], [1, 2]]);
  });
});
