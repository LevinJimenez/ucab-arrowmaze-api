import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class CombinedLeaderboardStrategy implements ILeaderboardStrategy {
  private readonly scoreWeight = 0.7;
  private readonly efficiencyWeight = 0.3;

  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    const scored = entries.map((entry) => {
      const maxScore = 1000;
      const normalizedScore = entry.score / maxScore;
      const efficiency = entry.moves > 0 ? 1 / entry.moves : 0;
      const combinedScore =
        this.scoreWeight * normalizedScore +
        this.efficiencyWeight * efficiency;
      return { entry, combinedScore };
    });

    return scored
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit)
      .map((s) => s.entry);
  }
}
