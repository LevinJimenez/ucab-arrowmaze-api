import { ValidationError } from '../errors/DomainErrors';

/** Duración en segundos de una corrida de modo Supervivencia (p. ej. 60/120/180). */
export class Duration {
  private constructor(public readonly value: number) {}

  static create(raw: number): Duration {
    if (!Number.isInteger(raw) || raw <= 0) {
      throw new ValidationError('Duration: must be an integer greater than 0');
    }
    return new Duration(raw);
  }

  equals(other: Duration): boolean {
    return this.value === other.value;
  }
}
