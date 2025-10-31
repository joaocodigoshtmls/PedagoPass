// Frontend HTTP client for the standalone backend

export type ApiUser = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
};

// Comunidades
export type Community = {
  slug: string;
  nome: string;
  descricao: string;
  membros: number;
  tags: string[];
  capa?: string;
};

const TOKEN_KEY = 'pp.jwt';

export function getBackendUrl() {
  // Prefer explicit backend URL when fornecida; fallback para rotas locais /api
  return process.env.NEXT_PUBLIC_API_URL || '/api';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getBackendUrl();
  const url = `${base}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error || 'Erro de requisição'), { status: res.status, data });
  return data as T;
}

export async function apiSignup(params: { nome: string; email: string; senha: string }) {
  const data = await request<{ ok: boolean; token: string; user: ApiUser }>(`/auth/signup`, {
    method: 'POST', body: JSON.stringify(params)
  });
  setToken(data.token);
  return data.user;
}

export async function apiLogin(params: { email: string; senha: string }) {
  const data = await request<{ ok: boolean; token: string; user: ApiUser }>(`/auth/login`, {
    method: 'POST', body: JSON.stringify(params)
  });
  setToken(data.token);
  return data.user;
}

export async function apiLogout() {
  // With JWT, logout is client-side (optional call)
  try { await request(`/auth/logout`, { method: 'POST' }); } catch {}
  setToken(null);
}

export async function apiMe(): Promise<ApiUser | null> {
  try {
    const data = await request<{ user: ApiUser | null }>(`/me`, { method: 'GET' });
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function apiMyCommunities(): Promise<string[]> {
  try {
    const data = await request<{ communities: string[] }>(`/me/communities`, { method: 'GET' });
    return data.communities ?? [];
  } catch {
    return [];
  }
}

export async function apiJoinCommunity(slug: string) {
  await request(`/communities/${encodeURIComponent(slug)}/join`, { method: 'POST' });
}

export async function apiLeaveCommunity(slug: string) {
  await request(`/communities/${encodeURIComponent(slug)}/join`, { method: 'DELETE' });
}

export async function apiChangePassword(params: { current: string; next: string }) {
  await request(`/me/password`, { method: 'POST', body: JSON.stringify(params) });
}

// Quick login helpers
export async function apiCreateQuickToken(): Promise<{ token: string; expiresAt: string } | null> {
  try {
    const data = await request<{ ok: boolean; token: string; expiresAt: string }>(`/auth/quick-token`, { method: 'POST' });
    return { token: data.token, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

export async function apiQuickLogin(token: string): Promise<ApiUser | null> {
  try {
    const data = await request<{ ok: boolean; token: string; user: ApiUser }>(`/auth/login/quick`, {
      method: 'POST', body: JSON.stringify({ token })
    });
    setToken(data.token);
    return data.user;
  } catch {
    return null;
  }
}

export async function apiGetCommunities(): Promise<Community[]> {
  const data = await request<{ communities: Community[] }>(`/communities`, { method: 'GET' });
  return data.communities;
}

export async function apiGetCommunity(slug: string): Promise<Community | null> {
  try {
    const data = await request<{ community: Community }>(`/communities/${encodeURIComponent(slug)}`, { method: 'GET' });
    return data.community;
  } catch { return null; }
}

// Reservations & Orders
export type Reservation = {
  id: string;
  userId: string;
  destinoSlug: string;
  destinoNome: string;
  destinoImagem?: string;
  createdAt: string;
  ida: string;
  volta: string;
  pessoas: number;
  formaPagamento?: string;
  totalEstimado: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
};

export type Order = {
  id: string;
  userId: string;
  reservationId?: string;
  destinoSlug: string;
  destinoNome: string;
  total: number;
  metodo: string;
  parcelas?: number;
  pagoEm: string;
};

export async function apiAddReservation(params: {
  destinoSlug: string;
  destinoNome: string;
  destinoImagem?: string;
  ida: string;
  volta: string;
  pessoas: number;
  formaPagamento?: string;
  totalEstimado: number;
}): Promise<Reservation> {
  const data = await request<{ ok: boolean; reservation: Reservation }>(`/reservations`, {
    method: 'POST', body: JSON.stringify(params)
  });
  return data.reservation;
}

export async function apiGetMyReservations(): Promise<Reservation[]> {
  const data = await request<{ reservations: Reservation[] }>(`/reservations/me`, { method: 'GET' });
  return data.reservations;
}

export async function apiGetReservationById(id: string): Promise<Reservation | null> {
  try {
    const data = await request<{ reservation: Reservation }>(`/reservations/${encodeURIComponent(id)}`, { method: 'GET' });
    return data.reservation;
  } catch { return null; }
}

export async function apiUpdateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation> {
  const data = await request<{ ok: boolean; reservation: Reservation }>(`/reservations/${encodeURIComponent(id)}/status`, {
    method: 'PATCH', body: JSON.stringify({ status })
  });
  return data.reservation;
}

export async function apiMarkReservationPaid(params: { reservationId: string; metodo: string; parcelas?: number }): Promise<Order> {
  const data = await request<{ ok: boolean; order: Order }>(`/orders/mark-paid`, {
    method: 'POST', body: JSON.stringify(params)
  });
  return data.order;
}

export async function apiGetMyOrders(): Promise<Order[]> {
  const data = await request<{ orders: Order[] }>(`/orders/me`, { method: 'GET' });
  return data.orders;
}

export async function apiGetOrderById(id: string): Promise<Order | null> {
  try {
    const data = await request<{ order: Order }>(`/orders/${encodeURIComponent(id)}`, { method: 'GET' });
    return data.order;
  } catch { return null; }
}

export async function apiGetOrderByReservationId(reservationId: string): Promise<Order | null> {
  try {
    const data = await request<{ order: Order }>(`/orders/by-reservation/${encodeURIComponent(reservationId)}`, { method: 'GET' });
    return data.order;
  } catch { return null; }
}
