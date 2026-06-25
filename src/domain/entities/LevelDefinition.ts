import { ValidationError } from '../errors/DomainErrors';

/** Coordenada [fila, columna] en la cuadrícula. */
export type Cell = [number, number];

export interface ArrowData {
  id: string;
  path: Cell[];
  color: string;
}

/** Blob de nivel opaco, tal como lo produce y consume el cliente (mecánica A). */
export interface LevelData {
  cells: Cell[];
  arrows: ArrowData[];
  lives?: number;
}

export interface LevelDefinitionProps {
  id: string;
  name: string;
  difficulty?: string;
  parMoves?: number;
  data: LevelData;
}

/**
 * LevelDefinition — Aggregate Root del dominio del backend.
 * El backend NO interpreta la mecánica de juego: trata `data` como JSON opaco.
 * Invariantes mínimas (independientes de la mecánica):
 * - id no puede estar vacío
 * - name no puede estar vacío
 * - difficulty (si se provee) debe ser 'easy' | 'medium' | 'hard'
 * - parMoves (si se provee) debe ser > 0
 * - data.cells no puede estar vacío
 * - data.arrows no puede estar vacío
 */
export class LevelDefinition {
  public readonly id: string;
  public readonly name: string;
  public readonly difficulty: string;
  public readonly parMoves?: number;
  public readonly data: LevelData;

  constructor(props: LevelDefinitionProps) {
    if (!props.id || props.id.trim() === '') {
      throw new ValidationError('LevelDefinition: id cannot be empty');
    }
    if (!props.name || props.name.trim() === '') {
      throw new ValidationError('LevelDefinition: name cannot be empty');
    }
    const difficulty = props.difficulty ?? 'medium';
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new ValidationError('LevelDefinition: difficulty must be "easy", "medium" or "hard"');
    }
    if (props.parMoves !== undefined && props.parMoves <= 0) {
      throw new ValidationError('LevelDefinition: parMoves must be greater than 0 when provided');
    }
    if (!props.data || !Array.isArray(props.data.cells) || props.data.cells.length === 0) {
      throw new ValidationError('LevelDefinition: data.cells cannot be empty');
    }
    if (!Array.isArray(props.data.arrows) || props.data.arrows.length === 0) {
      throw new ValidationError('LevelDefinition: data.arrows cannot be empty');
    }

    this.id = props.id;
    this.name = props.name;
    this.difficulty = difficulty;
    this.parMoves = props.parMoves;
    this.data = props.data;
  }

  public cellCount(): number {
    return this.data.cells.length;
  }

  public arrowCount(): number {
    return this.data.arrows.length;
  }
}
