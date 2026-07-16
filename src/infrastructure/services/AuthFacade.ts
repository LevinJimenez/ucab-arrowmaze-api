import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { ITokenService, TokenPayload } from '../../domain/interfaces/ITokenService';

export class AuthFacade implements ITokenService {
  public generateToken(userId: string, username: string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign({ userId, username }, env.JWT_SECRET, options);
  }

  public verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }
}
