import { PlayerProgress } from '../entities/PlayerProgress';
import { LeaderboardEntry } from '../entities/LeaderboardEntry';
import { IProgressRepository } from '../interfaces/IProgressRepository';
import { ILeaderboardRepository } from '../interfaces/ILeaderboardRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { UserId } from '../value-objects/UserId';
import { Username } from '../value-objects/Username';
import { LevelId } from '../value-objects/LevelId';
import { LevelScore } from '../value-objects/LevelScore';
import { Score } from '../value-objects/Score';
import { Moves } from '../value-objects/Moves';
import { TimeSeconds } from '../value-objects/TimeSeconds';

export interface SyncProgressInput {
  userId: string;
  username: string;
  completedLevels: string[];
  bestScores: Record<string, number>;
  currentLevelId: string;
  lastLevelId?: string;
  lastScore?: number;
  lastMoves?: number;
  lastTimeSeconds?: number;
}

export class SyncProgressUseCase implements IUseCase<SyncProgressInput, PlayerProgress> {
  constructor(
    private readonly progressRepository: IProgressRepository,
    private readonly leaderboardRepository: ILeaderboardRepository,
  ) {}

  public async execute(input: SyncProgressInput): Promise<PlayerProgress> {
    const userId = UserId.create(input.userId);
    const completedLevels = input.completedLevels.map((id) => LevelId.create(id));
    const currentLevelId = LevelId.create(input.currentLevelId);
    const bestScores = Object.entries(input.bestScores).map(([levelId, score]) =>
      LevelScore.create(LevelId.create(levelId), Score.create(score)),
    );

    const progress = new PlayerProgress({
      userId,
      completedLevels,
      bestScores,
      currentLevelId,
    });

    const saved = await this.progressRepository.save(progress);

    if (input.lastLevelId !== undefined && input.lastScore !== undefined) {
      const entry = new LeaderboardEntry({
        userId,
        username: Username.create(input.username),
        levelId: LevelId.create(input.lastLevelId),
        score: Score.create(input.lastScore),
        moves: Moves.create(input.lastMoves ?? 0),
        timeSeconds: TimeSeconds.create(input.lastTimeSeconds ?? 0),
        rankedAt: new Date(),
      });
      await this.leaderboardRepository.addEntry(entry);
    }

    return saved;
  }
}
