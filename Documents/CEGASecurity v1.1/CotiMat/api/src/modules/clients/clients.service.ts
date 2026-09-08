import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { RegisterClientInput } from "./clients.schema";

// Idempotente: si el teléfono ya existe, actualiza los datos opcionales provistos
// y devuelve el registro existente en vez de fallar por duplicado.
export async function registerOrUpdateClient(input: RegisterClientInput) {
  const { phone, name, email, address } = input;

  return prisma.client.upsert({
    where: { phone },
    create: { phone, name, email: email || undefined, address },
    update: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(address ? { address } : {}),
    },
  });
}

export async function findClientByPhone(phone: string) {
  const client = await prisma.client.findUnique({ where: { phone } });
  if (!client) {
    throw AppError.notFound("No existe un cliente registrado con ese teléfono");
  }
  return client;
}

export async function listClients(params: { search?: string; page: number; pageSize: number }) {
  const where = params.search
    ? {
        OR: [
          { phone: { contains: params.search, mode: "insensitive" as const } },
          { name: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    throw AppError.notFound("Cliente no encontrado");
  }
  return client;
}
