export type ReportPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export type ReportFilters = {
  period?: ReportPeriod | string;
  date_from?: string;
  date_to?: string;
  branch_id?: string | number;
  warehouse_id?: string | number;
  customer_id?: string | number;
  supplier_id?: string | number;
  region?: string;
};

export type ReportCard = {
  label: string;
  value: number | string;
  helper?: string;
};

export type ReportRow = Record<string, any>;

export type ReportResponse<T = ReportRow> = {
  success?: boolean;
  message?: string;
  data: T[] | T | any;
  meta?: Record<string, any>;
  summary?: Record<string, any>;
};

export type SalesReportSummary = {
  total_sales?: number;
  total_orders?: number;
  average_order_value?: number;
  total_discount?: number;
  total_tax?: number;
};

export type InventoryReportSummary = {
  total_stock_value?: number;
  low_stock_items?: number;
  total_movements?: number;
  total_adjustments?: number;
};

export type FinancialReportSummary = {
  receivables?: number;
  payables?: number;
  payments_collected?: number;
  profit_estimation?: number;
};

export type OperationalReportSummary = {
  purchase_requests_count?: number;
  purchase_orders_count?: number;
  purchase_orders_total?: number;
  received_quantity?: number;
  received_value?: number;
  supplier_invoice_total?: number;
  supplier_balance_total?: number;
  purchase_total?: number;
  returns_total?: number;
  adjustments_total?: number;
  inactive_customers?: number;
};
