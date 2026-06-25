import { LevelDefinition } from '../entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../interfaces/ILevelDefinitionRepository';
import { IUseCase } from '../interfaces/IUseCase';

export class GetLevelDefinitionsUseCase implements IUseCase<void, LevelDefinition[]> {
  constructor(
    private readonly levelDefinitionRepository: ILevelDefinitionRepository,
  ) {}

  public async execute(): Promise<LevelDefinition[]> {
    return this.levelDefinitionRepository.getAll();
  }

  public async getById(id: string): Promise<LevelDefinition | null> {
    return this.levelDefinitionRepository.getById(id);
  }
}
