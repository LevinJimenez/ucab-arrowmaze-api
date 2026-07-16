import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { env } from '../../config/env';
import { ILevelGenerator, LevelSpec } from '../../domain/interfaces/ILevelGenerator';
import { LevelData } from '../../domain/value-objects/LevelData';
import { LevelGenerationError } from '../../domain/errors/DomainErrors';

// Espejo de LevelDataProps, SIN refinamientos (min/length): la salida
// estructurada de Anthropic no admite minItems/minLength/additionalProperties
// extra en el JSON Schema derivado. LevelData.create() hace la validación real.
const cellSchema = z.tuple([z.number(), z.number()]);

const levelDataSchema = z.object({
  cells: z.array(cellSchema),
  arrows: z.array(z.object({
    id: z.string(),
    path: z.array(cellSchema),
    color: z.string(),
  })),
  lives: z.number().optional(),
  timeLimitSeconds: z.number().optional(),
});

const SYSTEM_PROMPT = `You are a level designer for "Arrow Maze — Escape Puzzle", a puzzle game.
Generate a single level as structured data with this exact shape:
- cells: array of [row, column] integer coordinates forming the playable grid.
- arrows: array of { id, path, color }, where "path" is a sequence of contiguous
  grid cells (each an [row, column] pair) that the arrow occupies, "id" is a
  short unique string, and "color" is a CSS color name or hex code.
- lives (optional): integer, number of lives allowed on this level.
- timeLimitSeconds (optional): integer, a time limit in seconds for this level.
Respect the requested difficulty when provided: harder levels should have more
cells and arrows, and tighter, more interdependent arrow paths.
Return ONLY the level data — no commentary, no markdown.`;

/**
 * Adapter de ILevelGenerator sobre el SDK oficial de Anthropic. El cliente se
 * construye perezosamente (memoizado) en el primer generate(): así app.ts
 * puede instanciar este adaptador sin ANTHROPIC_API_KEY presente, y los tests
 * pueden importar la app sin fallar al arrancar.
 */
export class LlmLevelGenerator implements ILevelGenerator {
  private client: Anthropic | undefined;

  public async generate(spec: LevelSpec): Promise<LevelData> {
    try {
      const client = this.getClient();

      const message = await client.messages.parse(
        {
          model: env.LLM_MODEL,
          max_tokens: 8192,
          thinking: { type: 'adaptive' },
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: spec.difficulty
              ? `Prompt: ${spec.prompt}\nDifficulty: ${spec.difficulty}`
              : `Prompt: ${spec.prompt}`,
          }],
          output_config: {
            format: zodOutputFormat(levelDataSchema),
          },
        },
        { timeout: env.LLM_TIMEOUT_MS },
      );

      if (!message.parsed_output) {
        throw new LevelGenerationError('LLM did not return a parseable level');
      }

      return LevelData.create(message.parsed_output);
    } catch (error) {
      if (error instanceof LevelGenerationError) {
        throw error;
      }
      const detail = error instanceof Error ? error.message : String(error);
      throw new LevelGenerationError(`Failed to generate level: ${detail}`);
    }
  }

  private getClient(): Anthropic {
    if (!this.client) {
      if (!env.ANTHROPIC_API_KEY) {
        throw new LevelGenerationError('LLM no configurado');
      }
      this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    }
    return this.client;
  }
}
