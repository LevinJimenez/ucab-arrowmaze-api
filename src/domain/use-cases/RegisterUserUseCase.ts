import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IIdGenerator } from '../interfaces/IIdGenerator';
import { IUseCase } from '../interfaces/IUseCase';
import { EmailAlreadyRegisteredError, UsernameAlreadyTakenError } from '../errors/DomainErrors';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Username } from '../value-objects/Username';
import { PasswordHash } from '../value-objects/PasswordHash';

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
    const email = Email.create(input.email);
    const username = Username.create(input.username);

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new EmailAlreadyRegisteredError();
    }

    const existingByUsername = await this.userRepository.findByUsername(username);
    if (existingByUsername) {
      throw new UsernameAlreadyTakenError();
    }

    const passwordHash = PasswordHash.create(await this.passwordHasher.hash(input.password));

    const user = new User({
      id: UserId.create(this.idGenerator.generate()),
      username,
      email,
      passwordHash,
      createdAt: new Date(),
    });

    const created = await this.userRepository.create(user);

    return {
      id: created.id.value,
      username: created.username.value,
      email: created.email.value,
    };
  }
}
