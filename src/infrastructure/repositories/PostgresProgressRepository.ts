import { PrismaClient, Prisma } from '@prisma/client';
import { PlayerProgress } from '../../domain/entities/PlayerProgress';
import { IProgressRepository } from '../../domain/interfaces/IProgressRepository';

export class PostgresProgressRepository implements IProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getByUserId(userId: string): Promise<PlayerProgress | null> {
    const record = await this.prisma.playerProgress.findUnique({ where: { userId } });
    if (!record) return null;

    const bestScores = record.bestScores as unknown as Record<string, number>;

    return new PlayerProgress({
      userId: record.userId,
      completedLevels: record.completedLevels,
      bestScores: new Map(Object.entries(bestScores)),
      currentLevelId: record.currentLevelId,
    });
  }

  public async save(progress: PlayerProgress): Promise<PlayerProgress> {
    const bestScoresObj: Record<string, number> = {};
    progress.bestScores.forEach((value, key) => {
      bestScoresObj[key] = value;
    });

    await this.prisma.playerProgress.upsert({
      where: { userId: progress.userId },
      update: {
        completedLevels: progress.completedLevels,
        bestScores: bestScoresObj as Prisma.InputJsonValue,
        currentLevelId: progress.currentLevelId,
      },
      create: {
        userId: progress.userId,
        completedLevels: progress.completedLevels,
        bestScores: bestScoresObj as Prisma.InputJsonValue,
        currentLevelId: progress.currentLevelId,
      },
    });

    return progress;
  }
}
