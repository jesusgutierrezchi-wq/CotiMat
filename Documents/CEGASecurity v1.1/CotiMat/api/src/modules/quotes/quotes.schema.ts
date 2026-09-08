import { z } from "zod";

const phoneRegex = /^(\+\d{1,3})?\d{10}$/;

export const quoteStatusEnum = z.enum([
  "PENDIENTE",
  "EN_SEGUIMIENTO",
  "APROBADA",
  "RECHAZADA",
  "CONVERTIDA",
]);

export const createQuoteSchema = z.object({
  clientPhone: z.string().regex(phoneRegex, "Teléfono inválido"),
  clientName: z.string().trim().min(1).max(150).optional(),
  items: z
    .array(
      z.object({
        materialId: z.string().min(1),
        quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
      })
    )
    .min(1, "La cotización debe incluir al menos un material"),
});

export const publicQuoteHistoryQuerySchema = z.object({
  phone: z.string().regex(phoneRegex, "Teléfono inválido"),
});

export const adminListQuotesQuerySchema = z.object({
  status: quoteStatusEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const changeQuoteStatusSchema = z.object({
  status: quoteStatusEnum,
  note: z.string().trim().max(1000).optional(),
});

export const addQuoteNoteSchema = z.object({
  note: z.string().trim().min(1).max(1000),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
