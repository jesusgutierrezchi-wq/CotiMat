import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { CreateMaterialInput, UpdateMaterialInput } from "./materials.schema";

interface ListMaterialsParams {
  category?: string;
  search?: string;
  page: number;
  pageSize: number;
  includeInactive?: boolean;
}

export async function listMaterials(params: ListMaterialsParams) {
  const where = {
    ...(params.includeInactive ? {} : { active: true }),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.search
      ? { name: { contains: params.search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.material.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.material.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getMaterialById(id: string) {
  const material = await prisma.material.findUnique({ where: { id }, include: { category: true } });
  if (!material) {
    throw AppError.notFound("Material no encontrado");
  }
  return material;
}

export async function createMaterial(input: CreateMaterialInput) {
  await assertCategoryExists(input.categoryId);
  return prisma.material.create({ data: input, include: { category: true } });
}

export async function updateMaterial(id: string, input: UpdateMaterialInput) {
  await getMaterialById(id);
  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }
  return prisma.material.update({ where: { id }, data: input, include: { category: true } });
}

export async function setMaterialImage(id: string, imageUrl: string) {
  await getMaterialById(id);
  return prisma.material.update({ where: { id }, data: { imageUrl }, include: { category: true } });
}

export async function deleteMaterial(id: string) {
  await getMaterialById(id);
  // Soft delete: preserva integridad referencial con cotizaciones históricas.
  return prisma.material.update({ where: { id }, data: { active: false } });
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw AppError.badRequest("La categoría indicada no existe");
  }
}
