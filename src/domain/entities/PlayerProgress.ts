import { UserId } from '../value-objects/UserId';
import { LevelId } from '../value-objects/LevelId';
import { LevelScore } from '../value-objects/LevelScore';
import { Score } from '../value-objects/Score';

export interface PlayerProgressProps {
  userId: UserId;
  completedLevels: LevelId[];
  bestScores: LevelScore[];
  currentLevelId: LevelId;
}

export class PlayerProgress {
  public readonly userId: UserId;
  public readonly completedLevels: LevelId[];
  public readonly bestScores: LevelScore[];
  public readonly currentLevelId: LevelId;

  constructor(props: PlayerProgressProps) {
    this.userId = props.userId;
    this.completedLevels = props.completedLevels;
    this.bestScores = props.bestScores;
    this.currentLevelId = props.currentLevelId;
  }

  public isLevelCompleted(levelId: LevelId): boolean {
    return this.completedLevels.some((l) => l.equals(levelId));
  }

  public getBestScore(levelId: LevelId): Score | undefined {
    return this.bestScores.find((bs) => bs.levelId.equals(levelId))?.score;
  }
}
