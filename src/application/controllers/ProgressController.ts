import { Response } from 'express';
import { z } from 'zod';
import { SyncProgressInput } from '../../domain/use-cases/SyncProgressUseCase';
import { PlayerProgress } from '../../domain/entities/PlayerProgress';
import { IUseCase } from '../../domain/interfaces/IUseCase';
import { IProgressRepository } from '../../domain/interfaces/IProgressRepository';
import { AuthRequest } from '../middleware/authMiddleware';
import { ResponseFactory } from '../factories/ResponseFactory';
import { ProgressMapper } from '../mappers/ProgressMapper';

const syncSchema = z.object({
  completedLevels: z.array(z.string().min(1)),
  bestScores: z.record(z.string(), z.number()),
  currentLevelId: z.string().min(1),
  lastLevelId: z.string().min(1).optional(),
  lastScore: z.number().int().min(0).optional(),
  lastMoves: z.number().int().min(0).optional(),
  lastTimeSeconds: z.number().int().min(0).optional(),
});

export class ProgressController {
  constructor(
    private readonly syncProgressUseCase: IUseCase<SyncProgressInput, PlayerProgress>,
    private readonly progressRepository: IProgressRepository,
  ) {}

  public getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string;
    const progress = await this.progressRepository.getByUserId(userId);

    if (!progress) {
      ResponseFactory.error(res, 'Not found', 404);
      return;
    }

    ResponseFactory.success(res, ProgressMapper.toDto(progress));
  };

  public syncProgress = async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = syncSchema.safeParse(req.body);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const progress = await this.syncProgressUseCase.execute({
      userId: req.userId as string,
      username: req.username as string,
      ...parsed.data,
    });

    ResponseFactory.success(res, ProgressMapper.toDto(progress));
  };
}
