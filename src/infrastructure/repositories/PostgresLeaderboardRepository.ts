import { PrismaClient } from '@prisma/client';
import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../../domain/interfaces/ILeaderboardRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { Username } from '../../domain/value-objects/Username';
import { LevelId } from '../../domain/value-objects/LevelId';
import { Score } from '../../domain/value-objects/Score';
import { Moves } from '../../domain/value-objects/Moves';
import { TimeSeconds } from '../../domain/value-objects/TimeSeconds';

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
        userId: entry.userId.value,
        username: entry.username.value,
        levelId: entry.levelId.value,
        score: entry.score.value,
        moves: entry.moves.value,
        timeSeconds: entry.timeSeconds.value,
        rankedAt: entry.rankedAt,
      },
    });
    return entry;
  }

  public async getByLevel(levelId: LevelId, limit: number): Promise<LeaderboardEntry[]> {
    const records = await this.prisma.leaderboardEntry.findMany({
      where: { levelId: levelId.value },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return records.map((r: LeaderboardRecord) => new LeaderboardEntry({
      userId: UserId.create(r.userId),
      username: Username.create(r.username),
      levelId: LevelId.create(r.levelId),
      score: Score.create(r.score),
      moves: Moves.create(r.moves),
      timeSeconds: TimeSeconds.create(r.timeSeconds),
      rankedAt: r.rankedAt,
    }));
  }
}
