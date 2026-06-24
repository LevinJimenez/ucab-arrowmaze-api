import { User, UserProps } from '../../src/domain/entities/User';

export class UserBuilder {
  private props: UserProps = {
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

  /** Props crudas (para invariantes que esperan que el constructor lance). */
  public buildProps(): UserProps { return { ...this.props }; }
  public build(): User { return new User(this.buildProps()); }
}

export const aUser = (): UserBuilder => new UserBuilder();
