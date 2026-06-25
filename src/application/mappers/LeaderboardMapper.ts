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
      userId: entry.userId,
      username: entry.username,
      levelId: entry.levelId,
      score: entry.score,
      moves: entry.moves,
      timeSeconds: entry.timeSeconds,
      rankedAt: entry.rankedAt.toISOString(),
    };
  }
}
