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
  timeSeconds = 30, rankedAt: Date = new Date('2026-01-01T00:00:00.000Z'),
): LeaderboardEntry =>
  new LeaderboardEntry({
    userId: UserId.create(userId),
    username: Username.create(username),
    levelId: LevelId.create(levelId),
    score: Score.create(score),
    moves: Moves.create(moves),
    timeSeconds: TimeSeconds.create(timeSeconds),
    rankedAt,
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

  it('should_return_only_the_best_mark_when_the_same_player_has_several_on_the_same_level', () => {
    // Arrange — el mismo jugador (dave) con 3 intentos en level_1, distinto score.
    const runs = [
      makeEntry('D', 'dave', 'level_1', 600, 10),
      makeEntry('D', 'dave', 'level_1', 950, 6),
      makeEntry('D', 'dave', 'level_1', 800, 8),
    ];

    // Act
    const result = strategy.calculateRanking(runs, 10);

    // Assert — una sola fila, la mejor de las tres.
    expect(result).toHaveLength(1);
    expect(result[0].score.value).toBe(950);
  });

  it('should_break_a_score_tie_by_lower_time_seconds', () => {
    // Arrange
    const slower = makeEntry('S', 'slow', 'level_1', 900, 5, 20);
    const faster = makeEntry('F', 'fast', 'level_1', 900, 5, 10);

    // Act
    const result = strategy.calculateRanking([slower, faster], 10);

    // Assert
    expect(result[0].username.value).toBe('fast');
    expect(result[1].username.value).toBe('slow');
  });

  it('should_break_a_score_and_time_tie_by_fewer_moves', () => {
    // Arrange
    const moreMoves = makeEntry('M', 'more', 'level_1', 900, 8, 15);
    const fewerMoves = makeEntry('L', 'fewer', 'level_1', 900, 3, 15);

    // Act
    const result = strategy.calculateRanking([moreMoves, fewerMoves], 10);

    // Assert
    expect(result[0].username.value).toBe('fewer');
    expect(result[1].username.value).toBe('more');
  });

  it('should_break_a_full_tie_by_earliest_rankedAt_regardless_of_input_order', () => {
    // Arrange — mismo score/tiempo/movimientos, distinto rankedAt.
    const earlier = makeEntry('E', 'earlier', 'level_1', 900, 5, 15, new Date('2026-01-01T00:00:00.000Z'));
    const later = makeEntry('L', 'later', 'level_1', 900, 5, 15, new Date('2026-01-02T00:00:00.000Z'));

    // Act — el orden de entrada no debe alterar el resultado (determinismo).
    const forward = strategy.calculateRanking([earlier, later], 10);
    const reversed = strategy.calculateRanking([later, earlier], 10);

    // Assert
    expect(forward[0].username.value).toBe('earlier');
    expect(forward[1].username.value).toBe('later');
    expect(reversed[0].username.value).toBe('earlier');
    expect(reversed[1].username.value).toBe('later');
  });

  it('should_keep_both_entries_when_the_same_player_appears_on_different_levels', () => {
    // Arrange
    const onLevel1 = makeEntry('P', 'pat', 'level_1', 900, 5);
    const onLevel2 = makeEntry('P', 'pat', 'level_2', 700, 5);

    // Act
    const result = strategy.calculateRanking([onLevel1, onLevel2], 10);

    // Assert — misma clave userId pero distinto levelId: sobreviven ambas.
    expect(result).toHaveLength(2);
  });

  // Caso de regresión observado en producción: el mismo usuario (zarah_) ocupaba
  // 4 puestos del top con 4 intentos del mismo nivel, y una marca de 00:04 quedó
  // en 5ta posición por detrás de marcas de 00:07 con el mismo score (el sort
  // original solo ordenaba por score, sin desempate por tiempo).
  it('should_produce_the_correct_ranking_for_the_production_regression_case', () => {
    // Arrange
    const runs = [
      makeEntry('zarah', 'zarah_', 'level_1', 1350, 6, 7),
      makeEntry('zarah', 'zarah_', 'level_1', 1350, 6, 5),
      makeEntry('zarah', 'zarah_', 'level_1', 1350, 6, 5),
      makeEntry('zarah', 'zarah_', 'level_1', 1350, 6, 4),
      makeEntry('alejandro', 'alejandro', 'level_1', 1350, 6, 7),
      makeEntry('levin', 'levin', 'level_1', 1050, 6, 11),
    ];

    // Act
    const result = strategy.calculateRanking(runs, 10);

    // Assert — zarah_ (00:04) 1°, alejandro 2°, levin 3°: 3 filas, no 6.
    expect(result).toHaveLength(3);
    expect(result[0].username.value).toBe('zarah_');
    expect(result[0].timeSeconds.value).toBe(4);
    expect(result[1].username.value).toBe('alejandro');
    expect(result[2].username.value).toBe('levin');
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

  it('should_deduplicate_by_player_and_level_keeping_the_highest_combined_score', () => {
    // Arrange — mismo jugador (dave), mismo nivel, dos intentos.
    const worse = makeEntry('D', 'dave', 'level_1', 600, 10); // combined=0.7*0.6+0.3*0.1=0.45
    const better = makeEntry('D', 'dave', 'level_1', 900, 5); // combined=0.7*0.9+0.3*0.2=0.69

    // Act
    const result = strategy.calculateRanking([worse, better], 10);

    // Assert — una sola fila, la del combinedScore más alto.
    expect(result).toHaveLength(1);
    expect(result[0].score.value).toBe(900);
  });
});
