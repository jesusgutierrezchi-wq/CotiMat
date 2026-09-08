import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as categoriesService from "./categories.service";

export const listCategoriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await categoriesService.listCategories());
});

export const createCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await categoriesService.createCategory(req.body));
});

export const updateCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await categoriesService.updateCategory(req.params.id, req.body));
});

export const deleteCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.deleteCategory(req.params.id);
  res.status(204).send();
});
