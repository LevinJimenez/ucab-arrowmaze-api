import { PrismaClient, Prisma } from '@prisma/client';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { EmailAlreadyRegisteredError, UsernameAlreadyTakenError } from '../../domain/errors/DomainErrors';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { Username } from '../../domain/value-objects/Username';
import { PasswordHash } from '../../domain/value-objects/PasswordHash';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: UserId): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id: id.value } });
    return record ? this.toEntity(record) : null;
  }

  public async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email: email.value } });
    return record ? this.toEntity(record) : null;
  }

  public async findByUsername(username: Username): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { username: username.value } });
    return record ? this.toEntity(record) : null;
  }

  public async create(user: User): Promise<User> {
    try {
      const record = await this.prisma.user.create({
        data: {
          id: user.id.value,
          username: user.username.value,
          email: user.email.value,
          passwordHash: user.passwordHash.value,
          createdAt: user.createdAt,
        },
      });
      return this.toEntity(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target.join(',') : String(target ?? '');
        if (fields.includes('email')) {
          throw new EmailAlreadyRegisteredError();
        }
        if (fields.includes('username')) {
          throw new UsernameAlreadyTakenError();
        }
      }
      throw error;
    }
  }

  public async update(user: User): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: user.id.value },
      data: {
        username: user.username.value,
        email: user.email.value,
      },
    });
    return this.toEntity(record);
  }

  private toEntity(record: UserRecord): User {
    return new User({
      id: UserId.create(record.id),
      username: Username.create(record.username),
      email: Email.create(record.email),
      passwordHash: PasswordHash.create(record.passwordHash),
      createdAt: record.createdAt,
    });
  }
}
