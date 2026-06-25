import { IUseCase } from '../../domain/interfaces/IUseCase';
import { ILogger } from '../../domain/interfaces/ILogger';

/**
 * Aspecto de Caché de Resultados (AOP por Decorator).
 * Memoriza la salida del use case por `ttlMs`, usando una clave derivada del input.
 */
export class CachingUseCaseDecorator<TInput, TOutput> implements IUseCase<TInput, TOutput> {
  private readonly cache = new Map<string, { value: TOutput; expiresAt: number }>();

  constructor(
    private readonly inner: IUseCase<TInput, TOutput>,
    private readonly ttlMs: number,
    private readonly keyFor: (input: TInput) => string,
    private readonly logger: ILogger,
  ) {}

  public async execute(input: TInput): Promise<TOutput> {
    const key = this.keyFor(input);
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > now) {
      this.logger.debug(`[Cache] HIT ${key}`);
      return cached.value;
    }

    const value = await this.inner.execute(input);
    this.cache.set(key, { value, expiresAt: now + this.ttlMs });
    this.logger.debug(`[Cache] MISS ${key}`);
    return value;
  }
}
