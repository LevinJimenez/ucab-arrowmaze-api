import { ValidationError } from '../errors/DomainErrors';

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const v = (raw ?? '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      throw new ValidationError('Email: invalid format');
    }
    return new Email(v);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
