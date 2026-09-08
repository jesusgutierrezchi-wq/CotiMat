import rateLimit from "express-rate-limit";

// Límite general para todo el tráfico público: protege el catálogo y el historial
// de cotizaciones de scraping/abuso sin afectar el uso normal de un cliente.
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intenta de nuevo más tarde" },
});

// Límite más estricto para la creación de cotizaciones: es la operación de
// escritura pública más sensible a spam/abuso.
export const createQuoteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas cotizaciones creadas, intenta de nuevo más tarde" },
});

// Límite para login de admin: mitiga fuerza bruta de credenciales.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión, intenta de nuevo más tarde" },
});
