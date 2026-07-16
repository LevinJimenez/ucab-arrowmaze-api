import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class TotalScoreLeaderboardStrategy implements ILeaderboardStrategy {
  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    const aggregated = new Map<string, { entry: LeaderboardEntry; totalScore: number }>();

    for (const entry of entries) {
      const existing = aggregated.get(entry.userId.value);
      if (existing) {
        existing.totalScore += entry.score.value;
      } else {
        aggregated.set(entry.userId.value, { entry, totalScore: entry.score.value });
      }
    }

    return Array.from(aggregated.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((a) => a.entry);
  }
}
