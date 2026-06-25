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

export class AuthenticateUserUseCase implements IUseCase<AuthenticateUserInput, AuthenticateUserOutput> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordVerifier: IPasswordVerifier,
  ) {}

  public async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValid = await this.passwordVerifier.verify(input.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
