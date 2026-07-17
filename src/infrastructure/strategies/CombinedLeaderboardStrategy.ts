import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class CombinedLeaderboardStrategy implements ILeaderboardStrategy {
  private readonly scoreWeight = 0.7;
  private readonly efficiencyWeight = 0.3;

  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    // Misma clave que PerLevelLeaderboardStrategy: (userId, levelId). Nos
    // quedamos con la entrada de mayor combinedScore por clave.
    const bestByPlayerAndLevel = new Map<string, { entry: LeaderboardEntry; combinedScore: number }>();

    for (const entry of entries) {
      const key = `${entry.userId.value}:${entry.levelId.value}`;
      const combinedScore = this.combinedScoreOf(entry);
      const existing = bestByPlayerAndLevel.get(key);
      if (!existing || combinedScore > existing.combinedScore) {
        bestByPlayerAndLevel.set(key, { entry, combinedScore });
      }
    }

    return Array.from(bestByPlayerAndLevel.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit)
      .map((s) => s.entry);
  }

  private combinedScoreOf(entry: LeaderboardEntry): number {
    const maxScore = 1000;
    const normalizedScore = entry.score.value / maxScore;
    const efficiency = entry.moves.value > 0 ? 1 / entry.moves.value : 0;
    return this.scoreWeight * normalizedScore + this.efficiencyWeight * efficiency;
  }
}
