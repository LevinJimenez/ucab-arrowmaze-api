import { describe, it, expect, vi } from 'vitest';
import { LevelGenerationError } from '../../../src/domain/errors/DomainErrors';

// Sin ANTHROPIC_API_KEY, el adaptador debe fallar ANTES de construir el
// cliente Anthropic o hacer cualquier llamada de red (defensa síncrona).
vi.mock('../../../src/config/env', () => ({
  env: {
    ANTHROPIC_API_KEY: undefined,
    LLM_MODEL: 'claude-opus-4-8',
    LLM_TIMEOUT_MS: 30_000,
  },
}));

import { LlmLevelGenerator } from '../../../src/infrastructure/services/LlmLevelGenerator';

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
