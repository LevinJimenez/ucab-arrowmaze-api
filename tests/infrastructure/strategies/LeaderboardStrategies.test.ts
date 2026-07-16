import { describe, it, expect } from 'vitest';
import { TotalScoreLeaderboardStrategy } from '../../../src/infrastructure/strategies/TotalScoreLeaderboardStrategy';
import { PerLevelLeaderboardStrategy } from '../../../src/infrastructure/strategies/PerLevelLeaderboardStrategy';
import { CombinedLeaderboardStrategy } from '../../../src/infrastructure/strategies/CombinedLeaderboardStrategy';
import { LeaderboardEntry } from '../../../src/domain/entities/LeaderboardEntry';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Username } from '../../../src/domain/value-objects/Username';
import { LevelId } from '../../../src/domain/value-objects/LevelId';
import { Score } from '../../../src/domain/value-objects/Score';
import { Moves } from '../../../src/domain/value-objects/Moves';
import { TimeSeconds } from '../../../src/domain/value-objects/TimeSeconds';

const makeEntry = (
  userId: string, username: string, levelId: string,
  score: number, moves: number,
): LeaderboardEntry =>
  new LeaderboardEntry({
    userId: UserId.create(userId),
    username: Username.create(username),
    levelId: LevelId.create(levelId),
    score: Score.create(score),
    moves: Moves.create(moves),
    timeSeconds: TimeSeconds.create(30),
    rankedAt: new Date(),
  });

// alice: level_1 score=900 moves=5 | level_2 score=850 moves=4
// bob:   level_1 score=800 moves=6
// carol: level_1 score=700 moves=7
const entries: LeaderboardEntry[] = [
  makeEntry('1', 'alice', 'level_1', 900, 5),
  makeEntry('2', 'bob',   'level_1', 800, 6),
  makeEntry('3', 'carol', 'level_1', 700, 7),
  makeEntry('1', 'alice', 'level_2', 850, 4),
];

describe('PerLevelLeaderboardStrategy', () => {
  const strategy = new PerLevelLeaderboardStrategy();

  it('should_return_all_entries_sorted_by_score_descending_when_limit_exceeds_count', () => {
    // Arrange + Act
    const result = strategy.calculateRanking(entries, 10);

    // Assert — orden completo verificado, no solo la primera posición
    expect(result).toHaveLength(4);
    expect(result[0].score.value).toBe(900);
    expect(result[1].score.value).toBe(850);
    expect(result[2].score.value).toBe(800);
    expect(result[3].score.value).toBe(700);
  });

  it('should_return_only_top_n_entries_when_limit_is_smaller_than_count', () => {
    // Arrange + Act
    const result = strategy.calculateRanking(entries, 2);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].score.value).toBe(900);
    expect(result[1].score.value).toBe(850);
  });

  it('should_not_mutate_the_original_entries_array', () => {
    // Arrange
    const original = [...entries];

    // Act
    strategy.calculateRanking(entries, 10);

    // Assert
    expect(entries[0].score.value).toBe(original[0].score.value);
  });
});

describe('TotalScoreLeaderboardStrategy', () => {
  const strategy = new TotalScoreLeaderboardStrategy();

  it('should_aggregate_scores_per_user_and_rank_in_descending_total_order', () => {
    // alice: 900+850=1750 | bob: 800 | carol: 700
    const result = strategy.calculateRanking(entries, 10);

    // Assert — orden completo: alice(1750) > bob(800) > carol(700)
    expect(result).toHaveLength(3);
    expect(result[0].username.value).toBe('alice');
    expect(result[1].username.value).toBe('bob');
    expect(result[2].username.value).toBe('carol');
  });

  it('should_return_single_user_when_limit_is_one', () => {
    // Arrange + Act
    const result = strategy.calculateRanking(entries, 1);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].username.value).toBe('alice');
  });

  it('should_return_empty_array_when_no_entries_provided', () => {
    // Arrange + Act
    const result = strategy.calculateRanking([], 10);

    // Assert
    expect(result).toHaveLength(0);
  });
});

describe('CombinedLeaderboardStrategy', () => {
  const strategy = new CombinedLeaderboardStrategy();

  // Cálculos de combined score (0.7*score/1000 + 0.3*1/moves):
  //   alice/level_1: 0.7*0.90 + 0.3*0.200 = 0.63+0.06 = 0.690  → 1°
  //   alice/level_2: 0.7*0.85 + 0.3*0.250 = 0.595+0.075 = 0.670 → 2°
  //   bob:           0.7*0.80 + 0.3*0.167 = 0.56+0.05 = 0.610   → 3°
  //   carol:         0.7*0.70 + 0.3*0.143 = 0.49+0.043 = 0.533  → 4°
  it('should_rank_entries_by_weighted_score_and_efficiency_in_full_order', () => {
    // Arrange + Act
    const result = strategy.calculateRanking(entries, 10);

    // Assert — orden completo verificado con la fórmula ponderada
    expect(result).toHaveLength(4);
    expect(result[0].username.value).toBe('alice');
    expect(result[0].levelId.value).toBe('level_1');
    expect(result[1].username.value).toBe('alice');
    expect(result[1].levelId.value).toBe('level_2');
    expect(result[2].username.value).toBe('bob');
    expect(result[3].username.value).toBe('carol');
  });

  it('should_favour_fewer_moves_over_more_moves_when_scores_are_close', () => {
    // Arrange: misma puntuación bruta, alice tiene menos movimientos → debe quedar primera
    const a = makeEntry('A', 'alice', 'level_1', 800, 3);
    const b = makeEntry('B', 'bob',   'level_1', 800, 10);

    // Act
    const result = strategy.calculateRanking([b, a], 10);

    // Assert
    expect(result[0].username.value).toBe('alice');
    expect(result[1].username.value).toBe('bob');
  });

  it('should_respect_limit_when_limit_is_smaller_than_count', () => {
    // Arrange + Act
    const result = strategy.calculateRanking(entries, 2);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].username.value).toBe('alice');
    expect(result[0].levelId.value).toBe('level_1');
  });

  it('should_assign_zero_efficiency_when_entry_has_zero_moves', () => {
    // Arrange: moves=0 activa la rama `efficiency = 0` en la fórmula
    const zeroMoves = makeEntry('Z', 'zero', 'level_1', 900, 0);
    const normal    = makeEntry('A', 'alice', 'level_1', 100, 1);

    // Act
    const result = strategy.calculateRanking([zeroMoves, normal], 10);

    // Assert: zero (combined=0.7*0.9+0=0.63) > alice (combined=0.7*0.1+0.3*1=0.37)
    expect(result[0].username.value).toBe('zero');
    expect(result[1].username.value).toBe('alice');
  });
});
