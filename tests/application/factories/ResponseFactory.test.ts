import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import { ResponseFactory } from '../../../src/application/factories/ResponseFactory';

const makeRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// ResponseFactory ES un formateador de respuesta HTTP: la invocación de
// res.status().json() con la forma esperada ES el comportamiento observable.
describe('ResponseFactory', () => {
  it('should_respond_200_with_success_body_when_success_is_called', () => {
    // Arrange
    const res = makeRes();

    // Act
    ResponseFactory.success(res, { id: '1' });

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
  });

  it('should_respond_201_when_created_is_called', () => {
    // Arrange
    const res = makeRes();

    // Act
    ResponseFactory.created(res, { id: '1' });

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
  });

  it('should_respond_with_given_status_and_message_when_error_is_called', () => {
    // Arrange
    const res = makeRes();

    // Act
    ResponseFactory.error(res, 'Not found', 404);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
  });

  it('should_include_pagination_meta_when_paginated_is_called', () => {
    // Arrange
    const res = makeRes();

    // Act
    ResponseFactory.paginated(res, [{ id: '1' }], 42, 2, 10);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: '1' }],
      meta: { total: 42, page: 2, limit: 10 },
    });
  });
});
