import { User } from '../../src/domain/entities/User';
import { IUserRepository } from '../../src/domain/interfaces/IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  public async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email === email) ?? null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.username === username) ?? null;
  }

  public async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  public async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  /** Helper de inspección de estado (solo tests). */
  public count(): number {
    return this.users.size;
  }
}
