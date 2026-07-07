import { ValidationError } from '../errors/DomainErrors';

export class Username {
  private constructor(public readonly value: string) {}

  static create(raw: string): Username {
    const v = (raw ?? '').trim();
    if (v.length < 3 || v.length > 30) {
      throw new ValidationError('Username: must be between 3 and 30 characters');
    }
    return new Username(v);
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
