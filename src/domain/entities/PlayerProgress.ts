import { ValidationError } from '../errors/DomainErrors';

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
    if (!props.userId || props.userId.trim().length === 0) {
      throw new ValidationError('PlayerProgress: userId cannot be empty');
    }
    for (const [levelId, score] of props.bestScores) {
      if (score < 0) {
        throw new ValidationError(`PlayerProgress: best score for ${levelId} cannot be negative`);
      }
    }

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
