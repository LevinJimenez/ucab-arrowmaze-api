import { describe, it, expect } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';
import { PostgresUserRepository } from '../../../src/infrastructure/repositories/PostgresUserRepository';
import { EmailAlreadyRegisteredError, UsernameAlreadyTakenError } from '../../../src/domain/errors/DomainErrors';
import { aUser } from '../../builders/UserBuilder';

function makeP2002(target: string[] | string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target },
  });
}

function makePrismaStub(error: Prisma.PrismaClientKnownRequestError): PrismaClient {
  return {
    user: { create: () => Promise.reject(error) },
  } as unknown as PrismaClient;
}

describe('PostgresUserRepository — P2002 error translation contract', () => {
  it('should_translate_P2002_to_EmailAlreadyRegistered_when_target_is_array', async () => {
    // Arrange
    const repo = new PostgresUserRepository(makePrismaStub(makeP2002(['email'])));

    // Act + Assert
    await expect(repo.create(aUser().build())).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  // Prisma puede reportar el nombre de la constraint (string) en vez del array de
  // campos según el adaptador/driver; este caso no lo produce la integración real
  // con Postgres, pero el mapeo debe seguir siendo correcto.
  it('should_translate_P2002_to_UsernameAlreadyTaken_when_target_is_constraint_name_string', async () => {
    // Arrange
    const repo = new PostgresUserRepository(makePrismaStub(makeP2002('users_username_key')));

    // Act + Assert
    await expect(repo.create(aUser().build())).rejects.toBeInstanceOf(UsernameAlreadyTakenError);
  });
});
