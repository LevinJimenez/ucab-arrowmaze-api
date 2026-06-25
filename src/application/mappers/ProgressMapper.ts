import { PlayerProgress } from '../../domain/entities/PlayerProgress';

export interface ProgressDto {
  userId: string;
  completedLevels: string[];
  bestScores: Record<string, number>;
  currentLevelId: string;
}

export class ProgressMapper {
  static toDto(progress: PlayerProgress): ProgressDto {
    return {
      userId: progress.userId,
      completedLevels: progress.completedLevels,
      bestScores: Object.fromEntries(progress.bestScores),
      currentLevelId: progress.currentLevelId,
    };
  }
}
