import type { NextFunction, Request, Response } from "express";
import { serializeDecimals } from "../utils/serializeDecimals";

export function serializeDecimalsMiddleware(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => originalJson(serializeDecimals(body))) as typeof res.json;
  next();
}
