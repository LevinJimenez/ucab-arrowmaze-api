import { LevelId } from '../value-objects/LevelId';
import { LevelName } from '../value-objects/LevelName';
import { Difficulty } from '../value-objects/Difficulty';
import { ParMoves } from '../value-objects/ParMoves';
import { LevelData } from '../value-objects/LevelData';

export interface LevelDefinitionProps {
  id: LevelId;
  name: LevelName;
  difficulty: Difficulty;
  parMoves?: ParMoves;
  data: LevelData;
}

/**
 * LevelDefinition — Aggregate Root del dominio del backend.
 * El backend NO interpreta la mecánica de juego: trata `data` como JSON opaco.
 */
export class LevelDefinition {
  public readonly id: LevelId;
  public readonly name: LevelName;
  public readonly difficulty: Difficulty;
  public readonly parMoves?: ParMoves;
  public readonly data: LevelData;

  constructor(props: LevelDefinitionProps) {
    this.id = props.id;
    this.name = props.name;
    this.difficulty = props.difficulty;
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
