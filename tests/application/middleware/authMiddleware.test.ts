import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import { createAuthMiddleware, AuthRequest } from '../../../src/application/middleware/authMiddleware';
import { AuthFacade } from '../../../src/infrastructure/services/AuthFacade';

const makeRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const tokenService = new AuthFacade();
const authMiddleware = createAuthMiddleware(tokenService);

describe('authMiddleware', () => {
  it('should_attach_player_identity_and_continue_when_token_is_valid', () => {
    // Arrange
    const token = tokenService.generateToken('user-1', 'player1');
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const next = vi.fn();

    // Act
    authMiddleware(req, makeRes(), next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe('user-1');
    expect(req.username).toBe('player1');
  });

  it('should_reject_with_401_when_authorization_header_is_missing', () => {
    // Arrange
    const req = { headers: {} } as AuthRequest;
    const res = makeRes();

    // Act
    authMiddleware(req, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should_reject_with_401_when_token_is_invalid', () => {
    // Arrange
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as AuthRequest;
    const res = makeRes();

    // Act
    authMiddleware(req, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should_reject_with_401_when_scheme_is_not_bearer', () => {
    // Arrange
    const req = { headers: { authorization: 'Basic x' } } as AuthRequest;
    const res = makeRes();

    // Act
    authMiddleware(req, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should_reject_with_401_when_bearer_token_is_empty', () => {
    // Arrange
    const req = { headers: { authorization: 'Bearer ' } } as AuthRequest;
    const res = makeRes();

    // Act
    authMiddleware(req, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
