/**
 * Jerarquía de errores de dominio. Cada error porta su `statusCode` HTTP, de modo
 * que el errorHandler enruta por `instanceof DomainError` SIN comparar strings de
 * mensaje. Los tests afirman el TIPO de error (estable), no la redacción.
 */
export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Violación de una invariante de entidad o de validación de negocio (422). */
export class ValidationError extends DomainError {
  public readonly statusCode = 422;
}

/** Credenciales inválidas en autenticación (401). */
export class InvalidCredentialsError extends DomainError {
  public readonly statusCode = 401;

  constructor() {
    super('Invalid credentials');
  }
}

/** Email ya registrado al crear usuario (409). */
export class EmailAlreadyRegisteredError extends DomainError {
  public readonly statusCode = 409;

  constructor() {
    super('Email already registered');
  }
}

/** Username ya en uso al crear usuario (409). */
export class UsernameAlreadyTakenError extends DomainError {
  public readonly statusCode = 409;

  constructor() {
    super('Username already taken');
  }
}

/** Recurso no encontrado (404). */
export class NotFoundError extends DomainError {
  public readonly statusCode = 404;

  constructor(resource = 'Resource') {
    super(`${resource} not found`);
  }
}
