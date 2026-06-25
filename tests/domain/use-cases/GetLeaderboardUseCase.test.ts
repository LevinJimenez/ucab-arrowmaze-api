import { describe, it, expect, beforeEach } from 'vitest';
import { GetLeaderboardUseCase } from '../../../src/domain/use-cases/GetLeaderboardUseCase';
import { ILeaderboardStrategy } from '../../../src/domain/interfaces/ILeaderboardStrategy';
import { LeaderboardEntry } from '../../../src/domain/entities/LeaderboardEntry';
import { InMemoryLeaderboardRepository } from '../../fakes/InMemoryLeaderboardRepository';
import { aLeaderboardEntry } from '../../builders/LeaderboardEntryBuilder';

// Implementación REAL (no mock) de la estrategia: las concretas viven en infra
// (FASE 5); aquí basta una real, pura y determinista para verificar el use case.
class SortByScoreStrategy implements ILeaderboardStrategy {
  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    return [...entries].sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

describe('GetLeaderboardUseCase', () => {
  let leaderboard: InMemoryLeaderboardRepository;
  let useCase: GetLeaderboardUseCase;

  beforeEach(() => {
    leaderboard = new InMemoryLeaderboardRepository();
    useCase = new GetLeaderboardUseCase(leaderboard, new SortByScoreStrategy());
  });

  it('should_return_top_players_sorted_by_score_when_limit_is_provided', async () => {
    // Arrange
    await leaderboard.addEntry(aLeaderboardEntry().forUser('1', 'alice').withScore(900).build());
    await leaderboard.addEntry(aLeaderboardEntry().forUser('2', 'bob').withScore(800).build());
    await leaderboard.addEntry(aLeaderboardEntry().forUser('3', 'carol').withScore(700).build());

    // Act
    const ranking = await useCase.execute({ levelId: 'level_1', limit: 2 });

    // Assert — salida observable, sin espiar la estrategia.
    expect(ranking).toHaveLength(2);
    expect(ranking[0].username).toBe('alice');
    expect(ranking[1].username).toBe('bob');
  });

  it('should_return_at_most_ten_players_when_limit_is_not_specified', async () => {
    // Arrange
    for (let i = 0; i < 15; i += 1) {
      await leaderboard.addEntry(aLeaderboardEntry().forUser(`u${i}`, `p${i}`).withScore(i).build());
    }

    // Act
    const ranking = await useCase.execute({ levelId: 'level_1' });

    // Assert — el límite por defecto (10) se observa por la SALIDA.
    expect(ranking).toHaveLength(10);
    expect(ranking[0].score).toBe(14);
  });
});
