import { LeaderboardEntry } from '../entities/LeaderboardEntry';
import { LevelId } from '../value-objects/LevelId';

export interface ILeaderboardRepository {
  addEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry>;
  getByLevel(levelId: LevelId, limit: number): Promise<LeaderboardEntry[]>;
}
