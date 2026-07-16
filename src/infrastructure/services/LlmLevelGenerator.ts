import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { env } from '../../config/env';
import { ILevelGenerator, LevelSpec } from '../../domain/interfaces/ILevelGenerator';
import { Cell, LevelData } from '../../domain/value-objects/LevelData';
import { LevelGenerationError } from '../../domain/errors/DomainErrors';

// Espejo de LevelDataProps, SIN refinamientos (min/length): la salida
// estructurada de Anthropic no admite minItems/minLength/additionalProperties
// extra en el JSON Schema derivado. LevelData.create() hace la validación real.
//
// La silueta se pide como "grid": un array de strings binarios ("1"/"0"), una
// fila por string — ASCII art. Dibujar carácter por carácter en una grilla es
// una tarea mucho más natural para el LLM que enumerar coordenadas [row,col]
// sueltas (comparado A/B con 9 formas: el grid produce siluetas más grandes,
// sólidas y reconocibles, y nunca peores). El contrato HTTP no cambia: el
// grid se convierte a cells aquí, antes de LevelData.create().
const cellSchema = z.tuple([z.number(), z.number()]);

const levelGridSchema = z.object({
  grid: z.array(z.string()),
  arrows: z.array(z.object({
    id: z.string(),
    path: z.array(cellSchema),
    color: z.string(),
  })),
  lives: z.number().optional(),
  timeLimitSeconds: z.number().optional(),
});

const SYSTEM_PROMPT = `You are an expert pixel-art level designer for "Arrow Maze — Escape Puzzle".
Your ONLY job is to draw a clear, instantly recognizable SILHOUETTE of the requested shape on a square grid. Arrows are placed by a separate system — include the 1-2 trivial arrows the schema requires (any 2 adjacent filled cells, hex color like "#EF476F") and spend all your effort on the shape.

Output structured data with:
- grid: a list of strings, one per row, top (row 0) to bottom. Use ONLY the characters "1" (filled cell) and "0" (empty). Output EXACTLY the number of rows the prompt requests, each row EXACTLY that many characters long.
- arrows: 1-2 trivial arrows, each { id, path, color } with path = 2 adjacent [row, col] cells inside the shape.
- lives / timeLimitSeconds (optional): integers, only if the prompt asks for them.

HOW TO DRAW A GREAT SILHOUETTE
1. BOLD and SOLID — like a sticker or an app icon, not a thin outline.
2. BIG and CENTERED — use most of the width and height of the grid.
3. CONNECTED — every "1" touches another "1" edge-to-edge so the shape reads as one piece.
4. Emphasize the defining features (ears for a cat, points for a star, fins for a fish, wings for a butterfly).
5. Use SYMMETRY when the real object is symmetric (hearts, stars, letters, faces).
6. No 1-pixel noise, stray dots, or tiny holes. Chunky, smooth forms read best.

EXAMPLES of the technique (12x12 — your grid may be larger):

Heart:
000000000000
001100001100
011110011110
011111111110
011111111110
011111111110
011111111110
001111111100
000111111000
000011110000
000001100000
000000000000

Star:
000000000000
000001100000
000011110000
000011110000
111111111111
011111111110
001111111100
000111111000
001111111100
011110011110
011000000110
000000000000

Each shape is one solid, centered blob of "1"s whose outline you can instantly name. Work efficiently — draw the silhouette directly, do not over-deliberate.`;

/**
 * Convierte el grid ASCII ("1" = celda jugable) a la lista de coordenadas
 * [fila, columna] del contrato HTTP. Cualquier carácter distinto de "1" se
 * trata como vacío (tolerante a pequeñas desviaciones del modelo).
 */
export function gridToCells(grid: string[]): Cell[] {
  const cells: Cell[] = [];
  grid.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '1') cells.push([r, c]);
    }
  });
  return cells;
}

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
          // En claude-sonnet-5 (y familia 4.6+) omitir "thinking" deja el
          // thinking adaptativo ENCENDIDO con effort=high por defecto: las
          // llamadas tardaban 45-85s y a veces consumían todo max_tokens en
          // razonamiento (parsed_output null). No se envía "thinking"
          // explícito (Fable 5 rechaza {type:"disabled"}); el control
          // portable es effort + margen de max_tokens.
          max_tokens: 16000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: spec.difficulty
              ? `Prompt: ${spec.prompt}\nDifficulty: ${spec.difficulty}`
              : `Prompt: ${spec.prompt}`,
          }],
          output_config: {
            format: zodOutputFormat(levelGridSchema),
            // Dibujar la silueta no requiere razonamiento profundo: con
            // effort=low las formas salen igual o mejores y la latencia baja
            // de ~60s a ~10-25s. Configurable porque Haiku 4.5 no acepta el
            // parámetro (se omite si LLM_EFFORT no está definido).
            ...(env.LLM_EFFORT ? { effort: env.LLM_EFFORT } : {}),
          },
        },
        { timeout: env.LLM_TIMEOUT_MS },
      );

      if (!message.parsed_output) {
        throw new LevelGenerationError('LLM did not return a parseable level');
      }

      const { grid, arrows, lives, timeLimitSeconds } = message.parsed_output;
      const cells = gridToCells(grid);
      if (cells.length === 0) {
        throw new LevelGenerationError('LLM returned an empty silhouette');
      }

      return LevelData.create({
        cells,
        // El cliente descarta las flechas del modelo (las coloca
        // ProceduralArrowPlacer), pero el contrato exige al menos una: si el
        // modelo no devolvió ninguna se sintetiza una trivial sobre la forma.
        arrows: arrows.length > 0 ? arrows : [this.fallbackArrow(cells)],
        lives,
        timeLimitSeconds,
      });
    } catch (error) {
      if (error instanceof LevelGenerationError) {
        throw error;
      }
      const detail = error instanceof Error ? error.message : String(error);
      throw new LevelGenerationError(`Failed to generate level: ${detail}`);
    }
  }

  /** Flecha placeholder: dos celdas adyacentes cualesquiera de la silueta. */
  private fallbackArrow(cells: Cell[]): { id: string; path: Cell[]; color: string } {
    const set = new Set(cells.map(([r, c]) => `${r},${c}`));
    for (const [r, c] of cells) {
      if (set.has(`${r},${c + 1}`)) {
        return { id: 'a1', path: [[r, c], [r, c + 1]], color: '#EF476F' };
      }
      if (set.has(`${r + 1},${c}`)) {
        return { id: 'a1', path: [[r, c], [r + 1, c]], color: '#EF476F' };
      }
    }
    // Silueta sin dos celdas adyacentes: no es un nivel jugable.
    throw new LevelGenerationError('LLM returned a degenerate silhouette');
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
