import { ValidationError } from '../errors/DomainErrors';

export class Score {
  private constructor(public readonly value: number) {}

  static create(raw: number): Score {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new ValidationError('Score: must be an integer greater than or equal to 0');
    }
    return new Score(raw);
  }

  equals(other: Score): boolean {
    return this.value === other.value;
  }
}
