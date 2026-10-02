/// <reference types="vite/client" />
import { Article, Category, Comment, Quiz, QuizSummary } from '../types';

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

const request = async <T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<Envelope<T>> => {
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    method: init.method ?? 'GET',
    headers: { Accept: 'application/json', ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: 'omit',
  });
  const payload = await response.json().catch(() => null) as (Envelope<T> & { message?: string; errors?: Record<string, string[]> }) | null;
  if (!response.ok || !payload) {
    // Validation errors: show the first field message; 429 is the rate limit.
    const firstError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    const message = response.status === 429 ? 'Previše zahtjeva, pokušajte ponovo za minutu.' : firstError || payload?.message;
    throw new ApiError(message || `API request failed (${response.status}).`, response.status);
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
  comments: async (postId: string): Promise<Comment[]> =>
    (await request<Comment[]>(`/posts/${encodeURIComponent(postId)}/comments`)).data,
  addComment: async (postId: string, comment: { author: string; body: string; parentId?: number; website?: string }): Promise<Comment> =>
    (await request<Comment>(`/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: comment })).data,
  likeComment: async (id: number, liked: boolean): Promise<number> =>
    (await request<{ id: number; likes: number }>(`/comments/${id}/like`, { method: liked ? 'POST' : 'DELETE' })).data.likes,
  quizzes: async (): Promise<{ quizzes: QuizSummary[]; today: string }> => {
    const payload = await request<QuizSummary[]>('/quizzes') as Envelope<QuizSummary[]> & { today: string };
    return { quizzes: payload.data, today: payload.today };
  },
  // 'today' generates the quiz on the first request of the day, which can take ~20s
  quiz: async (date: string | 'today'): Promise<Quiz> => (await request<Quiz>(`/quizzes/${date}`)).data,
};
