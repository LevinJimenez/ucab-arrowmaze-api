import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export class ResponseFactory {
  static success<T>(res: Response, data: T, statusCode = 200): void {
    const body: ApiResponse<T> = { success: true, data };
    res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T): void {
    ResponseFactory.success(res, data, 201);
  }

  static error(res: Response, message: string, statusCode = 400): void {
    const body: ApiResponse<null> = { success: false, message };
    res.status(statusCode).json(body);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): void {
    const body: ApiResponse<T[]> = {
      success: true,
      data,
      meta: { total, page, limit },
    };
    res.status(200).json(body);
  }
}
