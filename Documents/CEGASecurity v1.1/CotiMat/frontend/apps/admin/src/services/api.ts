import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth.store';
import type {
  Category,
  Client,
  DashboardSummary,
  LoginResponse,
  Material,
  MaterialUnit,
  Paginated,
  Quote,
  QuoteStatus,
} from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Origin without the trailing /api, used to resolve relative image paths like /uploads/x.jpg
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const isLogin = config.url?.includes('/admin/auth/login');
  if (!isLogin) {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado. Intenta de nuevo.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }
    if (error.response?.status === 404) return 'No se encontró el recurso solicitado.';
    if (error.response?.status === 413) return 'El archivo es demasiado grande.';
  }
  return fallback;
}

// ---------- Auth ----------

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/admin/auth/login', { username, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/admin/auth/me');
  return data;
}

// ---------- Dashboard ----------

export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/admin/dashboard');
  return data;
}

// ---------- Categories ----------

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/admin/categories');
  return data;
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<Category>('/admin/categories', { name });
  return data;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const { data } = await api.put<Category>(`/admin/categories/${id}`, { name });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}

// ---------- Materials ----------

export interface MaterialsQuery {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
}

export async function fetchMaterials(query: MaterialsQuery): Promise<Paginated<Material>> {
  const { data } = await api.get<Paginated<Material>>('/admin/materials', {
    params: {
      category: query.category || undefined,
      search: query.search || undefined,
      page: query.page,
      pageSize: query.pageSize,
      includeInactive: query.includeInactive ? 'true' : 'false',
    },
  });
  return data;
}

export async function fetchMaterial(id: string): Promise<Material> {
  const { data } = await api.get<Material>(`/admin/materials/${id}`);
  return data;
}

export interface MaterialInput {
  name: string;
  description?: string | null;
  categoryId: string;
  unit: MaterialUnit;
  unitPrice: number;
  stock?: number | null;
  active?: boolean;
}

export async function createMaterial(input: MaterialInput): Promise<Material> {
  const { data } = await api.post<Material>('/admin/materials', input);
  return data;
}

export async function updateMaterial(id: string, input: Partial<MaterialInput>): Promise<Material> {
  const { data } = await api.put<Material>(`/admin/materials/${id}`, input);
  return data;
}

export async function deactivateMaterial(id: string): Promise<void> {
  await api.delete(`/admin/materials/${id}`);
}

export async function uploadMaterialImage(id: string, file: File): Promise<Material> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<Material>(`/admin/materials/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ---------- Quotes ----------

export interface QuotesQuery {
  status?: QuoteStatus | '';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchQuotes(query: QuotesQuery): Promise<Paginated<Quote>> {
  const { data } = await api.get<Paginated<Quote>>('/admin/quotes', {
    params: {
      status: query.status || undefined,
      dateFrom: query.dateFrom || undefined,
      dateTo: query.dateTo || undefined,
      search: query.search || undefined,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
  return data;
}

export async function fetchQuote(id: string): Promise<Quote> {
  const { data } = await api.get<Quote>(`/admin/quotes/${id}`);
  return data;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus, note?: string): Promise<Quote> {
  const { data } = await api.patch<Quote>(`/admin/quotes/${id}/status`, { status, note: note || undefined });
  return data;
}

export async function addQuoteNote(id: string, note: string): Promise<Quote> {
  const { data } = await api.post<Quote>(`/admin/quotes/${id}/notes`, { note });
  return data;
}

// ---------- Clients ----------

export interface ClientsQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchClients(query: ClientsQuery): Promise<Paginated<Client>> {
  const { data } = await api.get<Paginated<Client>>('/admin/clients', {
    params: {
      search: query.search || undefined,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
  return data;
}
