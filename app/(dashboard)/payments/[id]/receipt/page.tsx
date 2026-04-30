'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPaymentReceiptUrl } from '@/services/payment.service';

export default function PaymentReceiptPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    window.location.replace(getPaymentReceiptUrl(id));
  }, [id]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold">Opening receipt...</h1>
        <p className="text-sm text-muted-foreground">
          Redirecting to payment receipt file
        </p>
      </div>
    </div>
  );
}