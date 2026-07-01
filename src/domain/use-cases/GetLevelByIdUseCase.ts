import { LevelDefinition } from '../entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../interfaces/ILevelDefinitionRepository';
import { IUseCase } from '../interfaces/IUseCase';

export class GetLevelByIdUseCase implements IUseCase<string, LevelDefinition | null> {
  constructor(private readonly levelDefinitionRepository: ILevelDefinitionRepository) {}

  public async execute(id: string): Promise<LevelDefinition | null> {
    return this.levelDefinitionRepository.getById(id);
  }
}
