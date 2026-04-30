import api from '@/lib/axios';
import type { SettingsResponse, SystemSettings } from '@/types/settings.types';

const fallbackSettings: SystemSettings = {
  company_profile: { company_name: 'Pearl Detergent Wholesale', legal_name: '', tin_number: '', phone: '', email: '', address: '' },
  tax: { enabled: true, tax_name: 'VAT', rate: 15, tax_inclusive: false },
  invoice: { invoice_prefix: 'PDW-INV', next_invoice_number: 1, due_days: 15, show_tax_breakdown: true, footer_note: 'Thank you for your business.' },
  payment_methods: { cash: true, bank_transfer: true, mobile_payment: true, credit_settlement: true, bank_account_name: '', bank_account_number: '', mobile_merchant_code: '' },
  branch_system: { default_branch_id: null, default_warehouse_id: null, allow_negative_stock: false, require_sales_approval: true, require_purchase_approval: true },
};

function localSettings(): SystemSettings {
  if (typeof window === 'undefined') return fallbackSettings;
  const stored = window.localStorage.getItem('dwms_settings');
  if (!stored) return fallbackSettings;
  try { return { ...fallbackSettings, ...JSON.parse(stored) }; } catch { return fallbackSettings; }
}

export const settingsService = {
  async get(): Promise<SettingsResponse> {
    try { return await api.get('/settings').then((r) => r.data); }
    catch { return { success: true, message: 'Local settings fallback', data: localSettings() }; }
  },
  async update(payload: Partial<SystemSettings>): Promise<SettingsResponse> {
    try { return await api.put('/settings', payload).then((r) => r.data); }
    catch {
      const merged = { ...localSettings(), ...payload } as SystemSettings;
      if (typeof window !== 'undefined') window.localStorage.setItem('dwms_settings', JSON.stringify(merged));
      return { success: true, message: 'Settings saved locally. Add /settings backend routes for server persistence.', data: merged };
    }
  },
};
