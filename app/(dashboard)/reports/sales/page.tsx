import Link from 'next/link';
import { BarChart3, CalendarDays, PackageSearch, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const reports = [
  {
    title: 'Daily Sales',
    description: 'Daily sales totals, orders, discounts, tax, and revenue.',
    href: '/reports/sales/daily',
    icon: CalendarDays,
  },
  {
    title: 'Customer Purchase History',
    description: 'Sales contribution by distributor/customer and purchase activity.',
    href: '/reports/sales/by-distributor',
    icon: Users,
  },
  {
    title: 'Outstanding Balances',
    description: 'Customers with unpaid invoices and remaining credit balances.',
    href: '/reports/finance/customer-balances',
    icon: Wallet,
  },
  {
    title: 'Product-wise Sales',
    description: 'Best-selling products by quantity and sales value.',
    href: '/reports/sales/top-products',
    icon: PackageSearch,
  },
];

export default function SalesReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales Reports</h1>
        <p className="text-sm text-muted-foreground">
          Sales Officer reports for daily sales, customer history, outstanding balances, and product-wise sales.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="h-full transition hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{report.description}</CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" /> Sales Officer Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          These reports are scoped to the logged-in Sales Officer using branch_id, sales_officer_id, created_by, and scope=sales
          parameters when the backend supports them.
        </CardContent>
      </Card>
    </div>
  );
}
