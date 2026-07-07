import { LevelDefinition } from '../entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../interfaces/ILevelDefinitionRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { LevelId } from '../value-objects/LevelId';

export class GetLevelByIdUseCase implements IUseCase<string, LevelDefinition | null> {
  constructor(private readonly levelDefinitionRepository: ILevelDefinitionRepository) {}

  public async execute(id: string): Promise<LevelDefinition | null> {
    return this.levelDefinitionRepository.getById(LevelId.create(id));
  }
}
