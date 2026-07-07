import { PrismaClient, Prisma } from '@prisma/client';
import { PlayerProgress } from '../../domain/entities/PlayerProgress';
import { IProgressRepository } from '../../domain/interfaces/IProgressRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { LevelId } from '../../domain/value-objects/LevelId';
import { LevelScore } from '../../domain/value-objects/LevelScore';
import { Score } from '../../domain/value-objects/Score';

export class PostgresProgressRepository implements IProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getByUserId(userId: UserId): Promise<PlayerProgress | null> {
    const record = await this.prisma.playerProgress.findUnique({ where: { userId: userId.value } });
    if (!record) return null;

    const bestScores = record.bestScores as unknown as Record<string, number>;

    return new PlayerProgress({
      userId: UserId.create(record.userId),
      completedLevels: record.completedLevels.map((id: string) => LevelId.create(id)),
      bestScores: Object.entries(bestScores).map(([levelId, score]) =>
        LevelScore.create(LevelId.create(levelId), Score.create(score)),
      ),
      currentLevelId: LevelId.create(record.currentLevelId),
    });
  }

  public async save(progress: PlayerProgress): Promise<PlayerProgress> {
    const completedLevels = progress.completedLevels.map((l) => l.value);
    const bestScoresObj = Object.fromEntries(
      progress.bestScores.map((bs) => [bs.levelId.value, bs.score.value]),
    );

    await this.prisma.playerProgress.upsert({
      where: { userId: progress.userId.value },
      update: {
        completedLevels,
        bestScores: bestScoresObj as unknown as Prisma.InputJsonValue,
        currentLevelId: progress.currentLevelId.value,
      },
      create: {
        userId: progress.userId.value,
        completedLevels,
        bestScores: bestScoresObj as unknown as Prisma.InputJsonValue,
        currentLevelId: progress.currentLevelId.value,
      },
    });

    return progress;
  }
}
