import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../../domain/interfaces/ILeaderboardRepository';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: ILeaderboardRepository,
    private readonly strategy: ILeaderboardStrategy,
  ) {}

  public async getRanking(levelId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const entries = await this.leaderboardRepository.getByLevel(levelId, 100);
    return this.strategy.calculateRanking(entries, limit);
  }
}
