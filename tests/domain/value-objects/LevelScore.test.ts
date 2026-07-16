import { describe, it, expect } from 'vitest';
import { LevelScore } from '../../../src/domain/value-objects/LevelScore';
import { LevelId } from '../../../src/domain/value-objects/LevelId';
import { Score } from '../../../src/domain/value-objects/Score';

describe('LevelScore', () => {
  it('should_create_when_level_id_and_score_are_valid', () => {
    // Act
    const levelScore = LevelScore.create(LevelId.create('level_1'), Score.create(900));

    // Assert
    expect(levelScore.levelId.value).toBe('level_1');
    expect(levelScore.score.value).toBe(900);
  });

  it('should_consider_equal_level_and_score_equal', () => {
    // Arrange
    const a = LevelScore.create(LevelId.create('level_1'), Score.create(900));
    const b = LevelScore.create(LevelId.create('level_1'), Score.create(900));

    // Act + Assert
    expect(a.equals(b)).toBe(true);
  });

  it('should_consider_different_level_or_score_not_equal', () => {
    // Arrange
    const a = LevelScore.create(LevelId.create('level_1'), Score.create(900));
    const differentLevel = LevelScore.create(LevelId.create('level_2'), Score.create(900));
    const differentScore = LevelScore.create(LevelId.create('level_1'), Score.create(800));

    // Act + Assert
    expect(a.equals(differentLevel)).toBe(false);
    expect(a.equals(differentScore)).toBe(false);
  });
});
