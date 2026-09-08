import type { Request, Response } from "express";
import { renderQuotePdf } from "../../services/pdf.service";
import { asyncHandler } from "../../utils/asyncHandler";
import * as quotesService from "./quotes.service";

export const createQuoteHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await quotesService.createQuote(req.body));
});

export const getQuoteByFolioHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await quotesService.getQuoteByFolio(req.params.folio));
});

export const getQuoteHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.query as { phone: string };
  res.json(await quotesService.getQuoteHistoryByPhone(phone));
});

export const downloadQuotePdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.getQuoteByFolio(req.params.folio);
  const pdfBuffer = await renderQuotePdf({
    folio: quote.folio,
    createdAt: quote.createdAt,
    status: quote.status,
    clientName: quote.client.name,
    clientPhone: quote.client.phone,
    total: Number(quote.total).toFixed(2),
    items: quote.items.map((item) => ({
      materialName: item.material.name,
      unit: item.material.unit,
      quantity: Number(item.quantity).toString(),
      unitPriceAtTime: Number(item.unitPriceAtTime).toFixed(2),
      subtotal: Number(item.subtotal).toFixed(2),
    })),
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${quote.folio}.pdf"`);
  res.send(pdfBuffer);
});

export const listQuotesAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await quotesService.listQuotesForAdmin(req.query as never));
});

export const getQuoteAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await quotesService.getQuoteById(req.params.id));
});

export const changeQuoteStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body;
  res.json(await quotesService.changeQuoteStatus(req.params.id, status, note, req.admin!.sub));
});

export const addQuoteNoteHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await quotesService.addQuoteNote(req.params.id, req.body.note, req.admin!.sub));
});
