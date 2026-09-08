import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { getClientHandler, listClientsHandler, registerClientHandler } from "./clients.controller";
import { listClientsQuerySchema, registerClientSchema } from "./clients.schema";

export const publicClientsRouter = Router();
publicClientsRouter.post("/", validate(registerClientSchema), registerClientHandler);

export const adminClientsRouter = Router();
adminClientsRouter.get("/", validate(listClientsQuerySchema, "query"), listClientsHandler);
adminClientsRouter.get("/:id", getClientHandler);
