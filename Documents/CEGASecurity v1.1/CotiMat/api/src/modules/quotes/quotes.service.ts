import type { Prisma, QuoteStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { notificationService } from "../../services/notification.service";
import { generateFolio } from "../../services/folio.service";
import { AppError } from "../../utils/AppError";
import { registerOrUpdateClient } from "../clients/clients.service";
import type { CreateQuoteInput } from "./quotes.schema";

const quoteDetailInclude = {
  client: true,
  items: { include: { material: { include: { category: true } } } },
  notes: { include: { author: { select: { id: true, username: true } } }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.QuoteInclude;

export async function createQuote(input: CreateQuoteInput) {
  const client = await registerOrUpdateClient({
    phone: input.clientPhone,
    name: input.clientName,
  });

  const materials = await prisma.material.findMany({
    where: { id: { in: input.items.map((item) => item.materialId) }, active: true },
  });

  if (materials.length !== new Set(input.items.map((i) => i.materialId)).size) {
    throw AppError.badRequest("Uno o más materiales seleccionados ya no están disponibles");
  }

  const materialsById = new Map(materials.map((m) => [m.id, m]));

  const itemsToCreate = input.items.map((item) => {
    const material = materialsById.get(item.materialId)!;
    const unitPrice = Number(material.unitPrice);
    const subtotal = Number((unitPrice * item.quantity).toFixed(2));
    return {
      materialId: material.id,
      quantity: item.quantity,
      unitPriceAtTime: unitPrice,
      subtotal,
    };
  });

  const total = Number(itemsToCreate.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

  const quote = await prisma.$transaction(async (tx) => {
    const folio = await generateFolio(tx);
    return tx.quote.create({
      data: {
        folio,
        clientId: client.id,
        total,
        items: { create: itemsToCreate },
      },
      include: quoteDetailInclude,
    });
  });

  await notificationService.notifyNewQuote({
    folio: quote.folio,
    clientPhone: client.phone,
    clientName: client.name,
    total,
  });

  return quote;
}

export async function getQuoteByFolio(folio: string) {
  const quote = await prisma.quote.findUnique({
    where: { folio },
    include: { client: true, items: { include: { material: { include: { category: true } } } } },
  });
  if (!quote) {
    throw AppError.notFound("No existe una cotización con ese folio");
  }
  return quote;
}

export async function getQuoteHistoryByPhone(phone: string) {
  return prisma.quote.findMany({
    where: { client: { phone } },
    include: { items: { include: { material: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuoteById(id: string) {
  const quote = await prisma.quote.findUnique({ where: { id }, include: quoteDetailInclude });
  if (!quote) {
    throw AppError.notFound("Cotización no encontrada");
  }
  return quote;
}

interface AdminListQuotesParams {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page: number;
  pageSize: number;
}

export async function listQuotesForAdmin(params: AdminListQuotesParams) {
  const where: Prisma.QuoteWhereInput = {
    ...(params.status ? { status: params.status as QuoteStatus } : {}),
    ...(params.dateFrom || params.dateTo
      ? {
          createdAt: {
            ...(params.dateFrom ? { gte: params.dateFrom } : {}),
            ...(params.dateTo ? { lte: params.dateTo } : {}),
          },
        }
      : {}),
    ...(params.search
      ? {
          client: {
            OR: [
              { phone: { contains: params.search, mode: "insensitive" } },
              { name: { contains: params.search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.quote.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function changeQuoteStatus(
  id: string,
  status: string,
  note: string | undefined,
  authorId: string
) {
  const quote = await getQuoteById(id);

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.quote.update({
      where: { id },
      data: { status: status as QuoteStatus },
      include: quoteDetailInclude,
    });
    await tx.quoteNote.create({
      data: {
        quoteId: id,
        authorId,
        statusAtNote: status as QuoteStatus,
        note: note?.trim() || `Estatus cambiado a ${status}`,
      },
    });
    return result;
  });

  await notificationService.notifyStatusChange({
    folio: quote.folio,
    clientPhone: quote.client.phone,
    newStatus: status,
    note,
  });

  return getQuoteById(updated.id);
}

export async function addQuoteNote(id: string, note: string, authorId: string) {
  const quote = await getQuoteById(id);
  await prisma.quoteNote.create({
    data: { quoteId: id, authorId, note, statusAtNote: quote.status },
  });
  return getQuoteById(id);
}
