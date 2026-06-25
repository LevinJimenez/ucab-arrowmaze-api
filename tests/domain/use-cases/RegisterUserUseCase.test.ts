import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../src/domain/use-cases/RegisterUserUseCase';
import { EmailAlreadyRegisteredError, UsernameAlreadyTakenError } from '../../../src/domain/errors/DomainErrors';
import { InMemoryUserRepository } from '../../fakes/InMemoryUserRepository';
import { FakePasswordService } from '../../fakes/FakePasswordService';
import { FixedIdGenerator } from '../../fakes/FixedIdGenerator';
import { aUser } from '../../builders/UserBuilder';

describe('RegisterUserUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new RegisterUserUseCase(users, new FakePasswordService(), new FixedIdGenerator('user'));
  });

  it('should_register_player_with_ciphered_password_when_data_is_valid', async () => {
    // Arrange
    const input = { username: 'player1', email: 'player1@test.com', password: 'securePass123' };

    // Act
    const registered = await useCase.execute(input);

    // Assert — comportamiento observable leído por ESTADO: el jugador queda
    // persistido y su contraseña NO se guarda en claro (sin espiar `hash`).
    const stored = await users.findByEmail('player1@test.com');
    expect(registered.username).toBe('player1');
    expect(stored).not.toBeNull();
    expect(stored?.passwordHash).not.toBe('securePass123');
    expect(stored?.passwordHash).toBe('hashed::securePass123');
  });

  it('should_reject_registration_when_email_already_registered', async () => {
    // Arrange
    await users.create(aUser().withEmail('player1@test.com').withUsername('existing').build());

    // Act + Assert — se afirma el TIPO de error, no la redacción del mensaje.
    await expect(
      useCase.execute({ username: 'player2', email: 'player1@test.com', password: 'pass' }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  it('should_reject_registration_when_username_already_taken', async () => {
    // Arrange
    await users.create(aUser().withUsername('player1').withEmail('other@test.com').build());

    // Act + Assert
    await expect(
      useCase.execute({ username: 'player1', email: 'new@test.com', password: 'pass' }),
    ).rejects.toBeInstanceOf(UsernameAlreadyTakenError);
  });
});
