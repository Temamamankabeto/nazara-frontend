export interface CustomerLite { id: number | string; name: string; phone?: string | null; customer_type?: string | null; }
export interface WarehouseLite { id: number | string; name: string; code?: string | null; branch_id?: number | string | null; }
export interface ProductLite { id: number | string; name: string; sku?: string | null; unit_price?: number | string | null; }
export interface UserLite { id: number | string; name: string; }

export type SalesOrderStatus = 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';

export interface SalesOrderItemRow {
  id?: number | string;
  product_id: number | string;
  quantity: number | string;
  unit_price: number | string;
  line_total?: number | string;
  product?: ProductLite | null;
}

export interface SalesOrderRow {
  id: number | string;
  branch_id?: number | string | null;
  order_number?: string | null;
  customer_id: number | string;
  warehouse_id: number | string;
  sales_officer_id?: number | string | null;
  status: SalesOrderStatus | string;
  order_date: string;
  delivery_date?: string | null;
  notes?: string | null;
  subtotal?: number | string;
  discount?: number | string;
  tax?: number | string;
  transport_charge?: number | string;
  total?: number | string;
  customer?: CustomerLite | null;
  warehouse?: WarehouseLite | null;
  sales_officer?: UserLite | null;
  salesOfficer?: UserLite | null;
  items?: SalesOrderItemRow[];
  created_at?: string;
  updated_at?: string;
}

export interface SalesOrderFilters {
  page?: number;
  per_page?: number;
  status?: string;
  branch_id?: string | number | null;
}

export interface SalesOrderItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface SalesOrderFormPayload {
  customer_id: number;
  warehouse_id: number;
  order_date: string;
  delivery_date?: string | null;
  notes?: string | null;
  discount?: number;
  tax?: number;
  transport_charge?: number;
  items: SalesOrderItemPayload[];
}

export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data: T[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number };
}

export const SALES_ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
