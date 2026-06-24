import { LeaderboardEntry } from '../entities/LeaderboardEntry';

export interface ILeaderboardRepository {
  addEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry>;
  getByLevel(levelId: string, limit: number): Promise<LeaderboardEntry[]>;
}
