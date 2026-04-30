// inventory.types.ts
import type { ProductRow, PaginatedResponse } from './product.types';
import type { WarehouseRow } from './warehouse.types';

// ============ Re-export for convenience ============
export type { ProductRow, PaginatedResponse } from './product.types';
export type { WarehouseRow } from './warehouse.types';

// ============ Stock Movement Types ============
export type StockMovementType = 
  | 'purchase'      // Stock received from supplier
  | 'sale'          // Stock sold to customer
  | 'transfer_in'   // Stock received from another warehouse
  | 'transfer_out'  // Stock sent to another warehouse
  | 'return'        // Stock returned from customer
  | 'adjustment'    // Manual stock adjustment
  | 'damage'        // Stock damaged and removed
  | 'initial_stock'; // Initial stock entry

export type StockTransferStatus = 'draft' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
export type StockMovementStatus = 'pending' | 'completed' | 'cancelled';

// ============ Stock Balance Row / Inventory Product Index ============
// Backend /reports/stock-balance now starts from products and attaches inventory fields.
export interface StockBalanceRow extends ProductRow {
  product_id: number;
  warehouse_id?: number | null;
  stock_balance: number | string;
  movements_count?: number | string;
  adjustments_count?: number | string;
  last_movement_type?: StockMovementType | null;
  last_unit_cost?: number | string | null;
  stock_value?: number | string | null;
  product?: ProductRow;
  warehouse?: WarehouseRow;
  is_low_stock?: boolean;
}

// ============ Low Stock Row ============
export interface LowStockRow extends ProductRow {
  current_stock: number;      // Made required (overrides ProductRow's optional)
  warehouse_id?: number;      // Which warehouse has low stock
  warehouse_name?: string;    // Warehouse name for context
}

// ============ Stock Movement Row ============
export interface StockMovementRow {
  id: number;
  product_id: number;
  warehouse_id: number;
  movement_type: StockMovementType;
  quantity: number;
  unit_cost?: number | null;
  reference_type?: string | null;  // e.g., 'sales_order', 'purchase_order', 'stock_transfer'
  reference_id?: number | null;
  notes?: string | null;
  performed_by?: number | null;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  product?: ProductRow;
  warehouse?: WarehouseRow;
  performedBy?: {
    id: number;
    name: string;
    email?: string;
  };
}

// ============ Stock Transfer Item Row ============
export interface StockTransferItemRow {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  quantity: number;
  received_quantity: number;
  product?: ProductRow;
}

// ============ Stock Transfer Row ============
export interface StockTransferRow {
  id: number;
  branch_id: number;
  transfer_number: string;
  from_warehouse_id: number;
  to_warehouse_id: number;
  transfer_date: string;
  status: StockTransferStatus;
  notes?: string | null;
  requested_by?: number | null;
  approved_by?: number | null;
  cancelled_by?: number | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  branch?: {
    id: number;
    name: string;
    code?: string | null;
  };
  from_warehouse?: WarehouseRow;
  to_warehouse?: WarehouseRow;
  requester?: {
    id: number;
    name: string;
  };
  approver?: {
    id: number;
    name: string;
  };
  items?: StockTransferItemRow[];
}

// ============ Stock Valuation Types ============
export interface StockValuationRow {
  product_id: number;
  warehouse_id: number;
  stock_balance: number;
  last_unit_cost: number;      // Last known unit cost from movements
  stock_value: number;          // balance * last_unit_cost
  avg_cost?: number;            // Average cost (alternative valuation method)
  product?: ProductRow;
  warehouse?: WarehouseRow;
}

export interface StockValuationSummary {
  summary?: {
    total_inbound?: number | string;
    total_outbound?: number | string;
    net_stock?: number | string;
  };
  total_value?: number | string;
  total_quantity?: number | string;
  warehouse_count?: number;
  product_count?: number;
  by_warehouse?: Array<{
    warehouse_id: number;
    warehouse_name: string;
    value: number;
    quantity: number;
  }>;
  by_category?: Array<{
    category_id: number;
    category_name: string;
    value: number;
    quantity: number;
  }>;
}

