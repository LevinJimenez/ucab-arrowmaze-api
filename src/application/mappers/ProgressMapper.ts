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
      userId: progress.userId.value,
      completedLevels: progress.completedLevels.map((l) => l.value),
      bestScores: Object.fromEntries(progress.bestScores.map((bs) => [bs.levelId.value, bs.score.value])),
      currentLevelId: progress.currentLevelId.value,
    };
  }
}
