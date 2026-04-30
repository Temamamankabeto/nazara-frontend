export interface DashboardSummary {
  sales_total: number;
  collections_total: number;
  receivables_total: number;
  active_products: number;
  low_stock_items: number;
  overdue_invoices: number;
}

export interface DashboardResponse { success?: boolean; message?: string; data: DashboardSummary; }
