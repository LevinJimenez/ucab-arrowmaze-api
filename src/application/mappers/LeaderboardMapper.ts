import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';

export interface LeaderboardEntryDto {
  userId: string;
  username: string;
  levelId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  rankedAt: string;
}

export class LeaderboardMapper {
  static toDto(entry: LeaderboardEntry): LeaderboardEntryDto {
    return {
      userId: entry.userId.value,
      username: entry.username.value,
      levelId: entry.levelId.value,
      score: entry.score.value,
      moves: entry.moves.value,
      timeSeconds: entry.timeSeconds.value,
      rankedAt: entry.rankedAt.toISOString(),
    };
  }
}
