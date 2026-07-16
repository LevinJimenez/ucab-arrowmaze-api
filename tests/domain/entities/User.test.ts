import { describe, it, expect } from 'vitest';
import { aUser } from '../../builders/UserBuilder';

describe('User', () => {
  it('should_create_valid_player_when_all_invariants_met', () => {
    // Act
    const user = aUser().build();

    // Assert
    expect(user.id.value).toBe('user-1');
    expect(user.username.value).toBe('player1');
    expect(user.email.value).toBe('player1@test.com');
  });
});
