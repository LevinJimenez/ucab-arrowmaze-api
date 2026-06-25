import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IIdGenerator } from '../interfaces/IIdGenerator';
import { IUseCase } from '../interfaces/IUseCase';
import { EmailAlreadyRegisteredError, UsernameAlreadyTakenError } from '../errors/DomainErrors';

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  id: string;
  username: string;
  email: string;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export class RegisterUserUseCase implements IUseCase<RegisterUserInput, RegisterUserOutput> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  public async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail) {
      throw new EmailAlreadyRegisteredError();
    }

    const existingByUsername = await this.userRepository.findByUsername(input.username);
    if (existingByUsername) {
      throw new UsernameAlreadyTakenError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = new User({
      id: this.idGenerator.generate(),
      username: input.username,
      email: input.email,
      passwordHash,
      createdAt: new Date(),
    });

    const created = await this.userRepository.create(user);

    return {
      id: created.id,
      username: created.username,
      email: created.email,
    };
  }
}
