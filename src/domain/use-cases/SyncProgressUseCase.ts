import { PlayerProgress } from '../entities/PlayerProgress';
import { LeaderboardEntry } from '../entities/LeaderboardEntry';
import { IProgressRepository } from '../interfaces/IProgressRepository';
import { ILeaderboardRepository } from '../interfaces/ILeaderboardRepository';
import { IUseCase } from '../interfaces/IUseCase';

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
    const bestScoresMap = new Map<string, number>();
    for (const [key, value] of Object.entries(input.bestScores)) {
      bestScoresMap.set(key, value);
    }

    const progress = new PlayerProgress({
      userId: input.userId,
      completedLevels: input.completedLevels,
      bestScores: bestScoresMap,
      currentLevelId: input.currentLevelId,
    });

    const saved = await this.progressRepository.save(progress);

    if (input.lastLevelId !== undefined && input.lastScore !== undefined) {
      const entry = new LeaderboardEntry({
        userId: input.userId,
        username: input.username,
        levelId: input.lastLevelId,
        score: input.lastScore,
        moves: input.lastMoves ?? 0,
        timeSeconds: input.lastTimeSeconds ?? 0,
        rankedAt: new Date(),
      });
      await this.leaderboardRepository.addEntry(entry);
    }

    return saved;
  }
}
