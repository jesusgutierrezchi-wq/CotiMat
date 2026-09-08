import { z } from "zod";

export const materialUnitEnum = z.enum(["PIEZA", "M2", "M3", "KG", "SACO", "LITRO", "TONELADA"]);

export const createMaterialSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  unit: materialUnitEnum,
  unitPrice: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().optional(),
  active: z.coerce.boolean().optional().default(true),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const listMaterialsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

export const adminListMaterialsQuerySchema = listMaterialsQuerySchema.extend({
  includeInactive: z.coerce.boolean().optional().default(false),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
