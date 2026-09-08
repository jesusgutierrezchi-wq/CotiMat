import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { storageService } from "../uploads/storage.service";
import * as materialsService from "./materials.service";

export const listMaterialsHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await materialsService.listMaterials(req.query as never));
});

export const getMaterialHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await materialsService.getMaterialById(req.params.id));
});

export const createMaterialHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await materialsService.createMaterial(req.body));
});

export const updateMaterialHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await materialsService.updateMaterial(req.params.id, req.body));
});

export const deleteMaterialHandler = asyncHandler(async (req: Request, res: Response) => {
  await materialsService.deleteMaterial(req.params.id);
  res.status(204).send();
});

export const uploadMaterialImageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw AppError.badRequest("No se recibió ningún archivo de imagen");
  }
  const imageUrl = await storageService.saveImage(req.file.originalname, req.file.buffer);
  res.json(await materialsService.setMaterialImage(req.params.id, imageUrl));
});
