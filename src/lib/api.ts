import type { CostCategory, Rules } from './decision';

export type ProjectStatus = 'draft' | 'quote_created' | 'pending' | 'approved' | 'completed' | 'cancelled';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface User {
  id: number;
  name: string;
  email: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessTaxId: string;
  /** data URL of the shop logo, empty when not set */
  businessLogo: string;
  /** ProfitBloom subscription plan (same plans as the public website) */
  plan: 'trial' | 'starter' | 'pro';
  /** ISO date the free trial ends, for shops that signed up on the trial */
  trialEndsAt: string | null;
  role: 'shop' | 'admin';
  /** the shop's own business rules; missing keys use the defaults */
  rules: Partial<Rules>;
}

export interface AdminShop {
  id: number;
  name: string;
  email: string;
  businessName: string;
  businessPhone: string;
  hasLogo: boolean;
  plan: User['plan'];
  trialEndsAt: string | null;
  role: User['role'];
  disabled: boolean;
  createdAt: string;
  projects: number;
  quotes: number;
  lastActiveAt: string | null;
}

export interface CostItem {
  id: number;
  name: string;
  category: CostCategory;
  quantity: number;
  price: number;
  total: number;
  /** has to be paid before the client pays the balance (counts toward cash required) */
  paidBefore: boolean;
  /** what it really cost, filled in during/after the event */
  actual: number | null;
  /** unplanned cost that appeared during the event (estimate 0) */
  isExtra: boolean;
}

export interface Project {
  id: string;
  title: string;
  code: string;
  eventDate: string;
  budget: number;
  status: ProjectStatus;
  statusText: string;
  client: string;
  phone: string;
  email: string;
  notes: string;
  createdDate: string;
  projectType: string;
  costItems: CostItem[];
  /** markup on cost in % (margin = markup ÷ (100 + markup)) */
  profitMargin: number;
  depositPct: number;
  setupDays: number;
  eventDays: number;
  laborDays: number | null;
  teamSize: number | null;
  ownerLabor: boolean | null;
  teardown: boolean | null;
  reviewApplied: boolean;
  reviewedAt: string | null;
}

export interface QuoteItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  code: string;
  projectId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectTitle: string;
  eventDate: string;
  validUntil: string;
  validUntilText: string;
  notes: string;
  taxRate: number;
  discountRate: number;
  status: QuoteStatus;
  statusText: string;
  createdDate: string;
  itemCount: number;
  totalAmount: number;
  items: QuoteItem[];
}

export interface Activity {
  id: number;
  kind: string;
  title: string;
  detail: string;
  created_at: string;
}

export interface ChartPoint {
  month: string;
  sales: number;
  profit: number;
}

export interface Dashboard {
  stats: {
    salesThisMonth: number;
    salesChange: number;
    profitThisMonth: number;
    profitChange: number;
    activeProjects: number;
    newProjectsThisMonth: number;
    successRate: number;
    decidedProjects: number;
  };
  chart: ChartPoint[];
  activities: Activity[];
  recentProjects: Project[];
}

export interface Reports {
  totals: { projects: number; sales: number; profit: number; cost: number };
  chart: ChartPoint[];
  byType: Array<{ type: string; projects: number; sold: number; sales: number; profit: number }>;
  byStatus: Array<{ status: ProjectStatus; statusText: string; count: number }>;
}

export type ProjectInput = Partial<Omit<Project, 'costItems'>> & {
  costItems?: Array<Pick<CostItem, 'name' | 'quantity' | 'price'> & Partial<Pick<CostItem, 'category' | 'paidBefore' | 'actual' | 'isExtra'>>>;
};
export type QuoteInput = Partial<Omit<Quote, 'items'>> & {
  items?: Array<Pick<QuoteItem, 'description' | 'quantity' | 'unitPrice'>>;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Fired when any request comes back 401 so the app can drop back to the login screen. */
export const UNAUTHORIZED_EVENT = 'pb:unauthorized';

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${url}`, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !url.startsWith('/auth/')) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(res.status, data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: User | null }>('GET', '/auth/me'),
  login: (email: string, password: string) => request<{ user: User }>('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => request<{ user: User }>('POST', '/auth/register', { name, email, password }),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),
  updateAccount: (body: Partial<Omit<User, 'id' | 'email' | 'plan' | 'role' | 'trialEndsAt'>> & { name: string; currentPassword?: string; newPassword?: string }) => request<{ user: User }>('PUT', '/account', body),

  dashboard: (range: '6' | '12' | 'year') => request<Dashboard>('GET', `/dashboard?range=${range}`),
  activities: (limit = 50) => request<Activity[]>('GET', `/activities?limit=${limit}`),
  reports: () => request<Reports>('GET', '/reports'),

  projects: () => request<Project[]>('GET', '/projects'),
  project: (id: string) => request<Project>('GET', `/projects/${id}`),
  createProject: (body: ProjectInput) => request<Project>('POST', '/projects', body),
  updateProject: (id: string, body: ProjectInput) => request<Project>('PUT', `/projects/${id}`, body),
  deleteProject: (id: string) => request<{ ok: true }>('DELETE', `/projects/${id}`),

  adminShops: () => request<AdminShop[]>('GET', '/admin/shops'),
  adminUpdateShop: (id: number, body: { plan?: User['plan']; disabled?: boolean }) => request<AdminShop>('PUT', `/admin/shops/${id}`, body),

  quotes: () => request<Quote[]>('GET', '/quotes'),
  quote: (id: string) => request<Quote>('GET', `/quotes/${id}`),
  createQuote: (body: QuoteInput) => request<Quote>('POST', '/quotes', body),
  updateQuote: (id: string, body: QuoteInput) => request<Quote>('PUT', `/quotes/${id}`, body),
  deleteQuote: (id: string) => request<{ ok: true }>('DELETE', `/quotes/${id}`),
};

export const baht = (n: number, decimals = 0) =>
  `฿${n.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export function timeAgo(sqliteUtc: string) {
  const then = new Date(sqliteUtc.replace(' ', 'T') + 'Z').getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'เมื่อวาน';
  if (days < 30) return `${days} วันที่แล้ว`;
  return new Date(then).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}
