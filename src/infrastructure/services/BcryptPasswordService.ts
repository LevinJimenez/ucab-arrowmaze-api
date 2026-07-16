import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../domain/use-cases/RegisterUserUseCase';
import { IPasswordVerifier } from '../../domain/use-cases/AuthenticateUserUseCase';

export class BcryptPasswordService implements IPasswordHasher, IPasswordVerifier {
  private readonly saltRounds = 10;

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
