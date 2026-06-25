import { LevelDefinition, LevelData } from '../entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../interfaces/ILevelDefinitionRepository';
import { IUseCase } from '../interfaces/IUseCase';

export interface UpsertLevelInput {
  id: string;
  name: string;
  difficulty?: string;
  parMoves?: number;
  data: LevelData;
}

export class UpsertLevelDefinitionUseCase implements IUseCase<UpsertLevelInput, LevelDefinition> {
  constructor(
    private readonly levelDefinitionRepository: ILevelDefinitionRepository,
  ) {}

  public async execute(input: UpsertLevelInput): Promise<LevelDefinition> {
    // El constructor de LevelDefinition valida las invariantes del dominio.
    const level = new LevelDefinition({
      id: input.id,
      name: input.name,
      difficulty: input.difficulty,
      parMoves: input.parMoves,
      data: input.data,
    });

    return this.levelDefinitionRepository.save(level);
  }
}
