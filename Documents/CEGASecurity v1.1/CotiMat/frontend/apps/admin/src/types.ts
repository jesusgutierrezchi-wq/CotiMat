export type AdminRole = 'ADMIN';

export interface Admin {
  id: string;
  username: string;
  role: AdminRole;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface Category {
  id: string;
  name: string;
}

export type MaterialUnit = 'PIEZA' | 'M2' | 'M3' | 'KG' | 'SACO' | 'LITRO' | 'TONELADA';

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  PIEZA: 'pieza',
  M2: 'm²',
  M3: 'm³',
  KG: 'kg',
  SACO: 'saco',
  LITRO: 'litro',
  TONELADA: 'tonelada',
};

export const MATERIAL_UNITS: MaterialUnit[] = ['PIEZA', 'M2', 'M3', 'KG', 'SACO', 'LITRO', 'TONELADA'];

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

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type QuoteStatus = 'PENDIENTE' | 'EN_SEGUIMIENTO' | 'APROBADA' | 'RECHAZADA' | 'CONVERTIDA';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDIENTE: 'Pendiente de revisión',
  EN_SEGUIMIENTO: 'En seguimiento',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CONVERTIDA: 'Convertida en venta',
};

export const QUOTE_STATUSES: QuoteStatus[] = [
  'PENDIENTE',
  'EN_SEGUIMIENTO',
  'APROBADA',
  'RECHAZADA',
  'CONVERTIDA',
];

export interface Client {
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
  category: Category;
}

export interface QuoteItem {
  id: string;
  materialId: string;
  quantity: number;
  unitPriceAtTime: number;
  subtotal: number;
  material: QuoteItemMaterial;
}

export interface QuoteNote {
  id: string;
  note: string;
  statusAtNote: QuoteStatus;
  createdAt: string;
  author: { id: string; username: string };
}

export interface Quote {
  id: string;
  folio: string;
  clientId: string;
  status: QuoteStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  items: QuoteItem[];
  notes?: QuoteNote[];
}

export interface ApiErrorPayload {
  error: string;
}

export interface DashboardTotals {
  quotesAllTime: number;
  quotesThisMonth: number;
  quotesLastMonth: number;
  totalQuotedAmount: number;
  conversionRate: number;
}

export interface DashboardStatusCount {
  status: QuoteStatus;
  count: number;
}

export interface DashboardDayCount {
  date: string;
  count: number;
}

export interface DashboardTopMaterial {
  materialId: string;
  name: string;
  unit: MaterialUnit;
  timesQuoted: number;
}

export interface DashboardRecentQuote {
  id: string;
  folio: string;
  clientName: string | null;
  clientPhone: string;
  total: number;
  status: QuoteStatus;
  createdAt: string;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  statusBreakdown: DashboardStatusCount[];
  quotesByDay: DashboardDayCount[];
  topMaterials: DashboardTopMaterial[];
  recentQuotes: DashboardRecentQuote[];
}
