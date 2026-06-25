import { describe, it, expect } from 'vitest';
import { LeaderboardEntry } from '../../../src/domain/entities/LeaderboardEntry';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';
import { aLeaderboardEntry } from '../../builders/LeaderboardEntryBuilder';

describe('LeaderboardEntry', () => {
  it('should_create_valid_entry_when_all_invariants_met', () => {
    // Act
    const entry = aLeaderboardEntry().build();

    // Assert
    expect(entry.userId).toBe('user-1');
    expect(entry.levelId).toBe('level_1');
    expect(entry.score).toBe(900);
  });

  it('should_reject_entry_when_score_is_negative', () => {
    expect(() => new LeaderboardEntry(aLeaderboardEntry().withScore(-1).buildProps())).toThrow(ValidationError);
  });

  it('should_reject_entry_when_moves_is_negative', () => {
    expect(() => new LeaderboardEntry(aLeaderboardEntry().withMoves(-1).buildProps())).toThrow(ValidationError);
  });

  it('should_reject_entry_when_time_is_negative', () => {
    expect(() => new LeaderboardEntry(aLeaderboardEntry().withTimeSeconds(-1).buildProps())).toThrow(ValidationError);
  });

  it('should_allow_zero_values_when_score_moves_and_time_are_zero', () => {
    // Arrange + Act
    const entry = aLeaderboardEntry().withScore(0).withMoves(0).withTimeSeconds(0).build();

    // Assert
    expect(entry.score).toBe(0);
    expect(entry.moves).toBe(0);
    expect(entry.timeSeconds).toBe(0);
  });
});
