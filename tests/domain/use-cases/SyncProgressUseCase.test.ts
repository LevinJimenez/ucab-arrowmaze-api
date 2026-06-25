import { describe, it, expect, beforeEach } from 'vitest';
import { SyncProgressUseCase } from '../../../src/domain/use-cases/SyncProgressUseCase';
import { InMemoryProgressRepository } from '../../fakes/InMemoryProgressRepository';
import { InMemoryLeaderboardRepository } from '../../fakes/InMemoryLeaderboardRepository';

describe('SyncProgressUseCase', () => {
  let progress: InMemoryProgressRepository;
  let leaderboard: InMemoryLeaderboardRepository;
  let useCase: SyncProgressUseCase;

  const baseInput = {
    userId: 'user-1',
    username: 'player1',
    completedLevels: ['level_1', 'level_2'],
    bestScores: { level_1: 900, level_2: 800 },
    currentLevelId: 'level_3',
  };

  beforeEach(() => {
    progress = new InMemoryProgressRepository();
    leaderboard = new InMemoryLeaderboardRepository();
    useCase = new SyncProgressUseCase(progress, leaderboard);
  });

  it('should_persist_player_progress_when_syncing', async () => {
    // Arrange + Act
    await useCase.execute(baseInput);

    // Assert — estado leído del fake, no interacciones espiadas.
    const stored = await progress.getByUserId('user-1');
    expect(stored?.completedLevels).toEqual(['level_1', 'level_2']);
    expect(stored?.currentLevelId).toBe('level_3');
    expect(stored?.getBestScore('level_1')).toBe(900);
  });

  it('should_not_record_a_leaderboard_entry_when_no_last_run_is_provided', async () => {
    // Arrange + Act
    await useCase.execute(baseInput);

    // Assert — rama "sin última partida": el leaderboard queda vacío.
    expect(leaderboard.getAll()).toHaveLength(0);
  });

  it('should_record_a_leaderboard_entry_when_a_last_run_is_provided', async () => {
    // Arrange + Act
    await useCase.execute({
      ...baseInput,
      lastLevelId: 'level_2',
      lastScore: 800,
      lastMoves: 6,
      lastTimeSeconds: 40,
    });

    // Assert — rama "con última partida": se registra exactamente una entrada.
    const recorded = leaderboard.getAll();
    expect(recorded).toHaveLength(1);
    expect(recorded[0].levelId).toBe('level_2');
    expect(recorded[0].score).toBe(800);
    expect(recorded[0].username).toBe('player1');
  });
});
