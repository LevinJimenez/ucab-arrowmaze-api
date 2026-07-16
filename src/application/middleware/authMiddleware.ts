import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ITokenService } from '../../domain/interfaces/ITokenService';

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export function createAuthMiddleware(tokenService: ITokenService): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = tokenService.verifyToken(token);
      (req as AuthRequest).userId = payload.userId;
      (req as AuthRequest).username = payload.username;
      next();
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };
}
