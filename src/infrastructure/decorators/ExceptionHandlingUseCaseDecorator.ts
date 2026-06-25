import { IUseCase } from '../../domain/interfaces/IUseCase';
import { ILogger } from '../../domain/interfaces/ILogger';

/**
 * Aspecto de Manejo Centralizado de Excepciones (AOP por Decorator).
 * Captura, registra y re-lanza la excepción de cualquier use case.
 */
export class ExceptionHandlingUseCaseDecorator<TInput, TOutput> implements IUseCase<TInput, TOutput> {
  constructor(
    private readonly inner: IUseCase<TInput, TOutput>,
    private readonly logger: ILogger,
    private readonly useCaseName: string,
  ) {}

  public async execute(input: TInput): Promise<TOutput> {
    try {
      return await this.inner.execute(input);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`[${this.useCaseName}] Failed`, {
        input,
        error: err.message,
        stack: err.stack,
      });
      throw err;
    }
  }
}
