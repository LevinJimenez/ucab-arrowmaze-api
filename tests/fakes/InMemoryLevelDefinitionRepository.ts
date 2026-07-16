import { LevelDefinition } from '../../src/domain/entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../../src/domain/interfaces/ILevelDefinitionRepository';
import { LevelId } from '../../src/domain/value-objects/LevelId';

export class InMemoryLevelDefinitionRepository implements ILevelDefinitionRepository {
  private readonly levels = new Map<string, LevelDefinition>();

  public async getAll(): Promise<LevelDefinition[]> {
    return [...this.levels.values()];
  }

  public async getById(id: LevelId): Promise<LevelDefinition | null> {
    return this.levels.get(id.value) ?? null;
  }

  public async save(level: LevelDefinition): Promise<LevelDefinition> {
    this.levels.set(level.id.value, level);
    return level;
  }
}
