import { PrismaClient } from "@prisma/client";

// Cliente único reutilizado en toda la app: evita agotar el pool de conexiones
// en desarrollo (tsx watch reinicia el módulo en cada cambio de archivo).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
