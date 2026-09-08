import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { imageUpload } from "../uploads/upload.middleware";
import {
  createMaterialHandler,
  deleteMaterialHandler,
  getMaterialHandler,
  listMaterialsHandler,
  updateMaterialHandler,
  uploadMaterialImageHandler,
} from "./materials.controller";
import {
  adminListMaterialsQuerySchema,
  createMaterialSchema,
  listMaterialsQuerySchema,
  updateMaterialSchema,
} from "./materials.schema";

export const publicMaterialsRouter = Router();
publicMaterialsRouter.get("/", validate(listMaterialsQuerySchema, "query"), listMaterialsHandler);
publicMaterialsRouter.get("/:id", getMaterialHandler);

export const adminMaterialsRouter = Router();
adminMaterialsRouter.get("/", validate(adminListMaterialsQuerySchema, "query"), listMaterialsHandler);
adminMaterialsRouter.get("/:id", getMaterialHandler);
adminMaterialsRouter.post("/", validate(createMaterialSchema), createMaterialHandler);
adminMaterialsRouter.put("/:id", validate(updateMaterialSchema), updateMaterialHandler);
adminMaterialsRouter.delete("/:id", deleteMaterialHandler);
adminMaterialsRouter.post("/:id/image", imageUpload.single("image"), uploadMaterialImageHandler);
