import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { errorHandler } from '../../../src/application/middleware/errorHandler';
import {
  InvalidCredentialsError,
  EmailAlreadyRegisteredError,
  NotFoundError,
  ValidationError,
  UsernameAlreadyTakenError,
} from '../../../src/domain/errors/DomainErrors';

const makeRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  it('should_respond_401_when_credentials_are_invalid', () => {
    // Arrange
    const res = makeRes();

    // Act
    errorHandler(new InvalidCredentialsError(), {} as Request, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should_respond_409_when_email_already_registered', () => {
    // Arrange
    const res = makeRes();

    // Act
    errorHandler(new EmailAlreadyRegisteredError(), {} as Request, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('should_respond_404_when_resource_not_found', () => {
    // Arrange
    const res = makeRes();

    // Act
    errorHandler(new NotFoundError('Level'), {} as Request, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should_respond_500_when_error_is_unexpected', () => {
    // Arrange
    const res = makeRes();

    // Act
    errorHandler(new Error('boom'), {} as Request, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should_respond_422_when_validation_fails', () => {
    // Arrange
    const res = makeRes();

    // Act
    errorHandler(new ValidationError('Invalid input'), {} as Request, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should_respond_409_when_username_already_taken', () => {
    // Arrange
    const res = makeRes();

    // Act
    errorHandler(new UsernameAlreadyTakenError(), {} as Request, res, vi.fn());

    // Assert
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
