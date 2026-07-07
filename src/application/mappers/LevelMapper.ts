import { LevelDefinition } from '../../domain/entities/LevelDefinition';
import { LevelDataProps } from '../../domain/value-objects/LevelData';

export interface LevelDto {
  id: string;
  name: string;
  difficulty: string;
  parMoves?: number;
  data: LevelDataProps;
}

export class LevelMapper {
  static toDto(level: LevelDefinition): LevelDto {
    return {
      id: level.id.value,
      name: level.name.value,
      difficulty: level.difficulty.value,
      parMoves: level.parMoves?.value,
      data: level.data.toPrimitives(),
    };
  }
}
