import { ILogger } from '../../domain/interfaces/ILogger';

export class ConsoleLogger implements ILogger {
  public info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[INFO] ${new Date().toISOString()} — ${message}`, meta ?? '');
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${new Date().toISOString()} — ${message}`, meta ?? '');
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${new Date().toISOString()} — ${message}`, meta ?? '');
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${new Date().toISOString()} — ${message}`, meta ?? '');
  }
}
