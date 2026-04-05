import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../types/common";
import { Role } from "../types/domain";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(ApiError.unauthorized("No token provided"));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role as Role,
      isActive: decoded.isActive,
    };

    if (!req.user.isActive) {
      next(ApiError.forbidden("Your account has been deactivated"));
      return;
    }

    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}