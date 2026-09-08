import { Prisma } from "@prisma/client";

/**
 * Prisma.Decimal serializa a string en JSON.stringify (vía su propio toJSON).
 * Esta app promete `number` en todo el contrato de la API (precios, totales,
 * cantidades), así que convertimos recursivamente cualquier Decimal a Number
 * antes de responder. Ver serializeDecimals.middleware.ts para dónde se aplica.
 */
export function serializeDecimals<T>(value: T): T {
  if (value instanceof Prisma.Decimal) {
    return Number(value) as unknown as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDecimals(item)) as unknown as T;
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeDecimals(val);
    }
    return result as T;
  }

  return value;
}
