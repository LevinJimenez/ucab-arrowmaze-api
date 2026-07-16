import { Request, Response } from 'express';
import { z } from 'zod';
import { UpsertLevelInput } from '../../domain/use-cases/UpsertLevelDefinitionUseCase';
import { LevelDefinition } from '../../domain/entities/LevelDefinition';
import { LevelData } from '../../domain/value-objects/LevelData';
import { LevelSpec } from '../../domain/interfaces/ILevelGenerator';
import { IUseCase } from '../../domain/interfaces/IUseCase';
import { ResponseFactory } from '../factories/ResponseFactory';
import { LevelMapper } from '../mappers/LevelMapper';

const cellSchema = z.tuple([z.number().int(), z.number().int()]);

const upsertSchema = z.object({
  name: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  parMoves: z.number().int().positive().optional(),
  data: z.object({
    cells: z.array(cellSchema).min(1),
    arrows: z.array(z.object({
      id: z.string().min(1),
      path: z.array(cellSchema).min(1),
      color: z.string().min(1),
    })).min(1),
    lives: z.number().int().min(0).optional(),
    timeLimitSeconds: z.number().int().min(0).optional(),
  }),
});

const generateSchema = z.object({
  prompt: z.string().min(1).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export class LevelController {
  constructor(
    private readonly getLevelDefinitionsUseCase: IUseCase<void, LevelDefinition[]>,
    private readonly getLevelByIdUseCase: IUseCase<string, LevelDefinition | null>,
    private readonly upsertLevelDefinitionUseCase: IUseCase<UpsertLevelInput, LevelDefinition>,
    private readonly generateLevelUseCase: IUseCase<LevelSpec, LevelData>,
  ) {}

  public getAll = async (_req: Request, res: Response): Promise<void> => {
    const levels = await this.getLevelDefinitionsUseCase.execute();
    ResponseFactory.success(res, levels.map(LevelMapper.toDto));
  };

  public getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id || id.trim() === '') {
      ResponseFactory.error(res, 'Invalid level id', 400);
      return;
    }

    const level = await this.getLevelByIdUseCase.execute(id);
    if (!level) {
      ResponseFactory.error(res, 'Not found', 404);
      return;
    }

    ResponseFactory.success(res, LevelMapper.toDto(level));
  };

  public upsert = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id || id.trim() === '') {
      ResponseFactory.error(res, 'Invalid level id', 400);
      return;
    }

    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const level = await this.upsertLevelDefinitionUseCase.execute({ id, ...parsed.data });
    ResponseFactory.success(res, LevelMapper.toDto(level));
  };

  public generate = async (req: Request, res: Response): Promise<void> => {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const level = await this.generateLevelUseCase.execute(parsed.data);
    ResponseFactory.success(res, level.toPrimitives());
  };
}
