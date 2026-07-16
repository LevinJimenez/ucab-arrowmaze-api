export interface TokenPayload {
  userId: string;
  username: string;
}

export interface ITokenService {
  generateToken(userId: string, username: string): string;
  verifyToken(token: string): TokenPayload;
}
