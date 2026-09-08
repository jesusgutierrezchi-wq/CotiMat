import { Router } from "express";
import { createQuoteRateLimiter } from "../../middlewares/rateLimit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  addQuoteNoteHandler,
  changeQuoteStatusHandler,
  createQuoteHandler,
  downloadQuotePdfHandler,
  getQuoteAdminHandler,
  getQuoteByFolioHandler,
  getQuoteHistoryHandler,
  listQuotesAdminHandler,
} from "./quotes.controller";
import {
  addQuoteNoteSchema,
  adminListQuotesQuerySchema,
  changeQuoteStatusSchema,
  createQuoteSchema,
  publicQuoteHistoryQuerySchema,
} from "./quotes.schema";

export const publicQuotesRouter = Router();
publicQuotesRouter.post("/", createQuoteRateLimiter, validate(createQuoteSchema), createQuoteHandler);
publicQuotesRouter.get("/", validate(publicQuoteHistoryQuerySchema, "query"), getQuoteHistoryHandler);
publicQuotesRouter.get("/:folio", getQuoteByFolioHandler);
publicQuotesRouter.get("/:folio/pdf", downloadQuotePdfHandler);

export const adminQuotesRouter = Router();
adminQuotesRouter.get("/", validate(adminListQuotesQuerySchema, "query"), listQuotesAdminHandler);
adminQuotesRouter.get("/:id", getQuoteAdminHandler);
adminQuotesRouter.patch("/:id/status", validate(changeQuoteStatusSchema), changeQuoteStatusHandler);
adminQuotesRouter.post("/:id/notes", validate(addQuoteNoteSchema), addQuoteNoteHandler);
