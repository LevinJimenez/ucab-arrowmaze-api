import { Request, Response } from 'express';
import { z } from 'zod';
import { SubmitSurvivalRunInput } from '../../domain/use-cases/SubmitSurvivalRunUseCase';
import { GetSurvivalLeaderboardInput } from '../../domain/use-cases/GetSurvivalLeaderboardUseCase';
import { SurvivalEntry } from '../../domain/entities/SurvivalEntry';
import { IUseCase } from '../../domain/interfaces/IUseCase';
import { AuthRequest } from '../middleware/authMiddleware';
import { ResponseFactory } from '../factories/ResponseFactory';
import { SurvivalMapper } from '../mappers/SurvivalMapper';

const submitSchema = z.object({
  boardsSolved: z.number().int().min(0),
  durationSeconds: z.number().int().positive(),
  totalScore: z.number().int().min(0).optional(),
});

const leaderboardQuerySchema = z.object({
  durationSeconds: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export class SurvivalController {
  constructor(
    private readonly submitSurvivalRunUseCase: IUseCase<SubmitSurvivalRunInput, SurvivalEntry>,
    private readonly getSurvivalLeaderboardUseCase: IUseCase<GetSurvivalLeaderboardInput, SurvivalEntry[]>,
  ) {}

  public submit = async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const entry = await this.submitSurvivalRunUseCase.execute({
      userId: req.userId as string,
      username: req.username as string,
      ...parsed.data,
    });

    ResponseFactory.created(res, SurvivalMapper.toDto(entry));
  };

  public getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    const parsed = leaderboardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const entries = await this.getSurvivalLeaderboardUseCase.execute(parsed.data);

    ResponseFactory.success(res, entries.map(SurvivalMapper.toDto));
  };
}
