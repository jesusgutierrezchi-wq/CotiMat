import { Router } from "express";
import { adminRouter } from "./admin.routes";
import { publicRouter } from "./public.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok" }));
apiRouter.use("/public", publicRouter);
apiRouter.use("/admin", adminRouter);
