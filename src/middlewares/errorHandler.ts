import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Operational errors — known, expected
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.nodeEnv === "development" && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint violation
  if (
    err instanceof Error &&
    "code" in err &&
    (err as NodeJS.ErrnoException).code === "P2002"
  ) {
    res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
    return;
  }

  // Unknown / programming errors
  console.error("💥 Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    ...(env.nodeEnv === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
}