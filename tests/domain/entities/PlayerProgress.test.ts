import { describe, it, expect } from 'vitest';
import { LevelId } from '../../../src/domain/value-objects/LevelId';
import { aPlayerProgress } from '../../builders/PlayerProgressBuilder';

describe('PlayerProgress', () => {
  it('should_confirm_level_is_completed_when_it_is_in_completed_levels', () => {
    // Arrange
    const progress = aPlayerProgress().withCompletedLevels(['level_1', 'level_2']).build();

    // Act + Assert
    expect(progress.isLevelCompleted(LevelId.create('level_1'))).toBe(true);
  });

  it('should_deny_level_is_completed_when_it_is_not_in_completed_levels', () => {
    // Arrange
    const progress = aPlayerProgress().withCompletedLevels(['level_1']).build();

    // Act + Assert
    expect(progress.isLevelCompleted(LevelId.create('level_99'))).toBe(false);
  });

  it('should_return_best_score_when_level_has_been_scored', () => {
    // Arrange
    const progress = aPlayerProgress()
      .withBestScores(new Map([['level_1', 900]]))
      .build();

    // Act + Assert
    expect(progress.getBestScore(LevelId.create('level_1'))?.value).toBe(900);
  });

  it('should_return_undefined_when_level_has_no_score', () => {
    // Arrange
    const progress = aPlayerProgress()
      .withBestScores(new Map([['level_1', 900]]))
      .build();

    // Act + Assert
    expect(progress.getBestScore(LevelId.create('level_99'))).toBeUndefined();
  });
});
