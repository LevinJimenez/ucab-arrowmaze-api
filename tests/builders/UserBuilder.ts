import { User, UserProps } from '../../src/domain/entities/User';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Email } from '../../src/domain/value-objects/Email';
import { Username } from '../../src/domain/value-objects/Username';
import { PasswordHash } from '../../src/domain/value-objects/PasswordHash';

interface RawUserProps {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class UserBuilder {
  private props: RawUserProps = {
    id: 'user-1',
    username: 'player1',
    email: 'player1@test.com',
    passwordHash: 'hashed::securePass123',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  public withId(id: string): this { this.props.id = id; return this; }
  public withUsername(username: string): this { this.props.username = username; return this; }
  public withEmail(email: string): this { this.props.email = email; return this; }
  public withPasswordHash(hash: string): this { this.props.passwordHash = hash; return this; }

  /** Props envueltas en VOs (el constructor de User ya no valida). */
  public buildProps(): UserProps {
    return {
      id: UserId.create(this.props.id),
      username: Username.create(this.props.username),
      email: Email.create(this.props.email),
      passwordHash: PasswordHash.create(this.props.passwordHash),
      createdAt: this.props.createdAt,
    };
  }

  public build(): User { return new User(this.buildProps()); }
}

export const aUser = (): UserBuilder => new UserBuilder();
