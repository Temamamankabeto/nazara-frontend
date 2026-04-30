export interface ProductCategoryLite {
  id: number | string;
  name: string;
  code?: string;
}

export interface SupplierLite {
  id: number | string;
  name: string;
  code?: string;
  branch_id?: number | string | null;
}

export interface ProductPriceTier {
  name: string;
  min_quantity: number;
  price: number;
}

export interface ProductRow {
  id: number | string;
  product_category_id: number | string;
  supplier_id?: number | string | null;
  name: string;
  sku: string;
  barcode?: string | null;
  package_size?: string | null;
  unit_of_measure?: string | null;
  unit_price: number | string;
  reorder_level?: number | string | null;
  current_stock?: number | string | null;
  stock_quantity?: number | string | null;
  wholesale_price_tiers?: ProductPriceTier[];
  is_active?: boolean;
  category?: ProductCategoryLite | null;
  supplier?: SupplierLite | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  page?: number;
  per_page?: number;
  search?: string;
  product_category_id?: string | number;
  supplier_id?: string | number;
  active?: '0' | '1' | 'all';
}

export interface ProductFormPayload {
  product_category_id: number;
  supplier_id?: number | null;
  name: string;
  sku: string;
  barcode?: string | null;
  package_size?: string | null;
  unit_of_measure?: string | null;
  unit_price: number;
  reorder_level?: number;
  is_active?: boolean;
}

export interface ProductFormState {
  product_category_id: string;
  supplier_id: string;
  name: string;
  sku: string;
  barcode: string;
  package_size: string;
  unit_of_measure: string;
  unit_price: string;
  reorder_level: string;
  tier_distributor: string;
  tier_wholesale: string;
  tier_bulk: string;
  is_active: boolean;
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

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryLite[] = [
  { id: 1, name: 'Powder Detergent', code: 'POWDER' },
  { id: 2, name: 'Liquid Detergent', code: 'LIQUID' },
  { id: 3, name: 'Bar Soap', code: 'SOAP' },
  { id: 4, name: 'Dishwashing Liquid', code: 'DISH' },
  { id: 5, name: 'Fabric Softener', code: 'SOFTENER' },
];

export const DEFAULT_PACKAGE_UNITS = ['carton', 'box', 'bale', 'pcs', 'bottle', 'sachet', 'kg', 'liter'];
