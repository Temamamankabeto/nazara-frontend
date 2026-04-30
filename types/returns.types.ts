import type { BranchRow } from './branch.types';
import type { CustomerLite, ProductLite, SalesOrderRow, UserLite, WarehouseLite } from './sales-order.types';
import type { SupplierRow } from './supplier.types';
import type { PurchaseOrderRow } from './purchase.types';

export type ReturnType = 'customer_return' | 'damaged_goods' | 'expired_goods' | 'supplier_return';
export type ReturnStatus = 'pending' | 'approved' | 'processed' | 'cancelled' | string;

export interface ReturnItemRow { id?: number | string; product_id: number | string; quantity: number | string; unit_price?: number | string; line_total?: number | string; reason?: string | null; product?: ProductLite | null; }
export interface ReturnRow {
  id: number | string; branch_id?: number | string | null; return_number?: string | null; return_type: ReturnType | string; status: ReturnStatus;
  customer_id?: number | string | null; supplier_id?: number | string | null; warehouse_id: number | string; sales_order_id?: number | string | null; purchase_order_id?: number | string | null;
  return_date: string; reason?: string | null; notes?: string | null; total_amount?: number | string; processed_at?: string | null; approved_at?: string | null;
  branch?: BranchRow | null; customer?: CustomerLite | null; supplier?: SupplierRow | null; warehouse?: WarehouseLite | null; sales_order?: SalesOrderRow | null; purchase_order?: PurchaseOrderRow | null; items?: ReturnItemRow[]; creator?: UserLite | null; approver?: UserLite | null;
}
export interface ReturnFilters { page?: number; per_page?: number; status?: string; return_type?: string; branch_id?: string | number | null; }
export interface ReturnItemPayload { product_id: number; quantity: number; unit_price?: number; reason?: string | null; }
export interface ReturnFormPayload { return_type: ReturnType; customer_id?: number | null; supplier_id?: number | null; warehouse_id: number; sales_order_id?: number | null; purchase_order_id?: number | null; return_date: string; reason?: string | null; notes?: string | null; items: ReturnItemPayload[]; }
export interface PaginatedResponse<T> { success?: boolean; message?: string; data: T[]; meta?: { current_page: number; per_page: number; total: number; last_page: number }; }
export const RETURN_TYPES = [
  { value: 'customer_return', label: 'Customer return' },
  { value: 'damaged_goods', label: 'Damaged goods' },
  { value: 'expired_goods', label: 'Expired goods' },
  { value: 'supplier_return', label: 'Supplier return' },
];
export const RETURN_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processed', label: 'Processed' },
  { value: 'cancelled', label: 'Cancelled' },
];
