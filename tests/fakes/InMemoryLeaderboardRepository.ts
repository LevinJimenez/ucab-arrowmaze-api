import { LeaderboardEntry } from '../../src/domain/entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../../src/domain/interfaces/ILeaderboardRepository';

export class InMemoryLeaderboardRepository implements ILeaderboardRepository {
  private readonly entries: LeaderboardEntry[] = [];

  public async addEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
    this.entries.push(entry);
    return entry;
  }

  public async getByLevel(levelId: string, limit: number): Promise<LeaderboardEntry[]> {
    return this.entries
      .filter((e) => e.levelId === levelId)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /** Helper de inspección de estado (solo tests). */
  public getAll(): LeaderboardEntry[] {
    return [...this.entries];
  }
}
