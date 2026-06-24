import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateUserUseCase } from '../../../src/domain/use-cases/AuthenticateUserUseCase';
import { InvalidCredentialsError } from '../../../src/domain/errors/DomainErrors';
import { InMemoryUserRepository } from '../../fakes/InMemoryUserRepository';
import { FakePasswordService } from '../../fakes/FakePasswordService';
import { aUser } from '../../builders/UserBuilder';

describe('AuthenticateUserUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: AuthenticateUserUseCase;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    useCase = new AuthenticateUserUseCase(users, new FakePasswordService());
    // Un jugador cuya contraseña 'correctPass' está cifrada por el fake.
    await users.create(
      aUser().withId('user-1').withEmail('player1@test.com').withPasswordHash('hashed::correctPass').build(),
    );
  });

  it('should_authenticate_player_when_credentials_are_valid', async () => {
    // Arrange + Act
    const result = await useCase.execute({ email: 'player1@test.com', password: 'correctPass' });

    // Assert
    expect(result.userId).toBe('user-1');
    expect(result.username).toBe('player1');
  });

  it('should_reject_authentication_when_email_is_unknown', async () => {
    await expect(
      useCase.execute({ email: 'unknown@test.com', password: 'whatever' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should_reject_authentication_when_password_is_wrong', async () => {
    await expect(
      useCase.execute({ email: 'player1@test.com', password: 'wrongPass' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
