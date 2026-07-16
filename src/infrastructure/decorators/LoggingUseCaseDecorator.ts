import { IUseCase } from '../../domain/interfaces/IUseCase';
import { ILogger } from '../../domain/interfaces/ILogger';
import { redactSensitive } from './redactSensitive';

/**
 * Aspecto de Logging/Trazabilidad (AOP por Decorator).
 * Registra entrada, salida y duración de cualquier use case sin tocar su lógica.
 */
export class LoggingUseCaseDecorator<TInput, TOutput> implements IUseCase<TInput, TOutput> {
  constructor(
    private readonly inner: IUseCase<TInput, TOutput>,
    private readonly logger: ILogger,
    private readonly useCaseName: string,
  ) {}

  public async execute(input: TInput): Promise<TOutput> {
    const start = Date.now();
    this.logger.info(`[${this.useCaseName}] Executing`, { input: redactSensitive(input) });

    const result = await this.inner.execute(input);

    const duration = Date.now() - start;
    this.logger.info(`[${this.useCaseName}] Completed in ${duration}ms`, { result: redactSensitive(result) });

    return result;
  }
}
