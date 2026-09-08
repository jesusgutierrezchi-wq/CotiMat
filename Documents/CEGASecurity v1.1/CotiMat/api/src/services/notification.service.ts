/**
 * Interfaz de notificaciones salientes (confirmación al cliente, alerta al admin).
 *
 * MVP: implementación "log" que solo imprime a consola — cumple el contrato sin
 * depender de credenciales de un proveedor externo (email/SMS/WhatsApp). Cuando se
 * quiera una integración real (ver docs/ARCHITECTURE.md, roadmap fase 2), basta con
 * escribir una nueva clase que implemente `NotificationService` y cambiar la
 * instancia exportada al final de este archivo — el resto de la app no cambia.
 */
export interface NewQuoteNotificationPayload {
  folio: string;
  clientPhone: string;
  clientName?: string | null;
  total: number;
}

export interface StatusChangeNotificationPayload {
  folio: string;
  clientPhone: string;
  newStatus: string;
  note?: string;
}

export interface NotificationService {
  notifyNewQuote(payload: NewQuoteNotificationPayload): Promise<void>;
  notifyStatusChange(payload: StatusChangeNotificationPayload): Promise<void>;
}

class LogNotificationService implements NotificationService {
  async notifyNewQuote(payload: NewQuoteNotificationPayload): Promise<void> {
    console.log(
      `[notify] Nueva cotización ${payload.folio} de ${payload.clientName ?? "cliente"} ` +
        `(${payload.clientPhone}) por $${payload.total.toFixed(2)}. ` +
        `Confirmación al cliente + alerta al admin (stub).`
    );
  }

  async notifyStatusChange(payload: StatusChangeNotificationPayload): Promise<void> {
    console.log(
      `[notify] Cotización ${payload.folio} cambió a "${payload.newStatus}". ` +
        `Se notificaría a ${payload.clientPhone} (stub).${payload.note ? ` Nota: ${payload.note}` : ""}`
    );
  }
}

export const notificationService: NotificationService = new LogNotificationService();
