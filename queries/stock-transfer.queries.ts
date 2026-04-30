import { useQuery } from '@tanstack/react-query';
import { getStockTransfers } from '@/services/stock-transfer.service';
import type { StockTransferFilters } from '@/types/stock-transfer.types';

export const stockTransferKeys = {
  all: ['stock-transfers'] as const,
  list: (filters: StockTransferFilters) => [...stockTransferKeys.all, 'list', filters] as const,
};

export function useStockTransfersQuery(filters: StockTransferFilters = {}) {
  return useQuery({ queryKey: stockTransferKeys.list(filters), queryFn: () => getStockTransfers(filters) });
}
