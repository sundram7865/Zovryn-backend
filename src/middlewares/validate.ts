import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

type ValidationTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      next(ApiError.badRequest(`Validation error — ${messages}`));
      return;
    }

    // Replace with parsed + coerced values
    if (target === "body") req.body = result.data;
    else if (target === "query") req.query = result.data as typeof req.query;
    else if (target === "params") req.params = result.data as typeof req.params;

    next();
  };
}