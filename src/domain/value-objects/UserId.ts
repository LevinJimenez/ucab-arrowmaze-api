import { ValidationError } from '../errors/DomainErrors';

export class UserId {
  private constructor(public readonly value: string) {}

  static create(raw: string): UserId {
    const v = (raw ?? '').trim();
    if (v.length === 0) {
      throw new ValidationError('UserId: cannot be empty');
    }
    return new UserId(v);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
