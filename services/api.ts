/// <reference types="vite/client" />
import { Article, Category } from '../types';

// Pick the backend with VITE_API_BACKEND in .env.local (default: production).
//   production -> the deployed Laravel API (works from a local `npm run dev` too)
//   local      -> `php artisan serve` in ../backend
const API_BACKENDS = {
  local: 'http://127.0.0.1:8000/api',
  production: 'https://geovizija.com/endpoints/api',
} as const;

const configuredBackend = String(import.meta.env.VITE_API_BACKEND || 'production').toLowerCase();
export const API_BASE_URL = (API_BACKENDS[configuredBackend as keyof typeof API_BACKENDS] || API_BACKENDS.production)
  .replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

type Envelope<T> = { data: T; meta?: { total: number; current_page: number; last_page: number } };

const request = async <T>(path: string): Promise<Envelope<T>> => {
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  });
  const payload = await response.json().catch(() => null) as (Envelope<T> & { message?: string }) | null;
  if (!response.ok || !payload) {
    throw new ApiError(payload?.message || `API request failed (${response.status}).`, response.status);
  }
  return payload;
};

export const api = {
  categories: async (): Promise<Category[]> => (await request<Category[]>('/categories')).data,
  posts: async (params: { category?: string; featured?: boolean; search?: string; perPage?: number } = {}): Promise<Article[]> => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.featured) query.set('featured', '1');
    if (params.search) query.set('search', params.search);
    query.set('per_page', String(params.perPage ?? 100));
    return (await request<Article[]>(`/posts?${query}`)).data;
  },
  post: async (idOrSlug: string): Promise<Article> => (await request<Article>(`/posts/${encodeURIComponent(idOrSlug)}`)).data,
};
