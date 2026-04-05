import { Response } from "express";

interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    meta?: Record<string, unknown>,
    statusCode = 200
  ): Response {
    const body: ApiResponseBody<T> = { success: true, message };
    if (data !== undefined) body.data = data;
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.success(res, message, data, undefined, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(res: Response, statusCode: number, message: string): Response {
    return res.status(statusCode).json({ success: false, message });
  }
}