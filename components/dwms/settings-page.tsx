'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, CreditCard, FileText, Percent, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { useSettingsQuery } from '@/queries/settings.queries';
import { useUpdateSettingsMutation } from '@/hooks/use-settings';
import type { SystemSettings } from '@/types/settings.types';

const defaultSettings: SystemSettings = {
  company_profile: {
    company_name: '',
    legal_name: '',
    tin_number: '',
    phone: '',
    email: '',
    address: '',
  },
  tax: {
    enabled: false,
    tax_inclusive: false,
    tax_name: 'VAT',
    rate: 15,
  },
  invoice: {
    invoice_prefix: 'INV',
    due_days: 0,
    show_tax_breakdown: true,
    footer_note: '',
  },
  payment_methods: {
    cash: true,
    bank_transfer: true,
    mobile_payment: true,
    credit_settlement: true,
    bank_account_name: '',
    bank_account_number: '',
  },
  branch_system: {
    default_branch_id: '',
    default_warehouse_id: '',
    allow_negative_stock: false,
    require_sales_approval: true,
    require_purchase_approval: true,
  },
};

function normalizeSettings(data?: Partial<SystemSettings> | null): SystemSettings {
  return {
    ...defaultSettings,
    ...(data ?? {}),
    company_profile: {
      ...defaultSettings.company_profile,
      ...(data?.company_profile ?? {}),
    },
    tax: {
      ...defaultSettings.tax,
      ...(data?.tax ?? {}),
    },
    invoice: {
      ...defaultSettings.invoice,
      ...(data?.invoice ?? {}),
    },
    payment_methods: {
      ...defaultSettings.payment_methods,
      ...(data?.payment_methods ?? {}),
    },
    branch_system: {
      ...defaultSettings.branch_system,
      ...(data?.branch_system ?? {}),
    },
  };
}

export default function SettingsPage() {
  const settingsQuery = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();

  const [form, setForm] = useState<SystemSettings>(defaultSettings);

  useEffect(() => {
    setForm(normalizeSettings(settingsQuery.data?.data));
  }, [settingsQuery.data]);

  async function save() {
    try {
      const res = await updateMutation.mutateAsync(form);
      toast.success(res?.message ?? 'Settings saved');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Could not save settings');
    }
  }

  if (settingsQuery.isLoading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Settings className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Company profile, tax, invoice, payment methods, and branch/system configuration.
          </p>
        </div>

        <Button onClick={save} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save settings'}
        </Button>
      </div>

      {settingsQuery.isError && (
        <Card className="border-amber-200">
          <CardContent className="pt-6 text-sm text-amber-800">
            Settings are using default local values because backend settings could not be loaded.
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company profile
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input
                  value={form.company_profile.company_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_profile: {
                        ...form.company_profile,
                        company_name: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Legal name</Label>
                <Input
                  value={form.company_profile.legal_name ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_profile: {
                        ...form.company_profile,
                        legal_name: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>TIN number</Label>
                <Input
                  value={form.company_profile.tin_number ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_profile: {
                        ...form.company_profile,
                        tin_number: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.company_profile.phone ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_profile: {
                        ...form.company_profile,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.company_profile.email ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_profile: {
                        ...form.company_profile,
                        email: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={form.company_profile.address ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_profile: {
                        ...form.company_profile,
                        address: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Tax settings
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.tax.enabled}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      tax: { ...form.tax, enabled: Boolean(checked) },
                    })
                  }
                />
                Enable tax calculation
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.tax.tax_inclusive ?? false}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      tax: { ...form.tax, tax_inclusive: Boolean(checked) },
                    })
                  }
                />
                Tax inclusive pricing
              </label>

              <div className="space-y-2">
                <Label>Tax name</Label>
                <Input
                  value={form.tax.tax_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tax: { ...form.tax, tax_name: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Rate (%)</Label>
                <Input
                  type="number"
                  value={form.tax.rate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tax: { ...form.tax, rate: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice settings
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Invoice prefix</Label>
                <Input
                  value={form.invoice.invoice_prefix}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invoice: {
                        ...form.invoice,
                        invoice_prefix: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Due days</Label>
                <Input
                  type="number"
                  value={form.invoice.due_days}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invoice: {
                        ...form.invoice,
                        due_days: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.invoice.show_tax_breakdown}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      invoice: {
                        ...form.invoice,
                        show_tax_breakdown: Boolean(checked),
                      },
                    })
                  }
                />
                Show tax breakdown
              </label>

              <div className="space-y-2 md:col-span-2">
                <Label>Footer note</Label>
                <Textarea
                  value={form.invoice.footer_note ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invoice: {
                        ...form.invoice,
                        footer_note: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment method settings
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.payment_methods.cash}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      payment_methods: {
                        ...form.payment_methods,
                        cash: Boolean(checked),
                      },
                    })
                  }
                />
                Cash
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.payment_methods.bank_transfer}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      payment_methods: {
                        ...form.payment_methods,
                        bank_transfer: Boolean(checked),
                      },
                    })
                  }
                />
                Bank transfer
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.payment_methods.mobile_payment}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      payment_methods: {
                        ...form.payment_methods,
                        mobile_payment: Boolean(checked),
                      },
                    })
                  }
                />
                Mobile payment
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.payment_methods.credit_settlement}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      payment_methods: {
                        ...form.payment_methods,
                        credit_settlement: Boolean(checked),
                      },
                    })
                  }
                />
                Credit settlement
              </label>

              <div className="space-y-2">
                <Label>Bank account name</Label>
                <Input
                  value={form.payment_methods.bank_account_name ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      payment_methods: {
                        ...form.payment_methods,
                        bank_account_name: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Bank account number</Label>
                <Input
                  value={form.payment_methods.bank_account_number ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      payment_methods: {
                        ...form.payment_methods,
                        bank_account_number: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Branch/System configuration
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Default branch ID</Label>
                <Input
                  value={String(form.branch_system.default_branch_id ?? '')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      branch_system: {
                        ...form.branch_system,
                        default_branch_id: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Default warehouse ID</Label>
                <Input
                  value={String(form.branch_system.default_warehouse_id ?? '')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      branch_system: {
                        ...form.branch_system,
                        default_warehouse_id: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.branch_system.allow_negative_stock}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      branch_system: {
                        ...form.branch_system,
                        allow_negative_stock: Boolean(checked),
                      },
                    })
                  }
                />
                Allow negative stock
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.branch_system.require_sales_approval}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      branch_system: {
                        ...form.branch_system,
                        require_sales_approval: Boolean(checked),
                      },
                    })
                  }
                />
                Require sales approval
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.branch_system.require_purchase_approval}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      branch_system: {
                        ...form.branch_system,
                        require_purchase_approval: Boolean(checked),
                      },
                    })
                  }
                />
                Require purchase approval
              </label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}