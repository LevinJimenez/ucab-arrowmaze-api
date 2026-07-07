import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Username } from '../value-objects/Username';
import { PasswordHash } from '../value-objects/PasswordHash';

export interface UserProps {
  id: UserId;
  username: Username;
  email: Email;
  passwordHash: PasswordHash;
  createdAt: Date;
}

export class User {
  public readonly id: UserId;
  public readonly username: Username;
  public readonly email: Email;
  public readonly passwordHash: PasswordHash;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }
}
