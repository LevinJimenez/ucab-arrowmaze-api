import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

export interface TokenPayload {
  userId: string;
  username: string;
}

export class AuthFacade {
  public generateToken(userId: string, username: string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign({ userId, username }, env.JWT_SECRET, options);
  }

  public verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }
}
