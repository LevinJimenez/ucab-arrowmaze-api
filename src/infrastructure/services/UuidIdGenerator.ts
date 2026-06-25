import { randomUUID } from 'crypto';
import { IIdGenerator } from '../../domain/interfaces/IIdGenerator';

export class UuidIdGenerator implements IIdGenerator {
  public generate(): string {
    return randomUUID();
  }
}
