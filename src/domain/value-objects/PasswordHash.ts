import { ValidationError } from '../errors/DomainErrors';

export class PasswordHash {
  private constructor(public readonly value: string) {}

  static create(raw: string): PasswordHash {
    if (!raw || raw.length === 0) {
      throw new ValidationError('PasswordHash: cannot be empty');
    }
    return new PasswordHash(raw);
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }
}
