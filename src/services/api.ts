import type {
  AppState,
  Crane,
  Operator,
  Camera,
  Client,
  Invoice,
  Payment,
  CreditNote,
  Quotation,
  Proforma,
  Challan,
  Notification,
  FuelEntry,
  TimesheetEntry,
  ComplianceRecord,
  OwnerProfile,
} from '../types';

const BASE = '/api';

// ── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('suprwise_token');
}

export function setToken(token: string): void {
  localStorage.setItem('suprwise_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('suprwise_token');
}

// ── Core request helper ──────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth response type ───────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user_id: string;
  tenant_id: string;
  role: string;
  phone: string;
}

export interface MeResponse {
  user_id: string;
  tenant_id: string;
  role: string;
  phone: string;
}

// ── Maintenance entry type (inline since MaintenanceRecord is a nested map) ──

type MaintenanceEntry = { id: string; date: string; type: string; cost?: number; notes?: string };

// ── API object ───────────────────────────────────────────────────────────────

export const api = {

  // Auth
  login(phone: string, password: string): Promise<AuthResponse> {
    return request('POST', '/auth/login', { phone, password });
  },
  register(phone: string, password: string, company_name: string): Promise<AuthResponse> {
    return request('POST', '/auth/register', { phone, password, company_name });
  },
  registerOperator(phone: string, password: string): Promise<AuthResponse> {
    return request('POST', '/auth/register-operator', { phone, password });
  },
  me(): Promise<MeResponse> {
    return request('GET', '/auth/me');
  },

  // Sync
  exportAll(): Promise<AppState> {
    return request('GET', '/sync/export');
  },
  importAll(data: AppState): Promise<void> {
    return request('POST', '/sync/import', data);
  },

  // Cranes
  getCranes(): Promise<Crane[]> {
    return request('GET', '/cranes');
  },
  createCrane(c: Omit<Crane, 'id'>): Promise<Crane> {
    return request('POST', '/cranes', c);
  },
  updateCrane(id: string, c: Partial<Crane>): Promise<Crane> {
    return request('PUT', `/cranes/${id}`, c);
  },
  deleteCrane(id: string): Promise<void> {
    return request('DELETE', `/cranes/${id}`);
  },

  // Operators
  getOperators(): Promise<Operator[]> {
    return request('GET', '/operators');
  },
  createOperator(o: Omit<Operator, 'id'>): Promise<Operator> {
    return request('POST', '/operators', o);
  },
  updateOperator(id: string, o: Partial<Operator>): Promise<Operator> {
    return request('PUT', `/operators/${id}`, o);
  },
  deleteOperator(id: string): Promise<void> {
    return request('DELETE', `/operators/${id}`);
  },

  // Fuel logs
  getFuelLogs(): Promise<Record<string, FuelEntry[]>> {
    return request('GET', '/fuel-logs');
  },
  createFuelLog(data: { craneReg: string } & Omit<FuelEntry, 'id'>): Promise<FuelEntry> {
    return request('POST', '/fuel-logs', data);
  },
  updateFuelLog(id: string, data: Partial<FuelEntry>): Promise<FuelEntry> {
    return request('PUT', `/fuel-logs/${id}`, data);
  },
  deleteFuelLog(id: string): Promise<void> {
    return request('DELETE', `/fuel-logs/${id}`);
  },

  // Cameras
  getCameras(): Promise<Camera[]> {
    return request('GET', '/cameras');
  },
  createCamera(c: Omit<Camera, 'id'>): Promise<Camera> {
    return request('POST', '/cameras', c);
  },
  updateCamera(id: string, c: Partial<Camera>): Promise<Camera> {
    return request('PUT', `/cameras/${id}`, c);
  },
  deleteCamera(id: string): Promise<void> {
    return request('DELETE', `/cameras/${id}`);
  },

  // Clients
  getClients(): Promise<Client[]> {
    return request('GET', '/clients');
  },
  createClient(c: Omit<Client, 'id'>): Promise<Client> {
    return request('POST', '/clients', c);
  },
  updateClient(id: string, c: Partial<Client>): Promise<Client> {
    return request('PUT', `/clients/${id}`, c);
  },
  deleteClient(id: string): Promise<void> {
    return request('DELETE', `/clients/${id}`);
  },

  // Invoices
  getInvoices(): Promise<Invoice[]> {
    return request('GET', '/invoices');
  },
  createInvoice(inv: Omit<Invoice, 'id'>): Promise<Invoice> {
    return request('POST', '/invoices', inv);
  },
  updateInvoice(id: string, inv: Partial<Invoice>): Promise<Invoice> {
    return request('PUT', `/invoices/${id}`, inv);
  },
  deleteInvoice(id: string): Promise<void> {
    return request('DELETE', `/invoices/${id}`);
  },

  // Payments
  getPayments(): Promise<Payment[]> {
    return request('GET', '/payments');
  },
  createPayment(p: Omit<Payment, 'id'>): Promise<Payment> {
    return request('POST', '/payments', p);
  },
  updatePayment(id: string, p: Partial<Payment>): Promise<Payment> {
    return request('PUT', `/payments/${id}`, p);
  },
  deletePayment(id: string): Promise<void> {
    return request('DELETE', `/payments/${id}`);
  },

  // Credit notes
  getCreditNotes(): Promise<CreditNote[]> {
    return request('GET', '/credit-notes');
  },
  createCreditNote(cn: Omit<CreditNote, 'id'>): Promise<CreditNote> {
    return request('POST', '/credit-notes', cn);
  },
  updateCreditNote(id: string, cn: Partial<CreditNote>): Promise<CreditNote> {
    return request('PUT', `/credit-notes/${id}`, cn);
  },
  deleteCreditNote(id: string): Promise<void> {
    return request('DELETE', `/credit-notes/${id}`);
  },

  // Quotations
  getQuotations(): Promise<Quotation[]> {
    return request('GET', '/quotations');
  },
  createQuotation(q: Omit<Quotation, 'id'>): Promise<Quotation> {
    return request('POST', '/quotations', q);
  },
  updateQuotation(id: string, q: Partial<Quotation>): Promise<Quotation> {
    return request('PUT', `/quotations/${id}`, q);
  },
  deleteQuotation(id: string): Promise<void> {
    return request('DELETE', `/quotations/${id}`);
  },
  convertQuotation(id: string): Promise<Proforma> {
    return request('POST', `/quotations/${id}/convert`);
  },

  // Proformas
  getProformas(): Promise<Proforma[]> {
    return request('GET', '/proformas');
  },
  createProforma(p: Omit<Proforma, 'id'>): Promise<Proforma> {
    return request('POST', '/proformas', p);
  },
  updateProforma(id: string, p: Partial<Proforma>): Promise<Proforma> {
    return request('PUT', `/proformas/${id}`, p);
  },
  deleteProforma(id: string): Promise<void> {
    return request('DELETE', `/proformas/${id}`);
  },
  convertProforma(id: string): Promise<Invoice> {
    return request('POST', `/proformas/${id}/convert`);
  },

  // Challans
  getChallans(): Promise<Challan[]> {
    return request('GET', '/challans');
  },
  createChallan(c: Omit<Challan, 'id'>): Promise<Challan> {
    return request('POST', '/challans', c);
  },
  updateChallan(id: string, c: Partial<Challan>): Promise<Challan> {
    return request('PUT', `/challans/${id}`, c);
  },
  deleteChallan(id: string): Promise<void> {
    return request('DELETE', `/challans/${id}`);
  },

  // Timesheets
  getTimesheets(): Promise<Record<string, TimesheetEntry[]>> {
    return request('GET', '/timesheets');
  },
  createTimesheet(data: { craneReg: string } & Omit<TimesheetEntry, 'id'>): Promise<TimesheetEntry> {
    return request('POST', '/timesheets', data);
  },
  updateTimesheet(id: string, data: Partial<TimesheetEntry>): Promise<TimesheetEntry> {
    return request('PUT', `/timesheets/${id}`, data);
  },
  deleteTimesheet(id: string): Promise<void> {
    return request('DELETE', `/timesheets/${id}`);
  },

  // Maintenance
  getMaintenance(): Promise<Record<string, MaintenanceEntry[]>> {
    return request('GET', '/maintenance');
  },
  createMaintenance(data: { craneReg: string } & Omit<MaintenanceEntry, 'id'>): Promise<MaintenanceEntry> {
    return request('POST', '/maintenance', data);
  },
  updateMaintenance(id: string, data: Partial<MaintenanceEntry>): Promise<MaintenanceEntry> {
    return request('PUT', `/maintenance/${id}`, data);
  },
  deleteMaintenance(id: string): Promise<void> {
    return request('DELETE', `/maintenance/${id}`);
  },

  // Files
  getFiles(): Promise<Record<string, unknown[]>> {
    return request('GET', '/files');
  },
  createFile(data: unknown): Promise<unknown> {
    return request('POST', '/files', data);
  },
  updateFile(id: string, data: unknown): Promise<unknown> {
    return request('PUT', `/files/${id}`, data);
  },
  deleteFile(id: string): Promise<void> {
    return request('DELETE', `/files/${id}`);
  },

  // Notifications
  getNotifications(): Promise<Notification[]> {
    return request('GET', '/notifications');
  },
  createNotification(n: Omit<Notification, 'id'>): Promise<Notification> {
    return request('POST', '/notifications', n);
  },
  updateNotification(id: string, n: Partial<Notification>): Promise<Notification> {
    return request('PUT', `/notifications/${id}`, n);
  },
  deleteNotification(id: string): Promise<void> {
    return request('DELETE', `/notifications/${id}`);
  },

  // Compliance
  getCompliance(craneReg?: string): Promise<Record<string, ComplianceRecord>> {
    const qs = craneReg ? `?crane_reg=${encodeURIComponent(craneReg)}` : '';
    return request('GET', `/compliance${qs}`);
  },
  upsertCompliance(craneReg: string, data: ComplianceRecord): Promise<ComplianceRecord> {
    return request('PUT', `/compliance/${encodeURIComponent(craneReg)}`, data);
  },

  // Diagnostics
  getDiagnostics(): Promise<Record<string, unknown>> {
    return request('GET', '/diagnostics');
  },
  upsertDiagnostics(craneReg: string, data: unknown): Promise<unknown> {
    return request('PUT', `/diagnostics/${encodeURIComponent(craneReg)}`, data);
  },

  // Owner profile
  getOwnerProfile(): Promise<OwnerProfile> {
    return request('GET', '/owner-profile');
  },
  updateOwnerProfile(data: Partial<OwnerProfile>): Promise<OwnerProfile> {
    return request('PUT', '/owner-profile', data);
  },
};
