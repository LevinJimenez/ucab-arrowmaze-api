import { describe, it, expect } from 'vitest';
import { aLeaderboardEntry } from '../../builders/LeaderboardEntryBuilder';

describe('LeaderboardEntry', () => {
  it('should_create_valid_entry_when_all_invariants_met', () => {
    // Act
    const entry = aLeaderboardEntry().build();

    // Assert
    expect(entry.userId.value).toBe('user-1');
    expect(entry.levelId.value).toBe('level_1');
    expect(entry.score.value).toBe(900);
  });

  it('should_allow_zero_values_when_score_moves_and_time_are_zero', () => {
    // Arrange + Act
    const entry = aLeaderboardEntry().withScore(0).withMoves(0).withTimeSeconds(0).build();

    // Assert
    expect(entry.score.value).toBe(0);
    expect(entry.moves.value).toBe(0);
    expect(entry.timeSeconds.value).toBe(0);
  });
});
