'use client';

import { useState } from 'react';

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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

import { useInvoiceQuery, useInvoicesQuery } from '@/queries/invoice.queries';
import { INVOICE_STATUSES, type InvoiceRow } from '@/types/invoice.types';

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
  if (status === 'paid') return 'default';
  if (status === 'partial') return 'secondary';
  if (status === 'void') return 'destructive';
  return 'outline';
}

function printInvoice(invoice: InvoiceRow) {
  const items = invoice.salesOrder?.items ?? invoice.sales_order?.items ?? [];

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.product?.name ?? item.product_id}</td>
          <td>${item.quantity}</td>
          <td>${money(item.unit_price)}</td>
          <td>${money(
            item.line_total ??
              Number(item.quantity) * Number(item.unit_price),
          )}</td>
        </tr>
      `,
    )
    .join('');

  const html = `
    <html>
      <head>
        <title>Invoice ${invoice.invoice_number ?? invoice.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #111;
          }

          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #111;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }

          h1 {
            margin: 0;
            font-size: 28px;
          }

          .muted {
            color: #666;
            font-size: 13px;
          }

          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f3f3f3;
          }

          .summary {
            margin-top: 24px;
            margin-left: auto;
            width: 320px;
          }

          .summary div {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }

          .total {
            font-weight: bold;
            font-size: 18px;
          }

          .footer {
            margin-top: 48px;
            display: flex;
            justify-content: space-between;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div>
            <h1>Invoice</h1>
            <div class="muted">Pearl Detergent</div>
          </div>

          <div>
            <strong>${invoice.invoice_number ?? `INV-${invoice.id}`}</strong><br />
            <span class="muted">Date: ${formatDate(invoice.invoice_date)}</span><br />
            <span class="muted">Due: ${formatDate(invoice.due_date)}</span>
          </div>
        </div>

        <div class="info">
          <div>
            <strong>Bill To</strong><br />
            ${invoice.customer?.name ?? invoice.customer_id ?? '—'}
          </div>

          <div>
            <strong>Sales Order</strong><br />
            ${
              invoice.sales_order?.order_number ??
              invoice.salesOrder?.order_number ??
              invoice.sales_order_id ??
              '—'
            }
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows ||
              '<tr><td colspan="4" style="text-align:center;">No items found</td></tr>'
            }
          </tbody>
        </table>

        <div class="summary">
          <div>
            <span>Total</span>
            <span>${money(invoice.total)}</span>
          </div>

          <div>
            <span>Paid</span>
            <span>${money(invoice.paid_amount)}</span>
          </div>

          <div class="total">
            <span>Balance</span>
            <span>${money(invoice.balance)}</span>
          </div>
        </div>

        <div class="footer">
          <div>Prepared by: ____________________</div>
          <div>Received by: ____________________</div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=700');

  if (!printWindow) {
    alert('Please allow popups to print invoice.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<InvoiceRow | null>(null);

  const invoicesQuery = useInvoicesQuery({
    page,
    per_page: 10,
    status,
  });

  const detailQuery = useInvoiceQuery(selected?.id ?? '', Boolean(selected));

  const rows = invoicesQuery.data?.data ?? [];

  const meta = invoicesQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const detail = detailQuery.data?.data ?? selected;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Track invoices generated when sales orders are dispatched.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Outstanding on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money(rows.reduce((sum, row) => sum + Number(row.balance ?? 0), 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paid on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money(
                rows.reduce(
                  (sum, row) => sum + Number(row.paid_amount ?? 0),
                  0,
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Invoice list</CardTitle>
            <p className="text-sm text-muted-foreground">
            </p>
          </div>

          <div className="max-w-xs">
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
                {INVOICE_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoicesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">
                          {invoice.invoice_number ?? `INV-${invoice.id}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          SO:{' '}
                          {invoice.sales_order?.order_number ??
                            invoice.salesOrder?.order_number ??
                            invoice.sales_order_id ??
                            '-'}
                        </div>
                      </TableCell>

                      <TableCell>
                        {invoice.customer?.name ?? invoice.customer_id}
                      </TableCell>

                      <TableCell>
                        <div>{formatDate(invoice.invoice_date)}</div>
                        {invoice.due_date ? (
                          <div className="text-xs text-muted-foreground">
                            Due: {formatDate(invoice.due_date)}
                          </div>
                        ) : null}
                      </TableCell>

                      <TableCell>{money(invoice.total)}</TableCell>
                      <TableCell>{money(invoice.paid_amount)}</TableCell>
                      <TableCell className="font-semibold">
                        {Number(invoice.balance) > 0 ? money(invoice.balance) : '—'}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={statusVariant(String(invoice.status)) as any}
                          className="capitalize"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelected(invoice)}
                          >
                            View
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printInvoice(invoice)}
                          >
                            Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.current_page} of {meta.last_page} • {meta.total} total invoices
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || invoicesQuery.isLoading}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page || invoicesQuery.isLoading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(value) => !value && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice details</DialogTitle>
          </DialogHeader>

          {detail ? (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Invoice:</span>{' '}
                  {detail.invoice_number ?? detail.id}
                </div>

                <div>
                  <span className="text-muted-foreground">Customer:</span>{' '}
                  {detail.customer?.name ?? detail.customer_id}
                </div>

                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge
                    variant={statusVariant(String(detail.status)) as any}
                    className="capitalize ml-2"
                  >
                    {detail.status}
                  </Badge>
                </div>

                <div>
                  <span className="text-muted-foreground">Balance:</span>{' '}
                  <span className="font-semibold">{money(detail.balance)}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Invoice date:</span>{' '}
                  {formatDate(detail.invoice_date)}
                </div>

                <div>
                  <span className="text-muted-foreground">Due date:</span>{' '}
                  {formatDate(detail.due_date)}
                </div>
              </div>

              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {(detail.salesOrder?.items ?? detail.sales_order?.items ?? []).map(
                      (item: any, index: number) => (
                        <TableRow key={item.id ?? index}>
                          <TableCell>
                            {item.product?.name ?? `Product #${item.product_id}`}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{money(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {money(
                              item.line_total ??
                                Number(item.quantity) *
                                  Number(item.unit_price),
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium mb-2">Payments</div>

                {(detail.payments ?? []).length === 0 ? (
                  <p className="text-muted-foreground">No payments recorded.</p>
                ) : (
                  detail.payments?.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex justify-between border-t py-2 first:border-t-0"
                    >
                      <span>
                        {formatDate(payment.payment_date)} • {payment.method?.replace('_', ' ')}
                      </span>
                      <span className="font-semibold">{money(payment.amount)}</span>
                    </div>
                  ))
                )}
              </div>

              {detail.notes && (
                <div className="rounded-lg border p-3 text-sm">
                  <div className="font-medium mb-1">Notes</div>
                  <p className="text-muted-foreground">{detail.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => printInvoice(detail)}>
                  Print invoice
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}