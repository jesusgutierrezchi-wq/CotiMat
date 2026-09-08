import PDFDocument from "pdfkit";

export interface QuotePdfItem {
  materialName: string;
  unit: string;
  quantity: string;
  unitPriceAtTime: string;
  subtotal: string;
}

export interface QuotePdfData {
  folio: string;
  createdAt: Date;
  status: string;
  clientName?: string | null;
  clientPhone: string;
  items: QuotePdfItem[];
  total: string;
}

const COMPANY_NAME = "CotiMat — Materiales de Construcción";

export function renderQuotePdf(data: QuotePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(COMPANY_NAME, { align: "left" });
    doc.moveDown(0.2);
    doc.fontSize(12).fillColor("#555").text(`Folio: ${data.folio}`);
    doc.text(`Fecha: ${data.createdAt.toLocaleString("es-MX")}`);
    doc.text(`Estatus: ${data.status}`);
    doc.moveDown();

    doc.fillColor("#000").fontSize(13).text("Datos del cliente");
    doc.fontSize(11).fillColor("#333");
    if (data.clientName) doc.text(`Nombre: ${data.clientName}`);
    doc.text(`Teléfono: ${data.clientPhone}`);
    doc.moveDown();

    doc.fillColor("#000").fontSize(13).text("Materiales cotizados");
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colX = { material: 50, unit: 260, qty: 320, price: 390, subtotal: 470 };

    doc.fontSize(10).fillColor("#000");
    doc.text("Material", colX.material, tableTop, { width: 200, continued: false });
    doc.text("Unidad", colX.unit, tableTop, { width: 50 });
    doc.text("Cant.", colX.qty, tableTop, { width: 60 });
    doc.text("P. Unit.", colX.price, tableTop, { width: 70 });
    doc.text("Subtotal", colX.subtotal, tableTop, { width: 80 });
    doc.moveTo(50, doc.y + 4).lineTo(550, doc.y + 4).strokeColor("#ccc").stroke();
    doc.moveDown(0.5);

    doc.fillColor("#333");
    for (const item of data.items) {
      const rowY = doc.y;
      doc.text(item.materialName, colX.material, rowY, { width: 200 });
      doc.text(item.unit, colX.unit, rowY, { width: 50 });
      doc.text(item.quantity, colX.qty, rowY, { width: 60 });
      doc.text(`$${item.unitPriceAtTime}`, colX.price, rowY, { width: 70 });
      doc.text(`$${item.subtotal}`, colX.subtotal, rowY, { width: 80 });
      doc.moveDown(0.6);
    }

    doc.moveTo(50, doc.y + 4).lineTo(550, doc.y + 4).strokeColor("#ccc").stroke();
    doc.moveDown(0.6);
    doc.fontSize(13).fillColor("#000").text(`Total estimado: $${data.total}`, { align: "right" });

    doc.moveDown(1.5);
    doc.fontSize(9).fillColor("#888").text(
      "Cotización generada automáticamente. Precios sujetos a disponibilidad al momento de la venta.",
      { align: "center" }
    );

    doc.end();
  });
}
