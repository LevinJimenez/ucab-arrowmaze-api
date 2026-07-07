import { LevelId } from './LevelId';
import { Score } from './Score';

export class LevelScore {
  private constructor(public readonly levelId: LevelId, public readonly score: Score) {}

  static create(levelId: LevelId, score: Score): LevelScore {
    return new LevelScore(levelId, score);
  }

  equals(other: LevelScore): boolean {
    return this.levelId.equals(other.levelId) && this.score.equals(other.score);
  }
}
