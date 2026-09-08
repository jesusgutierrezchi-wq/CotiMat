import { QuoteStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const STATUS_ORDER: QuoteStatus[] = [
  "PENDIENTE",
  "EN_SEGUIMIENTO",
  "APROBADA",
  "RECHAZADA",
  "CONVERTIDA",
];

const TREND_DAYS = 30;
const TOP_MATERIALS_LIMIT = 6;
const RECENT_QUOTES_LIMIT = 6;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getTotals() {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = new Date(thisMonthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const [quotesAllTime, quotesThisMonth, quotesLastMonth, amountAgg, convertedCount] =
    await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.quote.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.quote.aggregate({ _sum: { total: true } }),
      prisma.quote.count({ where: { status: "CONVERTIDA" } }),
    ]);

  return {
    quotesAllTime,
    quotesThisMonth,
    quotesLastMonth,
    totalQuotedAmount: Number(amountAgg._sum.total ?? 0),
    conversionRate: quotesAllTime > 0 ? convertedCount / quotesAllTime : 0,
  };
}

async function getStatusBreakdown() {
  const grouped = await prisma.quote.groupBy({ by: ["status"], _count: true });
  const countByStatus = new Map(grouped.map((g) => [g.status, g._count]));
  return STATUS_ORDER.map((status) => ({ status, count: countByStatus.get(status) ?? 0 }));
}

async function getQuotesByDay() {
  const since = new Date();
  since.setDate(since.getDate() - (TREND_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const quotes = await prisma.quote.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const countByDay = new Map<string, number>();
  for (const quote of quotes) {
    const key = toDateKey(quote.createdAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = toDateKey(day);
    days.push({ date: key, count: countByDay.get(key) ?? 0 });
  }
  return days;
}

async function getTopMaterials() {
  const grouped = await prisma.quoteItem.groupBy({
    by: ["materialId"],
    _count: true,
    orderBy: { _count: { materialId: "desc" } },
    take: TOP_MATERIALS_LIMIT,
  });

  if (grouped.length === 0) return [];

  const materials = await prisma.material.findMany({
    where: { id: { in: grouped.map((g) => g.materialId) } },
    select: { id: true, name: true, unit: true },
  });
  const materialById = new Map(materials.map((m) => [m.id, m]));

  return grouped
    .map((g) => {
      const material = materialById.get(g.materialId);
      if (!material) return null;
      return { materialId: g.materialId, name: material.name, unit: material.unit, timesQuoted: g._count };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

async function getRecentQuotes() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: RECENT_QUOTES_LIMIT,
    include: { client: true },
  });

  return quotes.map((q) => ({
    id: q.id,
    folio: q.folio,
    clientName: q.client.name,
    clientPhone: q.client.phone,
    total: Number(q.total),
    status: q.status,
    createdAt: q.createdAt,
  }));
}

export async function getDashboardSummary() {
  const [totals, statusBreakdown, quotesByDay, topMaterials, recentQuotes] = await Promise.all([
    getTotals(),
    getStatusBreakdown(),
    getQuotesByDay(),
    getTopMaterials(),
    getRecentQuotes(),
  ]);

  return { totals, statusBreakdown, quotesByDay, topMaterials, recentQuotes };
}
