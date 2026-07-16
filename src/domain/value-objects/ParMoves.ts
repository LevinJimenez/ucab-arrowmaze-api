import { ValidationError } from '../errors/DomainErrors';

export class ParMoves {
  private constructor(public readonly value: number) {}

  static create(raw: number): ParMoves {
    if (!Number.isInteger(raw) || raw <= 0) {
      throw new ValidationError('ParMoves: must be an integer greater than 0');
    }
    return new ParMoves(raw);
  }

  equals(other: ParMoves): boolean {
    return this.value === other.value;
  }
}
