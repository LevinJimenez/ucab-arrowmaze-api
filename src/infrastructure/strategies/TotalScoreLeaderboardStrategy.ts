import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class TotalScoreLeaderboardStrategy implements ILeaderboardStrategy {
  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    const aggregated = new Map<string, { entry: LeaderboardEntry; totalScore: number }>();

    for (const entry of entries) {
      const existing = aggregated.get(entry.userId);
      if (existing) {
        existing.totalScore += entry.score;
      } else {
        aggregated.set(entry.userId, { entry, totalScore: entry.score });
      }
    }

    return Array.from(aggregated.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((a) => a.entry);
  }
}
