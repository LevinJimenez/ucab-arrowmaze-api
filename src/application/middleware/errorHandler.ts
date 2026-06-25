import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/DomainErrors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  console.error(`[Error] ${err.message}`, err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
