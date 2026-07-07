import { ValidationError } from '../errors/DomainErrors';

export class TimeSeconds {
  private constructor(public readonly value: number) {}

  static create(raw: number): TimeSeconds {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new ValidationError('TimeSeconds: must be an integer greater than or equal to 0');
    }
    return new TimeSeconds(raw);
  }

  equals(other: TimeSeconds): boolean {
    return this.value === other.value;
  }
}
