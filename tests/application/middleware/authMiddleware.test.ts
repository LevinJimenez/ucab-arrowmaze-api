import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { authMiddleware, AuthRequest } from '../../../src/application/middleware/authMiddleware';
import { env } from '../../../src/config/env';

const makeRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('should_attach_player_identity_and_continue_when_token_is_valid', () => {
    // Arrange
    const token = jwt.sign({ userId: 'user-1', username: 'player1' }, env.JWT_SECRET);
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
});
