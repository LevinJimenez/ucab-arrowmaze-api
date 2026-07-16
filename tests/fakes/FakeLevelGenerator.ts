import { ILevelGenerator, LevelSpec } from '../../src/domain/interfaces/ILevelGenerator';
import { LevelData } from '../../src/domain/value-objects/LevelData';

export class FakeLevelGenerator implements ILevelGenerator {
  public lastSpec: LevelSpec | undefined;

  private readonly canonicalLevel = LevelData.create({
    cells: [[0, 0], [0, 1], [1, 0]],
    arrows: [{ id: 'a1', path: [[0, 0], [0, 1]], color: '#EF476F' }],
    lives: 3,
  });

  public async generate(spec: LevelSpec): Promise<LevelData> {
    this.lastSpec = spec;
    return this.canonicalLevel;
  }
}
