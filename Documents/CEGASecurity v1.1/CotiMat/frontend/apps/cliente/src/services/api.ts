import axios, { AxiosError } from 'axios';
import type {
  Category,
  CreateQuotePayload,
  MaterialsResponse,
  Quote,
} from '../types';

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:4000/api';

// Origin without the trailing /api, used to resolve relative image paths.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

export const api = axios.create({
  baseURL: API_URL,
});

export function getFriendlyErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const serverMessage = axiosError.response?.data?.error;
    if (serverMessage) return serverMessage;
    if (axiosError.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.';
    }
    if (!axiosError.response) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    if (axiosError.response.status === 404) {
      return 'No se encontró la información solicitada.';
    }
    if (axiosError.response.status >= 500) {
      return 'Ocurrió un problema en el servidor. Intenta de nuevo en unos minutos.';
    }
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/public/categories');
  return data;
}

export interface FetchMaterialsParams {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchMaterials(
  params: FetchMaterialsParams
): Promise<MaterialsResponse> {
  const { data } = await api.get<MaterialsResponse>('/public/materials', {
    params: {
      category: params.category || undefined,
      search: params.search || undefined,
      page: params.page,
      pageSize: params.pageSize,
    },
  });
  return data;
}

export async function createQuote(payload: CreateQuotePayload): Promise<Quote> {
  const { data } = await api.post<Quote>('/public/quotes', payload);
  return data;
}

export async function fetchQuotesByPhone(phone: string): Promise<Quote[]> {
  const { data } = await api.get<Quote[]>('/public/quotes', {
    params: { phone },
  });
  return data;
}

export async function fetchQuoteByFolio(folio: string): Promise<Quote> {
  const { data } = await api.get<Quote>(
    `/public/quotes/${encodeURIComponent(folio)}`
  );
  return data;
}

export function getQuotePdfUrl(folio: string): string {
  return `${API_URL}/public/quotes/${encodeURIComponent(folio)}/pdf`;
}
