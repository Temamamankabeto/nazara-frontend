'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import { useCreatePaymentMutation } from '@/hooks/use-payments';
import {
  usePaymentInvoicesQuery,
  usePaymentsQuery,
} from '@/queries/payment.queries';
import { openPaymentReceipt } from '@/services/payment.service';import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type PaymentMethod,
  type PaymentStatus,
} from '@/types/payment.types';

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function statusVariant(status: string) {
  if (status === 'verified') return 'default';
  if (status === 'failed' || status === 'returned') return 'destructive';
  return 'secondary';
}

function getInitialForm() {
  return {
    invoice_id: '',
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    method: 'cash',
    reference: '',
    status: 'recorded',
    notes: '',
    receipt: null as File | null,
  };
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [method, setMethod] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(getInitialForm());

  const paymentsQuery = usePaymentsQuery({
    page,
    per_page: 10,
    status,
    method,
  });

  const invoicesQuery = usePaymentInvoicesQuery();
  const createMutation = useCreatePaymentMutation();

  const rows = paymentsQuery.data?.data ?? [];

  const invoices = (invoicesQuery.data?.data ?? []).filter(
    (invoice) => Number(invoice.balance ?? 0) > 0,
  );

  const meta = paymentsQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const overdueCount = invoices.filter((invoice) => {
    if (!invoice.due_date) return false;
    return new Date(invoice.due_date) < new Date();
  }).length;

async function openReceipt(paymentId: string | number) {
  try {
    await openPaymentReceipt(paymentId);
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ??
        error?.message ??
        'Could not open receipt',
    );
  }
}

  function selectInvoice(id: string) {
    const invoice = invoices.find((item) => String(item.id) === id);

    setForm((current) => ({
      ...current,
      invoice_id: id,
      amount: String(invoice?.balance ?? ''),
    }));
  }

  async function submitPayment() {
    if (!form.invoice_id || Number(form.amount) <= 0) {
      toast.error('Select invoice and enter amount');
      return;
    }

    try {
      await createMutation.mutateAsync({
        invoice_id: Number(form.invoice_id),
        payment_date: form.payment_date,
        amount: Number(form.amount),
        method: form.method as PaymentMethod,
        reference: form.reference || null,
        notes: form.notes || null,
        status: form.status as PaymentStatus,
        receipt: form.receipt,
      });

      toast.success(
        'Payment recorded, invoice balance updated, and customer ledger credited',
      );

      setOpen(false);
      setForm(getInitialForm());
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not record payment',
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Record cash, bank transfer, mobile payment, and credit settlement
            against invoices with partial-payment support.
          </p>
        </div>

        <Button
          onClick={() => {
            setForm(getInitialForm());
            setOpen(true);
          }}
        >
          Record payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Collected on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money(
                rows.reduce(
                  (sum, payment) => sum + Number(payment.amount ?? 0),
                  0,
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overdue invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Payment list</CardTitle>
            <p className="text-sm text-muted-foreground">
              Backend endpoint: /payments.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PAYMENT_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={method}
              onValueChange={(value) => {
                setPage(1);
                setMethod(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Method" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                {PAYMENT_METHODS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paymentsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading payments...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No payments found.</TableCell>
                </TableRow>
              ) : (
                rows.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>

                    <TableCell>
                      {payment.invoice?.invoice_number ?? payment.invoice_id}
                    </TableCell>

                    <TableCell>
                      {payment.customer?.name ?? payment.customer_id}
                    </TableCell>

                    <TableCell className="capitalize">
                      {String(payment.method).replaceAll('_', ' ')}
                    </TableCell>

                    <TableCell>{money(payment.amount)}</TableCell>

                    <TableCell>
                      <Badge
                        variant={statusVariant(String(payment.status)) as any}
                        className="capitalize"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {payment.receipt_path ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReceipt(payment.id)}
                        >
                          Receipt
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No file
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.current_page} of {meta.last_page}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record customer payment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Invoice</Label>
              <Select value={form.invoice_id} onValueChange={selectInvoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unpaid/partial invoice" />
                </SelectTrigger>

                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={String(invoice.id)}>
                      {invoice.invoice_number ?? `INV-${invoice.id}`} •{' '}
                      {invoice.customer?.name ?? invoice.customer_id} • Balance{' '}
                      {money(invoice.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment date</Label>
              <Input
                type="date"
                value={form.payment_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment_date: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={form.method}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    method: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAYMENT_METHODS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAYMENT_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Reference</Label>
              <Input
                value={form.reference}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reference: event.target.value,
                  }))
                }
                placeholder="Bank ref, mobile ref, receipt no."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Receipt file</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    receipt: event.target.files?.[0] ?? null,
                  }))
                }
              />
              {form.receipt ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {form.receipt.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Optional payment note..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button onClick={submitPayment} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}