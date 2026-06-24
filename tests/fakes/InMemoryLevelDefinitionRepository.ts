import { LevelDefinition } from '../../src/domain/entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../../src/domain/interfaces/ILevelDefinitionRepository';

export class InMemoryLevelDefinitionRepository implements ILevelDefinitionRepository {
  private readonly levels = new Map<string, LevelDefinition>();

  public async getAll(): Promise<LevelDefinition[]> {
    return [...this.levels.values()];
  }

  public async getById(id: string): Promise<LevelDefinition | null> {
    return this.levels.get(id) ?? null;
  }

  public async save(level: LevelDefinition): Promise<LevelDefinition> {
    this.levels.set(level.id, level);
    return level;
  }
}
