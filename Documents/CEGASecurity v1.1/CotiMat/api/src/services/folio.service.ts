import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Genera un folio único y consecutivo por año: "COT-2026-000123".
 *
 * Usa una fila contadora (`quote_folio_counters`) actualizada con un UPDATE
 * atómico dentro de la misma transacción que crea la cotización, para que dos
 * solicitudes concurrentes nunca reciban el mismo número (evita condiciones de
 * carrera de un simple "SELECT max + 1").
 */
export async function generateFolio(tx: Prisma.TransactionClient | PrismaClient): Promise<string> {
  const year = new Date().getFullYear();

  await tx.quoteFolioCounter.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  const counter = await tx.quoteFolioCounter.findUniqueOrThrow({ where: { year } });

  return `COT-${year}-${String(counter.lastNumber).padStart(6, "0")}`;
}
