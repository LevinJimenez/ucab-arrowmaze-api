import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class PerLevelLeaderboardStrategy implements ILeaderboardStrategy {
  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    return [...entries]
      .sort((a, b) => b.score.value - a.score.value)
      .slice(0, limit);
  }
}
