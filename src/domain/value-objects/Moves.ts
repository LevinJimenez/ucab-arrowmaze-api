import { ValidationError } from '../errors/DomainErrors';

export class Moves {
  private constructor(public readonly value: number) {}

  static create(raw: number): Moves {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new ValidationError('Moves: must be an integer greater than or equal to 0');
    }
    return new Moves(raw);
  }

  equals(other: Moves): boolean {
    return this.value === other.value;
  }
}
