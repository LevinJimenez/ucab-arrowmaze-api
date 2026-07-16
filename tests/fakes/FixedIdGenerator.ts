import { IIdGenerator } from '../../src/domain/interfaces/IIdGenerator';

/** IdGenerator determinista: hace predecible la salida del use case. */
export class FixedIdGenerator implements IIdGenerator {
  private counter = 0;

  constructor(private readonly prefix = 'id') {}

  public generate(): string {
    this.counter += 1;
    return `${this.prefix}-${this.counter}`;
  }
}
