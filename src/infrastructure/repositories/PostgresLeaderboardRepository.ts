import { PrismaClient } from '@prisma/client';
import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../../domain/interfaces/ILeaderboardRepository';

interface LeaderboardRecord {
  userId: string;
  username: string;
  levelId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  rankedAt: Date;
}

export class PostgresLeaderboardRepository implements ILeaderboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async addEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
    await this.prisma.leaderboardEntry.create({
      data: {
        userId: entry.userId,
        username: entry.username,
        levelId: entry.levelId,
        score: entry.score,
        moves: entry.moves,
        timeSeconds: entry.timeSeconds,
        rankedAt: entry.rankedAt,
      },
    });
    return entry;
  }

  public async getByLevel(levelId: string, limit: number): Promise<LeaderboardEntry[]> {
    const records = await this.prisma.leaderboardEntry.findMany({
      where: { levelId },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return records.map((r: LeaderboardRecord) => new LeaderboardEntry({
      userId: r.userId,
      username: r.username,
      levelId: r.levelId,
      score: r.score,
      moves: r.moves,
      timeSeconds: r.timeSeconds,
      rankedAt: r.rankedAt,
    }));
  }
}
