import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { CreateCategoryInput } from "./categories.schema";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { name: input.name } });
  if (existing) {
    throw AppError.conflict("Ya existe una categoría con ese nombre");
  }
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: CreateCategoryInput) {
  await getCategoryOrThrow(id);
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  await getCategoryOrThrow(id);
  const materialCount = await prisma.material.count({ where: { categoryId: id } });
  if (materialCount > 0) {
    throw AppError.conflict("No se puede eliminar: hay materiales asignados a esta categoría");
  }
  await prisma.category.delete({ where: { id } });
}

async function getCategoryOrThrow(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw AppError.notFound("Categoría no encontrada");
  }
  return category;
}
