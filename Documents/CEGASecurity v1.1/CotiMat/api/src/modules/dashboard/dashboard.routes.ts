import { Router } from "express";
import { getDashboardHandler } from "./dashboard.controller";

export const adminDashboardRouter = Router();
adminDashboardRouter.get("/", getDashboardHandler);
