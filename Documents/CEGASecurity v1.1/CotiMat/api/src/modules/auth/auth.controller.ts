import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const admin = await authService.getAdminById(req.admin!.sub);
  res.json(admin);
});
