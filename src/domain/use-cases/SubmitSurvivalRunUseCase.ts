import { SurvivalEntry } from '../entities/SurvivalEntry';
import { ISurvivalRepository } from '../interfaces/ISurvivalRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { UserId } from '../value-objects/UserId';
import { Username } from '../value-objects/Username';
import { BoardsSolved } from '../value-objects/BoardsSolved';
import { Duration } from '../value-objects/Duration';
import { Score } from '../value-objects/Score';

export interface SubmitSurvivalRunInput {
  userId: string;
  username: string;
  boardsSolved: number;
  durationSeconds: number;
  totalScore?: number;
}

export class SubmitSurvivalRunUseCase implements IUseCase<SubmitSurvivalRunInput, SurvivalEntry> {
  constructor(
    private readonly survivalRepository: ISurvivalRepository,
  ) {}

  public async execute(input: SubmitSurvivalRunInput): Promise<SurvivalEntry> {
    const entry = new SurvivalEntry({
      userId: UserId.create(input.userId),
      username: Username.create(input.username),
      boardsSolved: BoardsSolved.create(input.boardsSolved),
      durationSeconds: Duration.create(input.durationSeconds),
      totalScore: input.totalScore !== undefined ? Score.create(input.totalScore) : undefined,
      playedAt: new Date(),
    });

    return this.survivalRepository.addEntry(entry);
  }
}
