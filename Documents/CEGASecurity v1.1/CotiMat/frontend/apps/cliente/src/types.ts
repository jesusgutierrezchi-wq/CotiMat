export type MaterialUnit =
  | 'PIEZA'
  | 'M2'
  | 'M3'
  | 'KG'
  | 'SACO'
  | 'LITRO'
  | 'TONELADA';

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  PIEZA: 'pieza',
  M2: 'm²',
  M3: 'm³',
  KG: 'kg',
  SACO: 'saco',
  LITRO: 'litro',
  TONELADA: 'tonelada',
};

export type QuoteStatus =
  | 'PENDIENTE'
  | 'EN_SEGUIMIENTO'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'CONVERTIDA';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDIENTE: 'Pendiente de revisión',
  EN_SEGUIMIENTO: 'En seguimiento',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CONVERTIDA: 'Convertida en venta',
};

export interface Category {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  unit: MaterialUnit;
  unitPrice: number;
  imageUrl: string | null;
  stock: number | null;
  active: boolean;
  category: Category;
}

export interface MaterialsResponse {
  items: Material[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuoteClient {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  address: string | null;
}

export interface QuoteItemMaterial {
  id: string;
  name: string;
  unit: MaterialUnit;
  category?: Category;
}

export interface QuoteItem {
  id: string;
  materialId: string;
  quantity: number;
  unitPriceAtTime: number;
  subtotal: number;
  material: QuoteItemMaterial;
}

export interface Quote {
  id: string;
  folio: string;
  clientId: string;
  status: QuoteStatus;
  total: number;
  createdAt: string;
  client: QuoteClient;
  items: QuoteItem[];
}

export interface CreateQuotePayload {
  clientPhone: string;
  clientName?: string;
  items: { materialId: string; quantity: number }[];
}

export interface ApiErrorBody {
  error: string;
}
