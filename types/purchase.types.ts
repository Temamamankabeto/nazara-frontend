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

export type PurchaseStatus = 'draft' | 'partial_received' | 'received' | 'cancelled' | string;

export interface PurchaseSupplierLite {
  id: number | string;
  name: string;
  phone?: string | null;
  email?: string | null;
}

export interface PurchaseWarehouseLite {
  id: number | string;
  name: string;
  code?: string | null;
}

export interface PurchaseBranchLite {
  id: number | string;
  name: string;
}

export interface PurchaseProductLite {
  id: number | string;
  name: string;
  sku?: string | null;
  package_size?: string | null;
  unit_price?: number | string | null;
  current_stock?: number | string | null;
}

export interface PurchaseOrderItemRow {
  id: number | string;
  purchase_order_id?: number | string;
  product_id: number | string;
  ordered_quantity: number | string;
  received_quantity: number | string;
  unit_cost: number | string;
  line_total: number | string;
  product?: PurchaseProductLite | null;
}

export interface PurchaseOrderRow {
  id: number | string;
  branch_id?: number | string | null;
  po_number: string;
  supplier_id: number | string;
  warehouse_id: number | string;
  ordered_by?: number | string | null;
  status: PurchaseStatus;
  order_date: string;
  expected_date?: string | null;
  supplier_invoice_number?: string | null;
  notes?: string | null;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  branch?: PurchaseBranchLite | null;
  supplier?: PurchaseSupplierLite | null;
  warehouse?: PurchaseWarehouseLite | null;
  items?: PurchaseOrderItemRow[];
  ordered_by_user?: { id: number | string; name: string } | null;
  orderedBy?: { id: number | string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseFilters {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface PurchaseRequestItemForm {
  product_id: string;
  ordered_quantity: string;
  unit_cost: string;
}

export interface PurchaseOrderFormState {
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_date: string;
  supplier_invoice_number: string;
  discount: string;
  tax: string;
  notes: string;
  items: PurchaseRequestItemForm[];
}

export interface PurchaseOrderPayload {
  supplier_id: number;
  warehouse_id: number;
  order_date: string;
  expected_date?: string | null;
  supplier_invoice_number?: string | null;
  discount?: number;
  tax?: number;
  notes?: string | null;
  items: {
    product_id: number;
    ordered_quantity: number;
    unit_cost: number;
  }[];
}

export interface ReceivePurchasePayload {
  items: {
    purchase_order_item_id: number | string;
    received_quantity: number;
  }[];
}

export interface SupplierInvoiceRow {
  id: number | string;
  po_number: string;
  supplier_invoice_number?: string | null;
  supplier?: PurchaseSupplierLite | null;
  order_date: string;
  total: number | string;
  status: PurchaseStatus;
}
