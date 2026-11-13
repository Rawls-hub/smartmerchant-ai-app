import { supabase } from './supabase';

const TABLES = {
  products: 'smartmerchant_rawls_products_v3',
  sales: 'smartmerchant_rawls_sales_v3',
  debtors: 'smartmerchant_rawls_debtors_v3',
  orders: 'smartmerchant_rawls_orders_v3',
  bankPayments: 'smartmerchant_rawls_payments_v3',
  paymentTransactions: 'smartmerchant_rawls_paytx_v3',
  customers: 'smartmerchant_rawls_customers_v1',
  expenses: 'smartmerchant_rawls_expenses_v1',
  settings: 'smartmerchant_rawls_settings_v3',
  restockConfig: 'smartmerchant_rawls_restock_config_v1',
};

const CLOUD_TABLES = {
  products: 'products',
  sales: 'sales',
  debtors: 'debtors',
  orders: 'orders',
  bankPayments: 'bank_payments',
  paymentTransactions: 'payment_transactions',
  customers: 'customers',
  expenses: 'expenses',
} as const;

export async function loadMerchantCloud() {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw authError || new Error('No authenticated merchant.');
  }

  const result: Record<string, any> = {};

  for (const [key, table] of Object.entries(CLOUD_TABLES)) {
    const localKey = TABLES[key as keyof typeof TABLES];

    const { data, error } = await supabase
      .from(table)
      .select('id, data')
      .eq('merchant_id', user.id);

    if (error) throw error;

    if (data && data.length > 0) {
      result[key] = data.map((row: any) => row.data);
      continue;
    }

    // Migrate only records actually saved in this browser.
    // Do not upload mock fallback data automatically.
    const saved = localStorage.getItem(localKey);

    if (saved !== null) {
      const records = JSON.parse(saved);

      if (Array.isArray(records) && records.length > 0) {
        const rows = records.map((record: any) => ({
          id: record.id,
          merchant_id: user.id,
          data: record,
        }));

        const { error: uploadError } = await supabase
          .from(table)
          .upsert(rows, { onConflict: 'merchant_id,id' });

        if (uploadError) throw uploadError;
      }

      result[key] = records;
    }
  }

  const { data: settingsData, error: settingsError } =
    await supabase
      .from('merchant_settings')
      .select('data')
      .eq('merchant_id', user.id)
      .eq('id', 'settings')
      .maybeSingle();

  if (settingsError) throw settingsError;

  if (settingsData) {
    result.settings = settingsData.data;
  } else {
    const saved = localStorage.getItem(TABLES.settings);
    if (saved !== null) {
      result.settings = JSON.parse(saved);

      const { error } = await supabase
        .from('merchant_settings')
        .upsert({
          id: 'settings',
          merchant_id: user.id,
          data: result.settings,
        }, { onConflict: 'merchant_id,id' });

      if (error) throw error;
    }
  }

  const { data: restockData, error: restockError } =
    await supabase
      .from('restock_config')
      .select('data')
      .eq('merchant_id', user.id)
      .eq('id', 'config')
      .maybeSingle();

  if (restockError) throw restockError;

  if (restockData) {
    result.restockConfig = restockData.data;
  } else {
    const saved = localStorage.getItem(TABLES.restockConfig);
    if (saved !== null) {
      result.restockConfig = JSON.parse(saved);

      const { error } = await supabase
        .from('restock_config')
        .upsert({
          id: 'config',
          merchant_id: user.id,
          data: result.restockConfig,
        }, { onConflict: 'merchant_id,id' });

      if (error) throw error;
    }
  }

  return result;
}

export async function saveMerchantCloud(snapshot: Record<string, any>) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw authError || new Error('No authenticated merchant.');
  }

  for (const [key, table] of Object.entries(CLOUD_TABLES)) {
    const records = snapshot[key] || [];
    const ids = records.map((record: any) => record.id);

    const { data: existing, error: readError } = await supabase
      .from(table)
      .select('id')
      .eq('merchant_id', user.id);

    if (readError) throw readError;

    const staleIds = (existing || [])
      .map((row: any) => row.id)
      .filter((id: string) => !ids.includes(id));

    if (staleIds.length > 0) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('merchant_id', user.id)
        .in('id', staleIds);

      if (error) throw error;
    }

    if (records.length > 0) {
      const rows = records.map((record: any) => ({
        id: record.id,
        merchant_id: user.id,
        data: record,
      }));

      const { error } = await supabase
        .from(table)
        .upsert(rows, { onConflict: 'merchant_id,id' });

      if (error) throw error;
    }
  }

  const { error: settingsError } = await supabase
    .from('merchant_settings')
    .upsert({
      id: 'settings',
      merchant_id: user.id,
      data: snapshot.settings,
    }, { onConflict: 'merchant_id,id' });

  if (settingsError) throw settingsError;

  const { error: restockError } = await supabase
    .from('restock_config')
    .upsert({
      id: 'config',
      merchant_id: user.id,
      data: snapshot.restockConfig,
    }, { onConflict: 'merchant_id,id' });

  if (restockError) throw restockError;
}
