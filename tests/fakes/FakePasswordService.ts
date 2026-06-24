import { IPasswordHasher } from '../../src/domain/use-cases/RegisterUserUseCase';
import { IPasswordVerifier } from '../../src/domain/use-cases/AuthenticateUserUseCase';

/**
 * Hash determinista y reversible para tests: `hashed::<password>`.
 * Permite afirmar por ESTADO que la contraseña se cifró (hash != texto plano)
 * sin espiar llamadas. Rápido: sin bcrypt (respeta Fast Feedback).
 */
export class FakePasswordService implements IPasswordHasher, IPasswordVerifier {
  public async hash(password: string): Promise<string> {
    return `hashed::${password}`;
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return hash === `hashed::${password}`;
  }
}
