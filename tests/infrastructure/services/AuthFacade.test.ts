import { describe, it, expect } from 'vitest';
import { AuthFacade } from '../../../src/infrastructure/services/AuthFacade';

describe('AuthFacade', () => {
  it('should_return_the_same_payload_when_verifying_a_token_it_generated', () => {
    // Arrange
    const facade = new AuthFacade();
    const token = facade.generateToken('user-1', 'player1');

    // Act
    const payload = facade.verifyToken(token);

    // Assert
    expect(payload.userId).toBe('user-1');
    expect(payload.username).toBe('player1');
  });

  it('should_throw_when_verifying_an_invalid_token', () => {
    // Arrange
    const facade = new AuthFacade();

    // Act + Assert
    expect(() => facade.verifyToken('token-invalido')).toThrow();
  });
});
