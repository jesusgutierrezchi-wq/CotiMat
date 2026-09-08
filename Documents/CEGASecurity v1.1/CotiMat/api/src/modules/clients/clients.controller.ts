import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as clientsService from "./clients.service";

export const registerClientHandler = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientsService.registerOrUpdateClient(req.body);
  res.status(201).json(client);
});

export const listClientsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await clientsService.listClients(req.query as never);
  res.json(result);
});

export const getClientHandler = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientsService.getClientById(req.params.id);
  res.json(client);
});
