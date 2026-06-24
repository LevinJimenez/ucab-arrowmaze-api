import { LeaderboardEntry } from '../entities/LeaderboardEntry';

export interface ILeaderboardStrategy {
  calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[];
}
