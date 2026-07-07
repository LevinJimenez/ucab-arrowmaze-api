import { describe, it, expect } from 'vitest';
import { LeaderboardMapper } from '../../../src/application/mappers/LeaderboardMapper';
import { ProgressMapper } from '../../../src/application/mappers/ProgressMapper';
import { LevelMapper } from '../../../src/application/mappers/LevelMapper';
import { PlayerProgress } from '../../../src/domain/entities/PlayerProgress';
import { LevelDefinition } from '../../../src/domain/entities/LevelDefinition';
import { aLeaderboardEntry } from '../../builders/LeaderboardEntryBuilder';
import { aLevel } from '../../builders/LevelDefinitionBuilder';
import { aPlayerProgress } from '../../builders/PlayerProgressBuilder';

describe('LeaderboardMapper', () => {
  it('should_expose_ranked_at_as_iso_string_when_mapping_entry', () => {
    // Arrange
    const entry = aLeaderboardEntry().withScore(900).build();

    // Act
    const dto = LeaderboardMapper.toDto(entry);

    // Assert
    expect(dto.score).toBe(900);
    expect(dto.rankedAt).toBe(entry.rankedAt.toISOString());
  });
});

describe('ProgressMapper', () => {
  it('should_expose_best_scores_as_plain_object_when_mapping_progress', () => {
    // Arrange
    const progress = aPlayerProgress()
      .withUserId('user-1')
      .withCompletedLevels(['level_1'])
      .withBestScores(new Map([['level_1', 900]]))
      .withCurrentLevelId('level_2')
      .build();

    // Act
    const dto = ProgressMapper.toDto(progress);

    // Assert
    expect(dto.bestScores).toEqual({ level_1: 900 });
    expect(dto.currentLevelId).toBe('level_2');
  });

  it('should_expose_empty_object_when_progress_has_no_best_scores', () => {
    // Arrange
    const progress = aPlayerProgress()
      .withUserId('user-1')
      .withCompletedLevels([])
      .withBestScores(new Map())
      .withCurrentLevelId('level_1')
      .build();

    // Act
    const dto = ProgressMapper.toDto(progress);

    // Assert
    expect(dto.bestScores).toEqual({});
  });
});

describe('LevelMapper', () => {
  it('should_preserve_opaque_level_data_when_mapping_level', () => {
    // Arrange
    const level = aLevel().withId('level_heart').build();

    // Act
    const dto = LevelMapper.toDto(level);

    // Assert
    expect(dto.id).toBe('level_heart');
    expect(dto.data.arrows).toHaveLength(1);
  });

  it('should_map_level_without_par_moves_when_not_provided', () => {
    // Arrange
    const props = aLevel().buildProps();
    delete props.parMoves;
    const level = new LevelDefinition(props);

    // Act
    const dto = LevelMapper.toDto(level);

    // Assert
    expect(dto.parMoves).toBeUndefined();
  });
});
