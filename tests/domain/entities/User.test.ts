import { describe, it, expect } from 'vitest';
import { User } from '../../../src/domain/entities/User';
import { ValidationError } from '../../../src/domain/errors/DomainErrors';
import { aUser } from '../../builders/UserBuilder';

describe('User', () => {
  it('should_create_valid_player_when_all_invariants_met', () => {
    // Act
    const user = aUser().build();

    // Assert
    expect(user.id).toBe('user-1');
    expect(user.username).toBe('player1');
    expect(user.email).toBe('player1@test.com');
  });

  it('should_reject_player_when_username_is_empty', () => {
    expect(() => new User(aUser().withUsername('   ').buildProps())).toThrow(ValidationError);
  });

  it('should_reject_player_when_email_is_invalid', () => {
    expect(() => new User(aUser().withEmail('invalid-email').buildProps())).toThrow(ValidationError);
  });

  it('should_reject_player_when_password_hash_is_empty', () => {
    expect(() => new User(aUser().withPasswordHash('').buildProps())).toThrow(ValidationError);
  });
});
