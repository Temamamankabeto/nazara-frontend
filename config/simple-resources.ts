import type { SimpleResourceConfig } from '@/components/common/simple-resource-page';

export const simpleResources = {
  products: {
    title: 'Products',
    description: 'Simple product list, create and edit screen.',
    endpoint: '/products',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'category.name', label: 'Category' },
      { key: 'unit_price', label: 'Price', money: true },
      { key: 'reorder_level', label: 'Reorder' },
      { key: 'is_active', label: 'Status', badge: true },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'sku', label: 'SKU', required: true },
      { name: 'product_category_id', label: 'Category ID', type: 'number', required: true },
      { name: 'supplier_id', label: 'Supplier ID', type: 'number' },
      { name: 'unit_price', label: 'Unit Price', type: 'number', required: true },
      { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
    ],
  },
  warehouses: {
    title: 'Warehouses', endpoint: '/warehouses',
    columns: [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'branch.name', label: 'Branch' }, { key: 'is_active', label: 'Status', badge: true }],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true }, { name: 'branch_id', label: 'Branch ID', type: 'number' }, { name: 'address', label: 'Address' }],
  },
  suppliers: {
    title: 'Suppliers', endpoint: '/suppliers',
    columns: [{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'is_active', label: 'Status', badge: true }],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'address', label: 'Address' }],
  },
  branches: {
    title: 'Branches', endpoint: '/branches',
    columns: [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'city', label: 'City' }, { key: 'is_active', label: 'Status', badge: true }],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true }, { name: 'city', label: 'City' }, { name: 'address', label: 'Address' }],
  },
  customers: {
    title: 'Customers', endpoint: '/customers',
    description: 'Customer list with balance access and payment history from each customer profile.',
    detailBasePath: '/customers',
    detailLabel: 'Balance & Payment History',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'customer_type', label: 'Type', badge: true },
      { key: 'region', label: 'Region' },
      { key: 'credit_limit', label: 'Credit Limit', money: true },
      { key: 'current_balance', label: 'Balance', money: true },
      { key: 'is_active', label: 'Status', badge: true },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'customer_type', label: 'Customer Type', type: 'select', required: true, defaultValue: 'distributor', options: [
        { value: 'distributor', label: 'Distributor' },
        { value: 'retailer', label: 'Retailer' },
        { value: 'supermarket', label: 'Supermarket' },
        { value: 'institutional_buyer', label: 'Institutional Buyer' },
      ] },
      { name: 'price_level', label: 'Price Level', type: 'select', defaultValue: 'standard', options: [
        { value: 'standard', label: 'Standard' },
        { value: 'wholesale_a', label: 'Wholesale A' },
        { value: 'wholesale_b', label: 'Wholesale B' },
        { value: 'retail', label: 'Retail' },
      ] },
      { name: 'region', label: 'Region' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'credit_limit', label: 'Credit Limit', type: 'number', defaultValue: 0 },
      { name: 'opening_balance', label: 'Opening Balance', type: 'number', defaultValue: 0 },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  invoices: {
    title: 'Invoices', endpoint: '/invoices', canCreate: false, canEdit: false, canDelete: false,
    columns: [{ key: 'invoice_no', label: 'Invoice No' }, { key: 'customer.name', label: 'Customer' }, { key: 'total_amount', label: 'Total', money: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [],
  },
  payments: {
    title: 'Payments', endpoint: '/payments', canCreate: false, canEdit: false, canDelete: false,
    columns: [{ key: 'reference_no', label: 'Reference' }, { key: 'customer.name', label: 'Customer' }, { key: 'amount', label: 'Amount', money: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [],
  },
  salesOrders: {
    title: 'Sales Orders', endpoint: '/sales-orders', canCreate: false, canEdit: false, canDelete: false,
    columns: [{ key: 'order_no', label: 'Order No' }, { key: 'customer.name', label: 'Customer' }, { key: 'total_amount', label: 'Total', money: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [],
  },
  returns: {
    title: 'Returns', endpoint: '/returns', canCreate: false, canEdit: false, canDelete: false,
    columns: [{ key: 'return_no', label: 'Return No' }, { key: 'customer.name', label: 'Customer' }, { key: 'total_amount', label: 'Total', money: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [],
  },
} satisfies Record<string, SimpleResourceConfig>;
