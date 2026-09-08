import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type ValidationTarget = "body" | "query" | "params";

// Valida req[target] contra un schema zod y reemplaza el objeto con la versión
// parseada (con defaults/coerciones aplicadas). Errores los captura error.middleware.
export const validate = (schema: ZodSchema, target: ValidationTarget = "body") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[target]);
    (req as unknown as Record<ValidationTarget, unknown>)[target] = parsed;
    next();
  };
};
