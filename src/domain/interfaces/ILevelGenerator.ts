import { LevelData } from '../value-objects/LevelData';

export interface LevelSpec {
  prompt: string;
  difficulty?: string;
}

export interface ILevelGenerator {
  generate(spec: LevelSpec): Promise<LevelData>;
}
