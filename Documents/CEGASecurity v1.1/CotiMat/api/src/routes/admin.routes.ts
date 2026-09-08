import { Router } from "express";
import { requireAdminAuth } from "../middlewares/auth.middleware";
import { authRouter } from "../modules/auth/auth.routes";
import { adminCategoriesRouter } from "../modules/categories/categories.routes";
import { adminClientsRouter } from "../modules/clients/clients.routes";
import { adminDashboardRouter } from "../modules/dashboard/dashboard.routes";
import { adminMaterialsRouter } from "../modules/materials/materials.routes";
import { adminQuotesRouter } from "../modules/quotes/quotes.routes";

export const adminRouter = Router();

// /api/admin/auth/* queda público (login) — el resto exige JWT.
adminRouter.use("/auth", authRouter);

adminRouter.use(requireAdminAuth);
adminRouter.use("/dashboard", adminDashboardRouter);
adminRouter.use("/categories", adminCategoriesRouter);
adminRouter.use("/materials", adminMaterialsRouter);
adminRouter.use("/clients", adminClientsRouter);
adminRouter.use("/quotes", adminQuotesRouter);
