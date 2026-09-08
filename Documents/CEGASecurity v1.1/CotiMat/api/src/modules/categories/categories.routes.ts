import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from "./categories.controller";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";

export const publicCategoriesRouter = Router();
publicCategoriesRouter.get("/", listCategoriesHandler);

export const adminCategoriesRouter = Router();
adminCategoriesRouter.get("/", listCategoriesHandler);
adminCategoriesRouter.post("/", validate(createCategorySchema), createCategoryHandler);
adminCategoriesRouter.put("/:id", validate(updateCategorySchema), updateCategoryHandler);
adminCategoriesRouter.delete("/:id", deleteCategoryHandler);
