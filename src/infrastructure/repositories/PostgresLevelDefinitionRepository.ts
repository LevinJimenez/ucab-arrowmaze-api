import { PrismaClient, Prisma } from '@prisma/client';
import { LevelDefinition, LevelData } from '../../domain/entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../../domain/interfaces/ILevelDefinitionRepository';

interface LevelRecord {
  id: string;
  name: string;
  difficulty: string;
  parMoves: number | null;
  data: Prisma.JsonValue;
}

export class PostgresLevelDefinitionRepository implements ILevelDefinitionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getAll(): Promise<LevelDefinition[]> {
    const records = await this.prisma.levelDefinition.findMany({ orderBy: { id: 'asc' } });
    return records.map((r: LevelRecord) => this.toEntity(r));
  }

  public async getById(id: string): Promise<LevelDefinition | null> {
    const record = await this.prisma.levelDefinition.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  public async save(level: LevelDefinition): Promise<LevelDefinition> {
    const data = level.data as unknown as Prisma.InputJsonValue;

    await this.prisma.levelDefinition.upsert({
      where: { id: level.id },
      update: {
        name: level.name,
        difficulty: level.difficulty,
        parMoves: level.parMoves ?? null,
        data,
      },
      create: {
        id: level.id,
        name: level.name,
        difficulty: level.difficulty,
        parMoves: level.parMoves ?? null,
        data,
      },
    });
    return level;
  }

  private toEntity(record: LevelRecord): LevelDefinition {
    return new LevelDefinition({
      id: record.id,
      name: record.name,
      difficulty: record.difficulty,
      parMoves: record.parMoves ?? undefined,
      data: record.data as unknown as LevelData,
    });
  }
}
