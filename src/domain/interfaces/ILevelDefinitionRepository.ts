import { LevelDefinition } from '../entities/LevelDefinition';
import { LevelId } from '../value-objects/LevelId';

export interface ILevelDefinitionRepository {
  getAll(): Promise<LevelDefinition[]>;
  getById(id: LevelId): Promise<LevelDefinition | null>;
  save(level: LevelDefinition): Promise<LevelDefinition>;
}
