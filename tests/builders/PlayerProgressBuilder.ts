import { PlayerProgress, PlayerProgressProps } from '../../src/domain/entities/PlayerProgress';
import { UserId } from '../../src/domain/value-objects/UserId';
import { LevelId } from '../../src/domain/value-objects/LevelId';
import { LevelScore } from '../../src/domain/value-objects/LevelScore';
import { Score } from '../../src/domain/value-objects/Score';

interface RawPlayerProgressProps {
  userId: string;
  completedLevels: string[];
  bestScores: Map<string, number> | Record<string, number>;
  currentLevelId: string;
}

export class PlayerProgressBuilder {
  private props: RawPlayerProgressProps = {
    userId: 'user-1',
    completedLevels: ['level_1', 'level_2'],
    bestScores: new Map([['level_1', 900], ['level_2', 800]]),
    currentLevelId: 'level_3',
  };

  public withUserId(userId: string): this { this.props.userId = userId; return this; }
  public withCompletedLevels(levels: string[]): this { this.props.completedLevels = levels; return this; }
  public withBestScores(scores: Map<string, number> | Record<string, number>): this {
    this.props.bestScores = scores;
    return this;
  }
  public withCurrentLevelId(levelId: string): this { this.props.currentLevelId = levelId; return this; }

  /** Props envueltas en VOs (el constructor de PlayerProgress ya no valida). */
  public buildProps(): PlayerProgressProps {
    const entries = this.props.bestScores instanceof Map
      ? [...this.props.bestScores.entries()]
      : Object.entries(this.props.bestScores);

    return {
      userId: UserId.create(this.props.userId),
      completedLevels: this.props.completedLevels.map((id) => LevelId.create(id)),
      bestScores: entries.map(([levelId, score]) => LevelScore.create(LevelId.create(levelId), Score.create(score))),
      currentLevelId: LevelId.create(this.props.currentLevelId),
    };
  }

  public build(): PlayerProgress { return new PlayerProgress(this.buildProps()); }
}

export const aPlayerProgress = (): PlayerProgressBuilder => new PlayerProgressBuilder();
