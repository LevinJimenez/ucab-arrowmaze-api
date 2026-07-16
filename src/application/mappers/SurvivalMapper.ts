import { SurvivalEntry } from '../../domain/entities/SurvivalEntry';

export interface SurvivalEntryDto {
  userId: string;
  username: string;
  boardsSolved: number;
  durationSeconds: number;
  totalScore?: number;
  playedAt: string;
}

export class SurvivalMapper {
  static toDto(entry: SurvivalEntry): SurvivalEntryDto {
    return {
      userId: entry.userId.value,
      username: entry.username.value,
      boardsSolved: entry.boardsSolved.value,
      durationSeconds: entry.durationSeconds.value,
      totalScore: entry.totalScore?.value,
      playedAt: entry.playedAt.toISOString(),
    };
  }
}
