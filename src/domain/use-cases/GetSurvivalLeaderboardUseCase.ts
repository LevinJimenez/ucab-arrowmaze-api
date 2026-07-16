import { SurvivalEntry } from '../entities/SurvivalEntry';
import { ISurvivalRepository } from '../interfaces/ISurvivalRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { Duration } from '../value-objects/Duration';

export interface GetSurvivalLeaderboardInput {
  durationSeconds: number;
  limit?: number;
}

export class GetSurvivalLeaderboardUseCase implements IUseCase<GetSurvivalLeaderboardInput, SurvivalEntry[]> {
  constructor(
    private readonly survivalRepository: ISurvivalRepository,
  ) {}

  public async execute(input: GetSurvivalLeaderboardInput): Promise<SurvivalEntry[]> {
    const limit = input.limit ?? 10;
    const durationSeconds = Duration.create(input.durationSeconds);
    return this.survivalRepository.getTop(durationSeconds, limit);
  }
}
