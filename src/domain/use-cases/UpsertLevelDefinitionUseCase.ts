import { LevelDefinition } from '../entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../interfaces/ILevelDefinitionRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { LevelId } from '../value-objects/LevelId';
import { LevelName } from '../value-objects/LevelName';
import { Difficulty } from '../value-objects/Difficulty';
import { ParMoves } from '../value-objects/ParMoves';
import { LevelData, LevelDataProps } from '../value-objects/LevelData';

export interface UpsertLevelInput {
  id: string;
  name: string;
  difficulty?: string;
  parMoves?: number;
  data: LevelDataProps;
}

export class UpsertLevelDefinitionUseCase implements IUseCase<UpsertLevelInput, LevelDefinition> {
  constructor(
    private readonly levelDefinitionRepository: ILevelDefinitionRepository,
  ) {}

  public async execute(input: UpsertLevelInput): Promise<LevelDefinition> {
    const level = new LevelDefinition({
      id: LevelId.create(input.id),
      name: LevelName.create(input.name),
      difficulty: Difficulty.create(input.difficulty ?? 'medium'),
      parMoves: input.parMoves !== undefined ? ParMoves.create(input.parMoves) : undefined,
      data: LevelData.create(input.data),
    });

    return this.levelDefinitionRepository.save(level);
  }
}
