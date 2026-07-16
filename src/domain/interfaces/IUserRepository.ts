import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Username } from '../value-objects/Username';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
