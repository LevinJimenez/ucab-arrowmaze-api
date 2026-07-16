import { describe, it, expect, beforeEach } from 'vitest';
import { SyncProgressUseCase } from '../../../src/domain/use-cases/SyncProgressUseCase';
import { InMemoryProgressRepository } from '../../fakes/InMemoryProgressRepository';
import { InMemoryLeaderboardRepository } from '../../fakes/InMemoryLeaderboardRepository';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { LevelId } from '../../../src/domain/value-objects/LevelId';

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
    const stored = await progress.getByUserId(UserId.create('user-1'));
    expect(stored?.completedLevels.map((l) => l.value)).toEqual(['level_1', 'level_2']);
    expect(stored?.currentLevelId.value).toBe('level_3');
    expect(stored?.getBestScore(LevelId.create('level_1'))?.value).toBe(900);
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
    expect(recorded[0].levelId.value).toBe('level_2');
    expect(recorded[0].score.value).toBe(800);
    expect(recorded[0].username.value).toBe('player1');
  });

  it('should_default_moves_and_time_to_zero_when_last_run_omits_them', async () => {
    // Arrange + Act — última partida CON levelId+score pero SIN moves/time
    await useCase.execute({ ...baseInput, lastLevelId: 'level_2', lastScore: 700 });

    // Assert — la entrada se registra con moves/time por defecto en 0 (estado del fake)
    const [recorded] = leaderboard.getAll();
    expect(recorded.moves.value).toBe(0);
    expect(recorded.timeSeconds.value).toBe(0);
  });
});
