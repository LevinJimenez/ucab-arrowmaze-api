import { LeaderboardEntry } from '../../src/domain/entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../../src/domain/interfaces/ILeaderboardRepository';
import { LevelId } from '../../src/domain/value-objects/LevelId';

export class InMemoryLeaderboardRepository implements ILeaderboardRepository {
  private readonly entries: LeaderboardEntry[] = [];

  public async addEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
    this.entries.push(entry);
    return entry;
  }

  public async getByLevel(levelId: LevelId, limit: number): Promise<LeaderboardEntry[]> {
    return this.entries
      .filter((e) => e.levelId.equals(levelId))
      .sort((a, b) => b.score.value - a.score.value)
      .slice(0, limit);
  }

  /** Helper de inspección de estado (solo tests). */
  public getAll(): LeaderboardEntry[] {
    return [...this.entries];
  }
}
