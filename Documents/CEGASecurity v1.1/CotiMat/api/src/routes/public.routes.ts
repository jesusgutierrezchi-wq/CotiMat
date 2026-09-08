import { Router } from "express";
import { publicRateLimiter } from "../middlewares/rateLimit.middleware";
import { publicCategoriesRouter } from "../modules/categories/categories.routes";
import { publicClientsRouter } from "../modules/clients/clients.routes";
import { publicMaterialsRouter } from "../modules/materials/materials.routes";
import { publicQuotesRouter } from "../modules/quotes/quotes.routes";

export const publicRouter = Router();

publicRouter.use(publicRateLimiter);
publicRouter.use("/categories", publicCategoriesRouter);
publicRouter.use("/materials", publicMaterialsRouter);
publicRouter.use("/clients", publicClientsRouter);
publicRouter.use("/quotes", publicQuotesRouter);
