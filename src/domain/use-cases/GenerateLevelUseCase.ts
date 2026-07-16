import { LevelData } from '../value-objects/LevelData';
import { ILevelGenerator, LevelSpec } from '../interfaces/ILevelGenerator';
import { IUseCase } from '../interfaces/IUseCase';

/**
 * Orquestación pura: prompt -> genera -> valida -> devuelve. Sin repositorio:
 * el nivel generado NO se persiste, el cliente lo guarda en local (Mecánica A).
 */
export class GenerateLevelUseCase implements IUseCase<LevelSpec, LevelData> {
  constructor(private readonly levelGenerator: ILevelGenerator) {}

  public async execute(input: LevelSpec): Promise<LevelData> {
    return this.levelGenerator.generate(input);
  }
}
