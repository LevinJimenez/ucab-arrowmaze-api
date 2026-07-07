import { ValidationError } from '../errors/DomainErrors';

export type DifficultyValue = 'easy' | 'medium' | 'hard';

const VALID_VALUES: DifficultyValue[] = ['easy', 'medium', 'hard'];

export class Difficulty {
  private constructor(public readonly value: DifficultyValue) {}

  static create(raw: string): Difficulty {
    if (!VALID_VALUES.includes(raw as DifficultyValue)) {
      throw new ValidationError('Difficulty: must be "easy", "medium" or "hard"');
    }
    return new Difficulty(raw as DifficultyValue);
  }

  equals(other: Difficulty): boolean {
    return this.value === other.value;
  }
}
