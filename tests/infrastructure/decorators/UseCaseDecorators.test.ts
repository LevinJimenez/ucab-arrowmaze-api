import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoggingUseCaseDecorator } from '../../../src/infrastructure/decorators/LoggingUseCaseDecorator';
import { ExceptionHandlingUseCaseDecorator } from '../../../src/infrastructure/decorators/ExceptionHandlingUseCaseDecorator';
import { CachingUseCaseDecorator } from '../../../src/infrastructure/decorators/CachingUseCaseDecorator';
import { IUseCase } from '../../../src/domain/interfaces/IUseCase';
import { ILogger } from '../../../src/domain/interfaces/ILogger';

const makeLogger = (): ILogger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
});

class EchoUseCase implements IUseCase<string, string> {
  public async execute(input: string): Promise<string> {
    return `processed: ${input}`;
  }
}

class FailingUseCase implements IUseCase<string, string> {
  public async execute(): Promise<string> {
    throw new Error('Test error');
  }
}

describe('LoggingUseCaseDecorator', () => {
  let logger: ILogger;

  beforeEach(() => {
    logger = makeLogger();
  });

  it('should_log_entry_and_exit_when_use_case_executes', async () => {
    // Arrange
    const decorated = new LoggingUseCaseDecorator(new EchoUseCase(), logger, 'EchoUseCase');

    // Act
    const result = await decorated.execute('test');

    // Assert — la emisión del log ES el comportamiento del aspecto (excepción al Pilar 1).
    expect(result).toBe('processed: test');
    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenNthCalledWith(1, expect.stringContaining('Executing'), expect.any(Object));
  });
});

describe('ExceptionHandlingUseCaseDecorator', () => {
  let logger: ILogger;

  beforeEach(() => {
    logger = makeLogger();
  });

  it('should_pass_through_when_inner_succeeds', async () => {
    // Arrange
    const decorated = new ExceptionHandlingUseCaseDecorator(new EchoUseCase(), logger, 'EchoUseCase');

    // Act
    const result = await decorated.execute('ok');

    // Assert
    expect(result).toBe('processed: ok');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should_log_and_rethrow_when_inner_throws', async () => {
    // Arrange
    const decorated = new ExceptionHandlingUseCaseDecorator(new FailingUseCase(), logger, 'FailingUseCase');

    // Act + Assert — el re-lanzamiento y el log son el comportamiento del aspecto.
    await expect(decorated.execute('test')).rejects.toThrow('Test error');
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      expect.objectContaining({ error: 'Test error' }),
    );
  });

  it('should_wrap_non_error_throws_and_log_them', async () => {
    // Arrange — cubre la rama `error instanceof Error ? error : new Error(String(error))`
    const nonErrorThrower: IUseCase<string, string> = {
      execute: vi.fn().mockRejectedValue('raw string error'),
    };
    const decorated = new ExceptionHandlingUseCaseDecorator(nonErrorThrower, logger, 'NonError');

    // Act + Assert
    await expect(decorated.execute('x')).rejects.toThrow('raw string error');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      expect.objectContaining({ error: 'raw string error' }),
    );
  });
});

describe('CachingUseCaseDecorator', () => {
  let logger: ILogger;

  beforeEach(() => {
    logger = makeLogger();
  });

  it('should_serve_cached_result_without_recomputing_when_called_within_ttl', async () => {
    // Arrange
    const inner: IUseCase<string, string> = { execute: vi.fn().mockResolvedValue('value') };
    const decorated = new CachingUseCaseDecorator(inner, 10_000, (i) => i, logger);

    // Act
    const first = await decorated.execute('key1');
    const second = await decorated.execute('key1');

    // Assert — NO delegar en un HIT ES el comportamiento del caché (excepción al Pilar 1).
    expect(first).toBe('value');
    expect(second).toBe('value');
    expect(inner.execute).toHaveBeenCalledTimes(1);
  });

  it('should_recompute_when_cache_key_differs', async () => {
    // Arrange
    const inner: IUseCase<string, string> = { execute: vi.fn().mockResolvedValue('value') };
    const decorated = new CachingUseCaseDecorator(inner, 10_000, (i) => i, logger);

    // Act
    await decorated.execute('key1');
    await decorated.execute('key2');

    // Assert
    expect(inner.execute).toHaveBeenCalledTimes(2);
  });

  it('should_recompute_when_entry_expires_after_ttl', async () => {
    // Arrange
    vi.useFakeTimers();
    const inner: IUseCase<string, string> = { execute: vi.fn().mockResolvedValue('value') };
    const decorated = new CachingUseCaseDecorator(inner, 1_000, (i) => i, logger);

    // Act
    await decorated.execute('key1');     // MISS → puebla el caché
    vi.advanceTimersByTime(1_001);       // el TTL expira
    await decorated.execute('key1');     // debe volver a delegar al inner

    // Assert — re-delegación tras TTL ES el comportamiento del caché (excepción al Pilar 1).
    expect(inner.execute).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
