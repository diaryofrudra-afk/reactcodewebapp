export type Theme = 'dark' | 'light';
export type PageId =
  | 'fleet' | 'assets' | 'operators' | 'earnings' | 'attendance'
  | 'analytics' | 'billing' | 'gps' | 'fuel' | 'cameras'
  | 'diagnostics' | 'logger' | 'op-history' | 'op-files';

export interface Crane {
  id: string;
  reg: string;
  type: string;
  make?: string;
  model?: string;
  capacity?: string;
  year?: string;
  rate: number;
  otRate?: number;
  dailyLimit?: number;
  operator?: string;
  site?: string;
  status?: string;
  notes?: string;
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  license?: string;
  aadhaar?: string;
  assigned?: string;
  status?: string;
}

export interface OperatorProfile {
  [operatorId: string]: {
    photo?: string;
    bank?: string;
    ifsc?: string;
    account?: string;
    address?: string;
  };
}

export interface OwnerProfile {
  name: string;
  roleTitle: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  state: string;
  gst: string;
  website: string;
  defaultLimit: string;
}

export interface FuelEntry {
  id: string;
  date: string;
  litres: number;
  cost: number;
  odometer?: number;
  type?: string;
  notes?: string;
}

export interface Camera {
  id: string;
  reg: string;
  label: string;
  url: string;
  type?: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  clientId: string;
  assetReg?: string;
  items: InvoiceItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue';
  paidAmount?: number;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method?: string;
  reference?: string;
}

export interface CreditNote {
  id: string;
  number: string;
  date: string;
  invoiceId: string;
  amount: number;
  reason?: string;
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  validUntil?: string;
  clientId: string;
  assetReg?: string;
  items: InvoiceItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
}

export interface Proforma {
  id: string;
  number: string;
  date: string;
  clientId: string;
  assetReg?: string;
  items: InvoiceItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: string;
  quotationId?: string;
  notes?: string;
}

export interface Challan {
  id: string;
  number: string;
  date: string;
  clientId: string;
  assetReg?: string;
  site?: string;
  items: InvoiceItem[];
  status: string;
  notes?: string;
}

export interface TimesheetEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursDecimal: number;
  operatorId?: string;
  notes?: string;
}

export interface ComplianceRecord {
  insurance?: { date: string; notes?: string };
  rto?: { date: string; notes?: string };
  fitness?: { date: string; notes?: string };
}

export interface MaintenanceRecord {
  [reg: string]: Array<{ id: string; date: string; type: string; cost?: number; notes?: string }>;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
  timestamp: string;
  read?: boolean;
}

export interface BlackbuckVehicle {
  registration_number: string;
  status: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  last_updated?: string;
  [key: string]: unknown;
}

export interface BlackbuckData {
  vehicles: BlackbuckVehicle[];
  [key: string]: unknown;
}

export interface AppState {
  cranes: Crane[];
  operators: Operator[];
  operatorProfiles: OperatorProfile;
  ownerProfile: OwnerProfile;
  fuelLogs: Record<string, FuelEntry[]>;
  cameras: Camera[];
  integrations: { fuel: Record<string, unknown>; cameras: Record<string, unknown> };
  advancePayments: Record<string, unknown>;
  diagnostics: Record<string, unknown>;
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  creditNotes: CreditNote[];
  quotations: Quotation[];
  proformas: Proforma[];
  challans: Challan[];
  files: Record<string, unknown[]>;
  timesheets: Record<string, TimesheetEntry[]>;
  compliance: Record<string, ComplianceRecord>;
  maintenance: MaintenanceRecord;
  notifications: Notification[];
  opNotifications: Record<string, Notification[]>;
}
