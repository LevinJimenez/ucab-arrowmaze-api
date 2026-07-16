import { ValidationError } from '../errors/DomainErrors';

export class BoardsSolved {
  private constructor(public readonly value: number) {}

  static create(raw: number): BoardsSolved {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new ValidationError('BoardsSolved: must be an integer greater than or equal to 0');
    }
    return new BoardsSolved(raw);
  }

  equals(other: BoardsSolved): boolean {
    return this.value === other.value;
  }
}
