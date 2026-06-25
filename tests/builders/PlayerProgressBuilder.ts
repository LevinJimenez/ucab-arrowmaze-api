import { PlayerProgress, PlayerProgressProps } from '../../src/domain/entities/PlayerProgress';

export class PlayerProgressBuilder {
  private props: PlayerProgressProps = {
    userId: 'user-1',
    completedLevels: ['level_1', 'level_2'],
    bestScores: new Map([['level_1', 900], ['level_2', 800]]),
    currentLevelId: 'level_3',
  };

  public withUserId(userId: string): this { this.props.userId = userId; return this; }
  public withCompletedLevels(levels: string[]): this { this.props.completedLevels = levels; return this; }
  public withBestScores(scores: Map<string, number>): this { this.props.bestScores = scores; return this; }
  public withCurrentLevelId(levelId: string): this { this.props.currentLevelId = levelId; return this; }

  /** Props crudas con array y Map clonados para aislar tests entre sí. */
  public buildProps(): PlayerProgressProps {
    return {
      ...this.props,
      completedLevels: [...this.props.completedLevels],
      bestScores: new Map(this.props.bestScores),
    };
  }

  public build(): PlayerProgress { return new PlayerProgress(this.buildProps()); }
}

export const aPlayerProgress = (): PlayerProgressBuilder => new PlayerProgressBuilder();
