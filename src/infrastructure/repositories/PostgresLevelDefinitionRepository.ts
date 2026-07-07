import { PrismaClient, Prisma } from '@prisma/client';
import { LevelDefinition } from '../../domain/entities/LevelDefinition';
import { ILevelDefinitionRepository } from '../../domain/interfaces/ILevelDefinitionRepository';
import { LevelId } from '../../domain/value-objects/LevelId';
import { LevelName } from '../../domain/value-objects/LevelName';
import { Difficulty } from '../../domain/value-objects/Difficulty';
import { ParMoves } from '../../domain/value-objects/ParMoves';
import { LevelData, LevelDataProps } from '../../domain/value-objects/LevelData';

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

  public async getById(id: LevelId): Promise<LevelDefinition | null> {
    const record = await this.prisma.levelDefinition.findUnique({ where: { id: id.value } });
    return record ? this.toEntity(record) : null;
  }

  public async save(level: LevelDefinition): Promise<LevelDefinition> {
    const data = level.data.toPrimitives() as unknown as Prisma.InputJsonValue;

    await this.prisma.levelDefinition.upsert({
      where: { id: level.id.value },
      update: {
        name: level.name.value,
        difficulty: level.difficulty.value,
        parMoves: level.parMoves?.value ?? null,
        data,
      },
      create: {
        id: level.id.value,
        name: level.name.value,
        difficulty: level.difficulty.value,
        parMoves: level.parMoves?.value ?? null,
        data,
      },
    });
    return level;
  }

  private toEntity(record: LevelRecord): LevelDefinition {
    return new LevelDefinition({
      id: LevelId.create(record.id),
      name: LevelName.create(record.name),
      difficulty: Difficulty.create(record.difficulty),
      parMoves: record.parMoves !== null ? ParMoves.create(record.parMoves) : undefined,
      data: LevelData.create(record.data as unknown as LevelDataProps),
    });
  }
}
