import { describe, it, expect } from 'vitest';
import { aSurvivalEntry } from '../../builders/SurvivalEntryBuilder';

describe('SurvivalEntry', () => {
  it('should_create_valid_entry_when_all_fields_are_provided', () => {
    // Act
    const entry = aSurvivalEntry().build();

    // Assert
    expect(entry.userId.value).toBe('user-1');
    expect(entry.username.value).toBe('player1');
    expect(entry.boardsSolved.value).toBe(7);
    expect(entry.durationSeconds.value).toBe(120);
    expect(entry.totalScore?.value).toBe(4200);
  });

  it('should_allow_an_entry_without_total_score', () => {
    // Act
    const entry = aSurvivalEntry().withTotalScore(undefined).build();

    // Assert
    expect(entry.totalScore).toBeUndefined();
  });

  it('should_allow_zero_boards_solved', () => {
    // Act
    const entry = aSurvivalEntry().withBoardsSolved(0).build();

    // Assert
    expect(entry.boardsSolved.value).toBe(0);
  });
});
