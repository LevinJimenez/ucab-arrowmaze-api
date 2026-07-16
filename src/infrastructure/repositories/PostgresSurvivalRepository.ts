import { PrismaClient } from '@prisma/client';
import { SurvivalEntry } from '../../domain/entities/SurvivalEntry';
import { ISurvivalRepository } from '../../domain/interfaces/ISurvivalRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { Username } from '../../domain/value-objects/Username';
import { BoardsSolved } from '../../domain/value-objects/BoardsSolved';
import { Duration } from '../../domain/value-objects/Duration';
import { Score } from '../../domain/value-objects/Score';

interface SurvivalRecord {
  userId: string;
  username: string;
  boardsSolved: number;
  durationSeconds: number;
  totalScore: number | null;
  playedAt: Date;
}

export class PostgresSurvivalRepository implements ISurvivalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async addEntry(entry: SurvivalEntry): Promise<SurvivalEntry> {
    await this.prisma.survivalEntry.create({
      data: {
        userId: entry.userId.value,
        username: entry.username.value,
        boardsSolved: entry.boardsSolved.value,
        durationSeconds: entry.durationSeconds.value,
        totalScore: entry.totalScore?.value ?? null,
        playedAt: entry.playedAt,
      },
    });
    return entry;
  }

  /**
   * Desempate determinista: boardsSolved DESC (la métrica del modo), luego
   * totalScore DESC (nulls al final, vía la posición de `sort` de Prisma),
   * luego playedAt ASC (la corrida más temprana rompe el empate final).
   */
  public async getTop(durationSeconds: Duration, limit: number): Promise<SurvivalEntry[]> {
    const records = await this.prisma.survivalEntry.findMany({
      where: { durationSeconds: durationSeconds.value },
      orderBy: [
        { boardsSolved: 'desc' },
        { totalScore: { sort: 'desc', nulls: 'last' } },
        { playedAt: 'asc' },
      ],
      take: limit,
    });

    return records.map((r: SurvivalRecord) => new SurvivalEntry({
      userId: UserId.create(r.userId),
      username: Username.create(r.username),
      boardsSolved: BoardsSolved.create(r.boardsSolved),
      durationSeconds: Duration.create(r.durationSeconds),
      totalScore: r.totalScore !== null ? Score.create(r.totalScore) : undefined,
      playedAt: r.playedAt,
    }));
  }
}
