import { PrismaClient, Prisma } from '@prisma/client';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { EmailAlreadyRegisteredError, UsernameAlreadyTakenError } from '../../domain/errors/DomainErrors';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toEntity(record) : null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { username } });
    return record ? this.toEntity(record) : null;
  }

  public async create(user: User): Promise<User> {
    try {
      const record = await this.prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
        },
      });
      return this.toEntity(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0];
        if (field === 'email') {
          throw new EmailAlreadyRegisteredError();
        }
        if (field === 'username') {
          throw new UsernameAlreadyTakenError();
        }
      }
      throw error;
    }
  }

  public async update(user: User): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        email: user.email,
      },
    });
    return this.toEntity(record);
  }

  private toEntity(record: UserRecord): User {
    return new User({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
    });
  }
}
