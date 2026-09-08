import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export interface AdminJwtPayload {
  sub: string;
  username: string;
  role: "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

export function requireAdminAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Falta el token de autenticación");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
    req.admin = payload;
    next();
  } catch {
    throw AppError.unauthorized("Token inválido o expirado");
  }
}
