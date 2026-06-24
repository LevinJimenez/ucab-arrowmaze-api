import { ValidationError } from '../errors/DomainErrors';

export interface UserProps {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    if (!props.username || props.username.trim().length === 0) {
      throw new ValidationError('Username cannot be empty');
    }
    if (!props.email || !props.email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }
    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      throw new ValidationError('Password hash cannot be empty');
    }

    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }
}
