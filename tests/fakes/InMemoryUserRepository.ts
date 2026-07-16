import { User } from '../../src/domain/entities/User';
import { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Email } from '../../src/domain/value-objects/Email';
import { Username } from '../../src/domain/value-objects/Username';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  public async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.value) ?? null;
  }

  public async findByEmail(email: Email): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email.equals(email)) ?? null;
  }

  public async findByUsername(username: Username): Promise<User | null> {
    return [...this.users.values()].find((u) => u.username.equals(username)) ?? null;
  }

  public async create(user: User): Promise<User> {
    this.users.set(user.id.value, user);
    return user;
  }

  public async update(user: User): Promise<User> {
    this.users.set(user.id.value, user);
    return user;
  }

  /** Helper de inspección de estado (solo tests). */
  public count(): number {
    return this.users.size;
  }
}
