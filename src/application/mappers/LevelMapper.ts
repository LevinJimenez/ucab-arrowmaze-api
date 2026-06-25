import { LevelDefinition } from '../../domain/entities/LevelDefinition';

export interface LevelDto {
  id: string;
  name: string;
  difficulty: string;
  parMoves?: number;
  data: LevelDefinition['data'];
}

export class LevelMapper {
  static toDto(level: LevelDefinition): LevelDto {
    return {
      id: level.id,
      name: level.name,
      difficulty: level.difficulty,
      parMoves: level.parMoves,
      data: level.data,
    };
  }
}
