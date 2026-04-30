export interface CompanyProfileSettings {
  company_name: string;
  legal_name?: string;
  tin_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
}

export interface TaxSettings {
  enabled: boolean;
  tax_name: string;
  rate: number;
  tax_inclusive?: boolean;
}

export interface InvoiceSettings {
  invoice_prefix: string;
  next_invoice_number?: number;
  due_days: number;
  show_tax_breakdown: boolean;
  footer_note?: string;
}

export interface PaymentMethodSettings {
  cash: boolean;
  bank_transfer: boolean;
  mobile_payment: boolean;
  credit_settlement: boolean;
  bank_account_name?: string;
  bank_account_number?: string;
  mobile_merchant_code?: string;
}

export interface BranchSystemSettings {
  default_branch_id?: string | number | null;
  default_warehouse_id?: string | number | null;
  allow_negative_stock: boolean;
  require_sales_approval: boolean;
  require_purchase_approval: boolean;
}

export interface SystemSettings {
  company_profile: CompanyProfileSettings;
  tax: TaxSettings;
  invoice: InvoiceSettings;
  payment_methods: PaymentMethodSettings;
  branch_system: BranchSystemSettings;
}

export interface SettingsResponse { success?: boolean; message?: string; data: SystemSettings; }
