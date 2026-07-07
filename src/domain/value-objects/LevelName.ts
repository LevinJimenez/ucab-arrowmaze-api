import { ValidationError } from '../errors/DomainErrors';

export class LevelName {
  private constructor(public readonly value: string) {}

  static create(raw: string): LevelName {
    const v = (raw ?? '').trim();
    if (v.length === 0) {
      throw new ValidationError('LevelName: cannot be empty');
    }
    return new LevelName(v);
  }

  equals(other: LevelName): boolean {
    return this.value === other.value;
  }
}
