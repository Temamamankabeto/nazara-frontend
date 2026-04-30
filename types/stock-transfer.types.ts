import type { WarehouseRow } from './warehouse.types';
import type { ProductRow } from './product.types';

export type StockTransferStatus = 'draft' | 'approved' | 'in_transit' | 'completed' | 'cancelled' | string;

export interface StockTransferItemRow {
  id?: number | string;
  product_id: number | string;
  quantity: number | string;
  received_quantity?: number | string | null;
  product?: ProductRow | null;
}

export interface StockTransferRow {
  id: number | string;
  branch_id?: number | string | null;
  transfer_number?: string | null;
  from_warehouse_id?: number | string;
  to_warehouse_id?: number | string;
  transfer_date?: string;
  status: StockTransferStatus;
  notes?: string | null;
  from_warehouse?: WarehouseRow | null;
  fromWarehouse?: WarehouseRow | null;
  to_warehouse?: WarehouseRow | null;
  toWarehouse?: WarehouseRow | null;
  items?: StockTransferItemRow[];
  created_at?: string;
  updated_at?: string;
}

export interface StockTransferFilters {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface StockTransferFormPayload {
  from_warehouse_id: number | string;
  to_warehouse_id: number | string;
  transfer_date: string;
  notes?: string | null;
  items: Array<{
    product_id: number | string;
    quantity: number;
  }>;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data: T[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
