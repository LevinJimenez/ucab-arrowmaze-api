import { Request, Response } from 'express';
import { z } from 'zod';
import { GetLeaderboardInput } from '../../domain/use-cases/GetLeaderboardUseCase';
import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { IUseCase } from '../../domain/interfaces/IUseCase';
import { ResponseFactory } from '../factories/ResponseFactory';
import { LeaderboardMapper } from '../mappers/LeaderboardMapper';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export class LeaderboardController {
  constructor(
    private readonly getLeaderboardUseCase: IUseCase<GetLeaderboardInput, LeaderboardEntry[]>,
  ) {}

  public getLeaderboard = async (req: Request<{ levelId: string }>, res: Response): Promise<void> => {
    const levelId = req.params.levelId;
    if (!levelId || levelId.trim() === '') {
      ResponseFactory.error(res, 'Invalid levelId', 400);
      return;
    }

    const parsed = querySchema.safeParse(req.query);
    const limit = parsed.success ? parsed.data.limit : 10;

    const entries = await this.getLeaderboardUseCase.execute({ levelId, limit });

    ResponseFactory.success(res, entries.map(LeaderboardMapper.toDto));
  };
}
