import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment } from '@/services/payment.service';
import { paymentKeys } from '@/queries/payment.queries';
import { invoiceKeys } from '@/queries/invoice.queries';

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
