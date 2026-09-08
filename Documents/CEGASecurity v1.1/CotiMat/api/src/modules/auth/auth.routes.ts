import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/auth.middleware";
import { loginRateLimiter } from "../../middlewares/rateLimit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { loginHandler, meHandler } from "./auth.controller";
import { loginSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/login", loginRateLimiter, validate(loginSchema), loginHandler);
authRouter.get("/me", requireAdminAuth, meHandler);
