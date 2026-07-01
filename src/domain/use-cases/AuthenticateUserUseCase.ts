import { IUserRepository } from '../interfaces/IUserRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { InvalidCredentialsError } from '../errors/DomainErrors';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthenticateUserOutput {
  userId: string;
  username: string;
  email: string;
}

export interface IPasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}

// Hash opaco que nunca coincide. Verificar contra él cuando el usuario NO existe
// mantiene el tiempo de respuesta ~constante, para que no revele si un email está
// registrado (mitiga la enumeración de usuarios). No es lógica bcrypt: es un literal.
const DUMMY_PASSWORD_HASH = '$2b$10$6chFXPkpuSi3D3Xh6s3.4.bDka7jkPq2XoGOz83PaOKKXttrfmqGO';

export class AuthenticateUserUseCase implements IUseCase<AuthenticateUserInput, AuthenticateUserOutput> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordVerifier: IPasswordVerifier,
  ) {}

  public async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    const isValid = await this.passwordVerifier.verify(
      input.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !isValid) {
      throw new InvalidCredentialsError();
    }

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
