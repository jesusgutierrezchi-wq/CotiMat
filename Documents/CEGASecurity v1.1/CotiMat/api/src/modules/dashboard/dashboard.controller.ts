import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as dashboardService from "./dashboard.service";

export const getDashboardHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await dashboardService.getDashboardSummary());
});
