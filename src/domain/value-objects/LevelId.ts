import { ValidationError } from '../errors/DomainErrors';

export class LevelId {
  private constructor(public readonly value: string) {}

  static create(raw: string): LevelId {
    const v = (raw ?? '').trim();
    if (v.length === 0) {
      throw new ValidationError('LevelId: cannot be empty');
    }
    return new LevelId(v);
  }

  equals(other: LevelId): boolean {
    return this.value === other.value;
  }
}
