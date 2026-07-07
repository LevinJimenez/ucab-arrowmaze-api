import { ValidationError } from '../errors/DomainErrors';

/** Coordenada [fila, columna] en la cuadrícula. */
export type Cell = [number, number];

export interface ArrowData {
  id: string;
  path: Cell[];
  color: string;
}

/** Blob de nivel opaco, tal como lo produce y consume el cliente (mecánica A). */
export interface LevelDataProps {
  cells: Cell[];
  arrows: ArrowData[];
  lives?: number;
  timeLimitSeconds?: number;
}

export class LevelData {
  private constructor(
    public readonly cells: Cell[],
    public readonly arrows: ArrowData[],
    public readonly lives?: number,
    public readonly timeLimitSeconds?: number,
  ) {}

  static create(props: LevelDataProps): LevelData {
    if (!Array.isArray(props.cells) || props.cells.length === 0) {
      throw new ValidationError('LevelData: cells cannot be empty');
    }
    if (!Array.isArray(props.arrows) || props.arrows.length === 0) {
      throw new ValidationError('LevelData: arrows cannot be empty');
    }
    if (
      props.timeLimitSeconds !== undefined
      && (!Number.isInteger(props.timeLimitSeconds) || props.timeLimitSeconds < 0)
    ) {
      throw new ValidationError('LevelData: timeLimitSeconds must be an integer greater than or equal to 0');
    }
    return new LevelData(props.cells, props.arrows, props.lives, props.timeLimitSeconds);
  }

  toPrimitives(): LevelDataProps {
    return {
      cells: this.cells,
      arrows: this.arrows,
      lives: this.lives,
      ...(this.timeLimitSeconds !== undefined ? { timeLimitSeconds: this.timeLimitSeconds } : {}),
    };
  }
}
