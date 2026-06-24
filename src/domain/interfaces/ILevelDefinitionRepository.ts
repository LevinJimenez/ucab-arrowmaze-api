import { LevelDefinition } from '../entities/LevelDefinition';

export interface ILevelDefinitionRepository {
  getAll(): Promise<LevelDefinition[]>;
  getById(id: string): Promise<LevelDefinition | null>;
  save(level: LevelDefinition): Promise<LevelDefinition>;
}
