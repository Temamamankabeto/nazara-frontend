export interface DwmsNotification {
  id: string;
  type?: string;
  notifiable_type?: string;
  data?: {
    title?: string;
    message?: string;
    module?: string;
    category?: 'low_stock' | 'overdue_invoice' | 'sales' | 'purchase' | string;
    url?: string;
    product_id?: number | string;
    invoice_id?: number | string;
    order_id?: number | string;
    amount?: number;
    [key: string]: unknown;
  };
  read_at?: string | null;
  created_at?: string;
}

export interface NotificationFilters {
  page?: number;
  per_page?: number;
  unread?: boolean;
  type?: string;
  search?: string;
}

export interface NotificationResponse {
  success?: boolean;
  message?: string;
  data: DwmsNotification[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number };
}

export interface UnreadNotificationResponse {
  success?: boolean;
  message?: string;
  data: { unread_count: number };
}
