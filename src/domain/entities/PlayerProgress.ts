export interface PlayerProgressProps {
  userId: string;
  completedLevels: string[];
  bestScores: Map<string, number>;
  currentLevelId: string;
}

export class PlayerProgress {
  public readonly userId: string;
  public readonly completedLevels: string[];
  public readonly bestScores: Map<string, number>;
  public readonly currentLevelId: string;

  constructor(props: PlayerProgressProps) {
    this.userId = props.userId;
    this.completedLevels = props.completedLevels;
    this.bestScores = props.bestScores;
    this.currentLevelId = props.currentLevelId;
  }

  public isLevelCompleted(levelId: string): boolean {
    return this.completedLevels.includes(levelId);
  }

  public getBestScore(levelId: string): number | undefined {
    return this.bestScores.get(levelId);
  }
}
