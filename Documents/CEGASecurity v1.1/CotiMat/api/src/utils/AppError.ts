export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = "No autorizado") {
    return new AppError(401, message);
  }

  static forbidden(message = "Prohibido") {
    return new AppError(403, message);
  }

  static notFound(message = "Recurso no encontrado") {
    return new AppError(404, message);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(409, message, details);
  }
}
