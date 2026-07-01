import { describe, it, expect, vi, afterEach } from 'vitest';
import { ConsoleLogger } from '../../../src/infrastructure/services/ConsoleLogger';

// ConsoleLogger ES un adaptador de logging: invocar console.* con el mensaje
// formateado ES el comportamiento observable (excepción documentada al Pilar 1).
describe('ConsoleLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should_call_console_log_when_info_is_invoked', () => {
    // Arrange
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    // Act
    logger.info('hello');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should_call_console_warn_when_warn_is_invoked', () => {
    // Arrange
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    // Act
    logger.warn('careful');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should_call_console_error_when_error_is_invoked', () => {
    // Arrange
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    // Act
    logger.error('boom');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should_call_console_debug_when_debug_is_invoked', () => {
    // Arrange
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    // Act
    logger.debug('trace');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
