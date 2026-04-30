import { Suspense } from 'react';
import CustomerPaymentHistoryPage from '@/components/dwms/customer-payment-history-page';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading customer payment history...</div>}>
      <CustomerPaymentHistoryPage />
    </Suspense>
  );
}
