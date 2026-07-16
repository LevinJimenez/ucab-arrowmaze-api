import { LeaderboardEntry } from '../entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../interfaces/ILeaderboardRepository';
import { ILeaderboardStrategy } from '../interfaces/ILeaderboardStrategy';
import { IUseCase } from '../interfaces/IUseCase';
import { LevelId } from '../value-objects/LevelId';

export interface GetLeaderboardInput {
  levelId: string;
  limit?: number;
}

export class GetLeaderboardUseCase implements IUseCase<GetLeaderboardInput, LeaderboardEntry[]> {
  constructor(
    private readonly leaderboardRepository: ILeaderboardRepository,
    private readonly leaderboardStrategy: ILeaderboardStrategy,
  ) {}

  public async execute(input: GetLeaderboardInput): Promise<LeaderboardEntry[]> {
    const limit = input.limit ?? 10;
    const levelId = LevelId.create(input.levelId);
    const entries = await this.leaderboardRepository.getByLevel(levelId, 100);
    return this.leaderboardStrategy.calculateRanking(entries, limit);
  }
}
