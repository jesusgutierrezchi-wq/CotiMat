import { z } from "zod";

// 10 dígitos nacionales, con código de país opcional (+52...) al frente.
const phoneRegex = /^(\+\d{1,3})?\d{10}$/;

export const registerClientSchema = z.object({
  phone: z.string().regex(phoneRegex, "Teléfono inválido: usa 10 dígitos (opcionalmente con código de país)"),
  name: z.string().trim().min(1).max(150).optional(),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  address: z.string().trim().max(300).optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;

export const listClientsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const phoneParamSchema = z.object({
  phone: z.string().regex(phoneRegex, "Teléfono inválido"),
});
