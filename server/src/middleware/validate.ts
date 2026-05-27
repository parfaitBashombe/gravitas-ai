import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      res.status(400).json({ error: "Validation failed", details });
      return;
    }
    req[source] = result.data;
    next();
  };