// ============ Filter Types ============
export interface InventoryFilters {
  warehouse_id?: number | 'all';
  product_id?: number | 'all';
  movement_type?: StockMovementType | 'all';
  branch_id?: number | null;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface TransferFilters {
  warehouse_id?: number | 'all';
  status?: StockTransferStatus | 'all';
  branch_id?: number | null;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

// ============ Request/Response Payloads ============
export interface StockAdjustmentPayload {
  product_id: number;
  warehouse_id: number;
  movement_type: 'adjustment' | 'damage';
  quantity: number;           // Positive = add, Negative = remove
  unit_cost?: number | null;  // Required for positive adjustments
  reason: string;
  notes?: string | null;
}

export interface BatchAdjustmentPayload {
  adjustments: StockAdjustmentPayload[];
  global_reason?: string;
}

export interface CreateTransferPayload {
  from_warehouse_id: number;
  to_warehouse_id: number;
  transfer_date: string;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface ApproveTransferPayload {
  transfer_id: number;
}

export interface CompleteTransferPayload {
  transfer_id: number;
}

export interface CancelTransferPayload {
  transfer_id: number;
  reason: string;
}

// ============ Response Types ============
export interface StockBalanceResponse {
  success: boolean;
  message: string;
  data: StockBalanceRow[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface StockMovementResponse {
  success: boolean;
  message: string;
  data: StockMovementRow[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface StockTransferResponse {
  success: boolean;
  message: string;
  data: StockTransferRow[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface StockValuationResponse {
  success: boolean;
  message: string;
  data: StockValuationRow[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// ============ Dashboard & Analytics Types ============
export interface InventoryDashboardStats {
  total_stock_value: number;
  total_stock_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
  active_warehouses: number;
  active_products: number;
  pending_transfers: number;
  recent_movements_count: number;
}

export interface StockMovementSummary {
  date: string;
  inbound_quantity: number;
  inbound_value: number;
  outbound_quantity: number;
  outbound_value: number;
  net_change: number;
}

// ============ Constants ============
export const STOCK_MOVEMENT_TYPES: Array<{ value: StockMovementType; label: string; icon: string; color: string }> = [
  { value: 'purchase', label: 'Purchase', icon: 'PlusCircle', color: 'green' },
  { value: 'sale', label: 'Sale', icon: 'MinusCircle', color: 'red' },
  { value: 'transfer_in', label: 'Transfer In', icon: 'ArrowDownCircle', color: 'blue' },
  { value: 'transfer_out', label: 'Transfer Out', icon: 'ArrowUpCircle', color: 'blue' },
  { value: 'return', label: 'Return', icon: 'RefreshCw', color: 'orange' },
  { value: 'adjustment', label: 'Adjustment', icon: 'Settings', color: 'purple' },
  { value: 'damage', label: 'Damage', icon: 'Trash2', color: 'red' },
  { value: 'initial_stock', label: 'Initial Stock', icon: 'Database', color: 'gray' },
];

export const STOCK_TRANSFER_STATUSES: Array<{ value: StockTransferStatus; label: string; color: string }> = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'approved', label: 'Approved', color: 'blue' },
  { value: 'in_transit', label: 'In Transit', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  warehouse_id: 'all',
  product_id: 'all',
  movement_type: 'all',
  branch_id: null,
  page: 1,
  per_page: 20,
};

export const DEFAULT_TRANSFER_FILTERS: TransferFilters = {
  warehouse_id: 'all',
  status: 'all',
  branch_id: null,
  page: 1,
  per_page: 20,
};

export const DEFAULT_STOCK_ADJUSTMENT: StockAdjustmentPayload = {
  product_id: 0,
  warehouse_id: 0,
  movement_type: 'adjustment',
  quantity: 0,
  unit_cost: null,
  reason: '',
  notes: '',
};

// ============ Type Guard Functions ============
export function isPositiveMovement(movement: StockMovementRow): boolean {
  return movement.quantity > 0;
}

export function isNegativeMovement(movement: StockMovementRow): boolean {
  return movement.quantity < 0;
}

export function isTransferCompleted(transfer: StockTransferRow): boolean {
  return transfer.status === 'completed';
}

export function isTransferCancellable(transfer: StockTransferRow): boolean {
  return transfer.status === 'draft' || transfer.status === 'approved';
}

export function isTransferInTransit(transfer: StockTransferRow): boolean {
  return transfer.status === 'in_transit';
}

export function isLowStock(product: ProductRow, currentStock: number): boolean {
  const reorderLevel = typeof product.reorder_level === 'string' 
    ? parseFloat(product.reorder_level) 
    : (product.reorder_level || 0);
  return currentStock <= reorderLevel;
}

export function isOutOfStock(currentStock: number): boolean {
  return currentStock <= 0;
}

export function calculateStockValue(stockBalance: number, unitPrice: number | string): number {
  const price = typeof unitPrice === 'string' ? parseFloat(unitPrice) : unitPrice;
  return stockBalance * price;
}

// ============ Utility Functions for UI ============
export function formatStockQuantity(quantity: number | string | undefined | null): string {
  if (quantity === undefined || quantity === null) return '0';
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return num.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export function formatStockValue(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getMovementTypeLabel(type: StockMovementType): string {
  return STOCK_MOVEMENT_TYPES.find(t => t.value === type)?.label || type;
}

export function getMovementTypeIcon(type: StockMovementType): string {
  return STOCK_MOVEMENT_TYPES.find(t => t.value === type)?.icon || 'Package';
}

export function getMovementTypeColor(type: StockMovementType): string {
  return STOCK_MOVEMENT_TYPES.find(t => t.value === type)?.color || 'gray';
}

export function getTransferStatusLabel(status: StockTransferStatus): string {
  return STOCK_TRANSFER_STATUSES.find(s => s.value === status)?.label || status;
}

export function getTransferStatusColor(status: StockTransferStatus): string {
  return STOCK_TRANSFER_STATUSES.find(s => s.value === status)?.color || 'gray';
}

export function getStockStatusBadge(stock: number, reorderLevel: number | string | null | undefined): {
  label: string;
  color: string;
  variant: 'default' | 'destructive' | 'warning' | 'success';
} {
  const level = typeof reorderLevel === 'string' ? parseFloat(reorderLevel) : (reorderLevel || 0);
  
  if (stock <= 0) {
    return { label: 'Out of Stock', color: 'red', variant: 'destructive' };
  }
  if (stock <= level) {
    return { label: 'Low Stock', color: 'orange', variant: 'warning' };
  }
  return { label: 'In Stock', color: 'green', variant: 'success' };
}

// ============ Type for Paginated Response (re-export) ============

export interface WarehouseSummaryRow extends WarehouseRow {
  stock_movements_count?: number;
}

export type InventoryPaginatedResponse<T> = PaginatedResponse<T>;
