import { describe, it, expect, beforeEach } from 'vitest';
import { GetSurvivalLeaderboardUseCase } from '../../../src/domain/use-cases/GetSurvivalLeaderboardUseCase';
import { InMemorySurvivalRepository } from '../../fakes/InMemorySurvivalRepository';
import { aSurvivalEntry } from '../../builders/SurvivalEntryBuilder';

describe('GetSurvivalLeaderboardUseCase', () => {
  let survival: InMemorySurvivalRepository;
  let useCase: GetSurvivalLeaderboardUseCase;

  beforeEach(() => {
    survival = new InMemorySurvivalRepository();
    useCase = new GetSurvivalLeaderboardUseCase(survival);
  });

  it('should_return_top_runs_sorted_by_boards_solved_when_limit_is_provided', async () => {
    // Arrange
    await survival.addEntry(aSurvivalEntry().forUser('1', 'alice').withBoardsSolved(9).build());
    await survival.addEntry(aSurvivalEntry().forUser('2', 'bob').withBoardsSolved(7).build());
    await survival.addEntry(aSurvivalEntry().forUser('3', 'carol').withBoardsSolved(5).build());

    // Act
    const ranking = await useCase.execute({ durationSeconds: 120, limit: 2 });

    // Assert
    expect(ranking).toHaveLength(2);
    expect(ranking[0].username.value).toBe('alice');
    expect(ranking[1].username.value).toBe('bob');
  });

  it('should_return_at_most_ten_runs_when_limit_is_not_specified', async () => {
    // Arrange
    for (let i = 0; i < 15; i += 1) {
      await survival.addEntry(aSurvivalEntry().forUser(`u${i}`, `player${i}`).withBoardsSolved(i).build());
    }

    // Act
    const ranking = await useCase.execute({ durationSeconds: 120 });

    // Assert — el límite por defecto (10) se observa por la SALIDA.
    expect(ranking).toHaveLength(10);
    expect(ranking[0].boardsSolved.value).toBe(14);
  });

  it('should_return_empty_ranking_when_no_runs_exist_for_that_duration', async () => {
    // Act
    const ranking = await useCase.execute({ durationSeconds: 60 });

    // Assert
    expect(ranking).toEqual([]);
  });

  it('should_only_rank_runs_of_the_requested_duration_when_multiple_durations_exist', async () => {
    // Arrange
    await survival.addEntry(
      aSurvivalEntry().forUser('1', 'alice').withDurationSeconds(120).withBoardsSolved(7).build(),
    );
    await survival.addEntry(
      aSurvivalEntry().forUser('2', 'bob').withDurationSeconds(60).withBoardsSolved(20).build(),
    );

    // Act
    const ranking = await useCase.execute({ durationSeconds: 120 });

    // Assert — la corrida de 60s (con más tableros) no contamina el ranking de 120s.
    expect(ranking).toHaveLength(1);
    expect(ranking[0].username.value).toBe('alice');
  });
});
