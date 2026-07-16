import { describe, it, expect, beforeEach } from 'vitest';
import { SubmitSurvivalRunUseCase } from '../../../src/domain/use-cases/SubmitSurvivalRunUseCase';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';
import { InMemorySurvivalRepository } from '../../fakes/InMemorySurvivalRepository';
import { Duration } from '../../../src/domain/value-objects/Duration';

describe('SubmitSurvivalRunUseCase', () => {
  let survival: InMemorySurvivalRepository;
  let useCase: SubmitSurvivalRunUseCase;

  const baseInput = {
    userId: 'user-1',
    username: 'player1',
    boardsSolved: 7,
    durationSeconds: 120,
  };

  beforeEach(() => {
    survival = new InMemorySurvivalRepository();
    useCase = new SubmitSurvivalRunUseCase(survival);
  });

  it('should_persist_the_run_when_data_is_valid', async () => {
    // Arrange + Act
    const result = await useCase.execute(baseInput);

    // Assert — estado leído del fake, no interacciones espiadas.
    expect(result.boardsSolved.value).toBe(7);
    expect(result.durationSeconds.value).toBe(120);
    const stored = await survival.getTop(Duration.create(120), 10);
    expect(stored).toHaveLength(1);
    expect(stored[0].username.value).toBe('player1');
  });

  it('should_persist_the_run_with_total_score_when_provided', async () => {
    // Arrange + Act
    const result = await useCase.execute({ ...baseInput, totalScore: 4200 });

    // Assert
    expect(result.totalScore?.value).toBe(4200);
  });

  it('should_persist_the_run_without_total_score_when_not_provided', async () => {
    // Arrange + Act
    const result = await useCase.execute(baseInput);

    // Assert
    expect(result.totalScore).toBeUndefined();
  });

  it('should_reject_the_run_when_boards_solved_is_negative', async () => {
    await expect(
      useCase.execute({ ...baseInput, boardsSolved: -1 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should_reject_the_run_when_duration_seconds_is_zero_or_negative', async () => {
    await expect(
      useCase.execute({ ...baseInput, durationSeconds: 0 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
