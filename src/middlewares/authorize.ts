import { Request, Response, NextFunction } from "express";
import { Role } from "../types/domain";
import { ApiError } from "../utils/ApiError";


export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          `Access denied. Requires one of: ${allowedRoles.join(", ")}`
        )
      );
      return;
    }

    next();
  };
}