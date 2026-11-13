import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  loadMerchantCloud,
  saveMerchantCloud,
} from '../lib/merchantCloud';
  Product,
  Sale,
  Order,
  Debtor,
  BankPaymentRecord,
  MerchantSettings,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentEntry,
  PaymentTransactionRecord,
  Customer,
  CustomerStats,
  CustomerPurchaseItem,
  Expense,
  ExpenseCategory,
  ProfitabilitySummary,
  RestockConfig,
} from '../types';
import {
  initialProducts,
  initialSales,
  initialDebtors,
  initialOrders,
  initialBankPayments,
  initialMerchantSettings,
  initialPaymentTransactions,
  initialCustomers,
  initialExpenses,
} from '../data/mockData';

export type NavSection = 'dashboard' | 'sales' | 'inventory' | 'orders' | 'customers' | 'payments' | 'expenses' | 'ai' | 'ask_ai';

export interface PaymentTarget {
  type: 'sale' | 'order' | 'debt';
  id: string;
  referenceNo: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
}

interface MerchantContextType {
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  products: Product[];
  sales: Sale[];
  debtors: Debtor[];
  orders: Order[];
  bankPayments: BankPaymentRecord[];
  paymentTransactions: PaymentTransactionRecord[];
  customers: Customer[];
  settings: MerchantSettings;
  updateSettings: (settings: MerchantSettings) => void;
  
  // Financial & Inventory Metrics
  totalSalesToday: number;
  totalPaymentsReceived: number;
  totalOutstandingPayments: number;
  outstandingPayments: number; // alias for backwards compatibility
  totalProductsInStock: number;
  totalUnitsInStock: number;
  lowStockAlertsCount: number;
  lowStockProducts: Product[];
  totalInventoryValuation: number;

  // Customer Management Metrics & Helpers
  totalCustomersCount: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  customersWithOutstandingCount: number;
  totalCustomerOutstandingBalance: number;
  getCustomerStats: (customer: Customer) => CustomerStats;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt'>) => { success: boolean; error?: string; customer?: Customer };
  updateCustomer: (id: string, updates: Partial<Customer>) => { success: boolean; error?: string };
  deleteCustomer: (id: string) => void;

  // Actions
  recordSale: (
    saleData: Omit<Sale, 'id' | 'receiptNo' | 'timestamp' | 'outstandingBalance'> & {
      amountPaid?: number;
      paymentStatus?: PaymentStatus;
    }
  ) => Sale | null;
  recordSalePayment: (
    saleId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string,
    reference?: string
  ) => void;
  recordOrderPayment: (
    orderId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string,
    reference?: string
  ) => void;
  addProduct: (product: Omit<Product, 'id' | 'lastRestocked'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  restockProduct: (id: string, addedUnits: number) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus, paymentStatus?: PaymentStatus) => void;
  addOrder: (
    order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'outstandingBalance'> & {
      amountPaid?: number;
      paymentStatus?: PaymentStatus;
    }
  ) => void;
  recordDebtPayment: (debtorId: string, amountPaid: number) => void;
  addDebtor: (debtor: Omit<Debtor, 'id'>) => void;
  markDebtorReminderSent: (debtorId: string) => void;
  verifyBankPayment: (id: string) => void;

  // Modals & UI helpers
  isNewSaleOpen: boolean;
  setIsNewSaleOpen: (open: boolean) => void;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  activeReceipt: Sale | null;
  setActiveReceipt: (sale: Sale | null) => void;
  activeWhatsAppModalDebtor: Debtor | null;
  setActiveWhatsAppModalDebtor: (debtor: Debtor | null) => void;
  activeRestockProduct: Product | null;
  setActiveRestockProduct: (product: Product | null) => void;
  activePaymentTarget: PaymentTarget | null;
  openPaymentModal: (target: PaymentTarget) => void;
  closePaymentModal: () => void;

  // Customer Modals
  activeDetailCustomer: Customer | null;
  setActiveDetailCustomer: (customer: Customer | null) => void;
  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (open: boolean) => void;
  editingCustomer: Customer | null;
  setEditingCustomer: (customer: Customer | null) => void;
  deletingCustomer: Customer | null;
  setDeletingCustomer: (customer: Customer | null) => void;

  // Expenses State & Actions
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Expense & Profitability Metrics
  totalExpensesToday: number;
  totalExpensesThisWeek: number;
  totalExpensesThisMonth: number;
  totalExpensesAllTime: number;
  operatingExpensesThisMonth: number;
  stockPurchasesThisMonth: number;
  getProfitabilitySummary: (
    period?: 'today' | 'week' | 'month' | 'all' | 'custom',
    customStartDate?: string,
    customEndDate?: string
  ) => ProfitabilitySummary;

  // Expense Modals
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (expense: Expense | null) => void;
  deletingExpense: Expense | null;
  setDeletingExpense: (expense: Expense | null) => void;

  // AI Tab and Restock Planner State
  aiTab: 'copilot_dashboard' | 'insights' | 'copilot' | 'restock_matrix';
  setAiTab: (tab: 'copilot_dashboard' | 'insights' | 'copilot' | 'restock_matrix') => void;
  openRestockPlanner: () => void;
  openAskAI: () => void;
  openCopilotDashboard: () => void;
  restockConfig: RestockConfig;
  updateRestockConfig: (updates: Partial<RestockConfig>) => void;
  restockInitialUnits: number;
  openRestockModal: (product: Product, suggestedUnits?: number) => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'smartmerchant_rawls_products_v3',
  SALES: 'smartmerchant_rawls_sales_v3',
  DEBTORS: 'smartmerchant_rawls_debtors_v3',
  ORDERS: 'smartmerchant_rawls_orders_v3',
  PAYMENTS: 'smartmerchant_rawls_payments_v3',
  PAY_TX: 'smartmerchant_rawls_paytx_v3',
  CUSTOMERS: 'smartmerchant_rawls_customers_v1',
  EXPENSES: 'smartmerchant_rawls_expenses_v1',
  SETTINGS: 'smartmerchant_rawls_settings_v3',
};

// Phone normalizer helper: extracts pure digits (e.g., '+234 802 112 3456' -> '2348021123456')
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.slice(1);
  }
  return digits;
}

export const MerchantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [cloudReady, setCloudReady] = useState(false);

useEffect(() => {
  let cancelled = false;

  loadMerchantCloud()
    .then((data) => {
      if (cancelled) return;

      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);
      if (data.debtors) setDebtors(data.debtors);
      if (data.orders) setOrders(data.orders);
      if (data.bankPayments) setBankPayments(data.bankPayments);
      if (data.paymentTransactions) setPaymentTransactions(data.paymentTransactions);
      if (data.customers) setCustomers(data.customers);
      if (data.expenses) setExpenses(data.expenses);
      if (data.settings) setSettings(data.settings);
      if (data.restockConfig) setRestockConfig(data.restockConfig);

      setCloudReady(true);
    })
    .catch((error) => {
      console.error('Could not load merchant cloud data:', error);
    });

  return () => {
    cancelled = true;
  };
}, []);
  // Persistent state with initial Nigerian seed data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [debtors, setDebtors] = useState<Debtor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTORS);
    return saved ? JSON.parse(saved) : initialDebtors;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [bankPayments, setBankPayments] = useState<BankPaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : initialBankPayments;
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransactionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAY_TX);
    return saved ? JSON.parse(saved) : initialPaymentTransactions;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [settings, setSettings] = useState<MerchantSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialMerchantSettings;
  });

  // Modal states
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);
  const [activeWhatsAppModalDebtor, setActiveWhatsAppModalDebtor] = useState<Debtor | null>(null);
  const [activeRestockProduct, setActiveRestockProduct] = useState<Product | null>(null);
  const [activePaymentTarget, setActivePaymentTarget] = useState<PaymentTarget | null>(null);

  // Customer Modals
  const [activeDetailCustomer, setActiveDetailCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Expense Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // AI Tab and Restock Planner State
  const [aiTab, setAiTab] = useState<'copilot_dashboard' | 'insights' | 'copilot' | 'restock_matrix'>('copilot_dashboard');
  const [restockInitialUnits, setRestockInitialUnits] = useState<number>(10);

  const [restockConfig, setRestockConfig] = useState<RestockConfig>(() => {
    const saved = localStorage.getItem('smartmerchant_rawls_restock_config_v1');
    return saved
      ? JSON.parse(saved)
      : {
          supplierLeadTimeDays: 7,
          safetyStockDays: 7,
          analysisPeriodDays: 30,
        };
  });

  useEffect(() => {
    localStorage.setItem('smartmerchant_rawls_restock_config_v1', JSON.stringify(restockConfig));
  }, [restockConfig]);

  const updateRestockConfig = (updates: Partial<RestockConfig>) => {
    setRestockConfig((prev) => ({ ...prev, ...updates }));
  };

  const openRestockPlanner = () => {
    setActiveSection('ai');
    setAiTab('restock_matrix');
  };

  const openAskAI = () => {
    setActiveSection('ask_ai');
    setAiTab('copilot');
  };

  const openCopilotDashboard = () => {
    setActiveSection('ai');
    setAiTab('copilot_dashboard');
  };

  const openRestockModal = (product: Product, suggestedUnits?: number) => {
    setRestockInitialUnits(suggestedUnits && suggestedUnits > 0 ? suggestedUnits : 10);
    setActiveRestockProduct(product);
  };

  const openPaymentModal = (target: PaymentTarget) => {
    setActivePaymentTarget(target);
  };

  const closePaymentModal = () => {
    setActivePaymentTarget(null);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTORS, JSON.stringify(debtors));
  }, [debtors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(bankPayments));
  }, [bankPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAY_TX, JSON.stringify(paymentTransactions));
  }, [paymentTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Derived Financial Metrics
  const totalSalesToday = sales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);

  const totalPaymentsReceived = 
    sales.reduce((acc, sale) => acc + (sale.amountPaid || 0), 0) +
    orders.reduce((acc, order) => acc + (order.amountPaid || 0), 0);

  const totalSalesOutstanding = sales.reduce((acc, sale) => acc + (sale.outstandingBalance || 0), 0);
  const totalOrdersOutstanding = orders.reduce((acc, order) => acc + (order.outstandingBalance || 0), 0);
  const totalOutstandingPayments = totalSalesOutstanding + totalOrdersOutstanding;
  const outstandingPayments = totalOutstandingPayments;

  const totalProductsInStock = products.filter((p) => p.stock > 0).length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);
  const lowStockAlertsCount = lowStockProducts.length;
  const totalInventoryValuation = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);

  // -------------------------------------------------------------
  // Expense & Profitability Calculations
  // -------------------------------------------------------------
  const realTodayIso = new Date().toISOString().split('T')[0];
  const allDates = [
    ...expenses.map((e) => (e.date || '').slice(0, 10)),
    ...sales.map((s) => (s.timestamp || '').slice(0, 10)),
  ].filter(Boolean);
  const latestDateStr = allDates.length > 0 ? [...allDates].sort().pop()! : '2026-10-31';
  // Use today's date if any records match today, otherwise anchor to the latest record date
  const todayStr =
    expenses.some((e) => (e.date || '').slice(0, 10) === realTodayIso) ||
    sales.some((s) => (s.timestamp || '').slice(0, 10) === realTodayIso)
      ? realTodayIso
      : latestDateStr;
  const monthPrefix = todayStr.slice(0, 7);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalExpensesToday = expenses
    .filter((e) => (e.date || '').slice(0, 10) === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpensesThisWeek = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d >= sevenDaysAgo && d <= now;
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpensesThisMonth = expenses
    .filter((e) => (e.date || '').slice(0, 7) === monthPrefix)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpensesAllTime = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const operatingExpensesThisMonth = expenses
    .filter((e) => (e.date || '').slice(0, 7) === monthPrefix && e.category !== 'Stock purchases')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const stockPurchasesThisMonth = expenses
    .filter((e) => (e.date || '').slice(0, 7) === monthPrefix && e.category === 'Stock purchases')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const getProfitabilitySummary = (
    period: 'today' | 'week' | 'month' | 'all' | 'custom' = 'month',
    customStartDate?: string,
    customEndDate?: string
  ): ProfitabilitySummary => {
    const isInPeriod = (dateStr: string): boolean => {
      if (!dateStr) return false;
      const dateOnly = dateStr.slice(0, 10);
      const itemDate = new Date(dateStr);

      if (period === 'today') return dateOnly === todayStr;
      if (period === 'week') return itemDate >= sevenDaysAgo && itemDate <= now;
      if (period === 'month') return dateOnly.startsWith(monthPrefix);
      if (period === 'custom') {
        if (customStartDate && dateOnly < customStartDate) return false;
        if (customEndDate && dateOnly > customEndDate) return false;
        return true;
      }
      return true; // 'all'
    };

    const periodSales = sales.filter((s) => isInPeriod(s.timestamp));
    const periodExpenses = expenses.filter((e) => isInPeriod(e.date));

    // Total Revenue from recorded sales turnover
    const totalRevenue = periodSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

    // Cost of Goods Sold (COGS) strictly for units actually sold
    let cogs = 0;
    periodSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cost = prod ? prod.costPrice : item.unitPrice * 0.8;
        cogs += cost * (item.quantity || 1);
      });
    });

    const grossProfit = totalRevenue - cogs;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Operating expenses (excluding Stock purchases to prevent double-counting inventory!)
    const operatingExpenses = periodExpenses
      .filter((e) => e.category !== 'Stock purchases')
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    const stockPurchasesExpenses = periodExpenses
      .filter((e) => e.category === 'Stock purchases')
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    const totalExpenses = operatingExpenses + stockPurchasesExpenses;

    // Net Operating Profit = Gross Profit - Operating Expenses
    const netProfit = grossProfit - operatingExpenses;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Cash flow
    const cashInflows = periodSales.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
    const cashOutflows = totalExpenses;
    const netCashFlow = cashInflows - cashOutflows;

    let periodLabel = 'This Month (Oct 2026)';
    if (period === 'today') periodLabel = 'Today (31 Oct 2026)';
    else if (period === 'week') periodLabel = 'Last 7 Days';
    else if (period === 'all') periodLabel = 'All Time';
    else if (period === 'custom') periodLabel = `${customStartDate || 'Start'} to ${customEndDate || 'End'}`;

    return {
      periodLabel,
      totalRevenue,
      cogs,
      grossProfit,
      grossMarginPercent,
      operatingExpenses,
      stockPurchasesExpenses,
      totalExpenses,
      netProfit,
      netMarginPercent,
      cashInflows,
      cashOutflows,
      netCashFlow,
    };
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (deletingExpense?.id === id) setDeletingExpense(null);
    if (editingExpense?.id === id) setEditingExpense(null);
  };

  // -------------------------------------------------------------
  // Customer Dynamic Stats and Calculations
  // -------------------------------------------------------------
  const getCustomerStats = (customer: Customer): CustomerStats => {
    const cPhoneNorm = normalizePhone(customer.phone);
    const cNameLower = customer.fullName.toLowerCase().trim();

    // Match sales
    const matchedSales: CustomerPurchaseItem[] = sales
      .filter((s) => {
        const sPhoneNorm = normalizePhone(s.customerPhone || '');
        const sNameLower = (s.customerName || '').toLowerCase().trim();
        return (
          (cPhoneNorm && sPhoneNorm && (cPhoneNorm.includes(sPhoneNorm) || sPhoneNorm.includes(cPhoneNorm))) ||
          sNameLower.includes(cNameLower) ||
          cNameLower.includes(sNameLower)
        );
      })
      .map((s) => ({
        id: s.id,
        type: 'sale',
        referenceNo: s.receiptNo,
        date: s.timestamp,
        itemDescription: s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
        totalAmount: s.totalAmount,
        amountPaid: s.amountPaid || 0,
        outstandingBalance: s.outstandingBalance || 0,
        paymentStatus: s.paymentStatus,
        paymentMethod: s.paymentMethod,
        notes: s.notes,
      }));

    // Match orders
    const matchedOrders: CustomerPurchaseItem[] = orders
      .filter((o) => {
        const oPhoneNorm = normalizePhone(o.customerPhone || '');
        const oNameLower = (o.customerName || '').toLowerCase().trim();
        return (
          (cPhoneNorm && oPhoneNorm && (cPhoneNorm.includes(oPhoneNorm) || oPhoneNorm.includes(cPhoneNorm))) ||
          oNameLower.includes(cNameLower) ||
          cNameLower.includes(oNameLower)
        );
      })
      .map((o) => ({
        id: o.id,
        type: 'order',
        referenceNo: o.orderNo,
        date: o.createdAt,
        itemDescription: o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
        totalAmount: o.totalAmount,
        amountPaid: o.amountPaid || 0,
        outstandingBalance: o.outstandingBalance || 0,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.status,
        paymentMethod: 'moniepoint',
        notes: o.deliveryNote,
      }));

    // Combine all purchases sorted newest first
    const purchases = [...matchedSales, ...matchedOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Match payment transactions audit trail
    const purchaseRefIds = new Set(purchases.map((p) => p.referenceNo));
    const matchedPayments = paymentTransactions.filter((tx) => {
      if (purchaseRefIds.has(tx.targetReferenceNo)) return true;
      const txPhoneNorm = normalizePhone(tx.customerPhone || '');
      const txNameLower = (tx.customerName || '').toLowerCase().trim();
      return (
        (cPhoneNorm && txPhoneNorm && (cPhoneNorm.includes(txPhoneNorm) || txPhoneNorm.includes(cPhoneNorm))) ||
        txNameLower.includes(cNameLower) ||
        cNameLower.includes(txNameLower)
      );
    });

    const totalOrdersCount = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalOutstanding = purchases.reduce((sum, p) => sum + p.outstandingBalance, 0);
    const unpaidCount = purchases.filter((p) => p.paymentStatus === 'unpaid').length;
    const partialCount = purchases.filter((p) => p.paymentStatus === 'partial').length;
    const isReturning = totalOrdersCount >= 2;

    // Check if debtor record exists and is overdue
    const isDebtorOverdue = debtors.some((d) => {
      const dPhoneNorm = normalizePhone(d.phone);
      const dNameLower = d.customerName.toLowerCase().trim();
      const matches =
        (cPhoneNorm && dPhoneNorm && cPhoneNorm === dPhoneNorm) ||
        dNameLower.includes(cNameLower) ||
        cNameLower.includes(dNameLower);
      return matches && d.daysOverdue > 0;
    });

    return {
      totalOrdersCount,
      totalSpent,
      totalPaid,
      totalOutstanding,
      purchases,
      payments: matchedPayments,
      isReturning,
      isOverdue: isDebtorOverdue,
      unpaidCount,
      partialCount,
    };
  };

  // Customer Dashboard Metrics
  const customerStatsMap = useMemo(() => {
    const map = new Map<string, CustomerStats>();
    customers.forEach((c) => {
      map.set(c.id, getCustomerStats(c));
    });
    return map;
  }, [customers, sales, orders, paymentTransactions, debtors]);

  const totalCustomersCount = customers.length;
  const returningCustomersCount = customers.filter(
    (c) => (customerStatsMap.get(c.id)?.totalOrdersCount || 0) >= 2
  ).length;
  const newCustomersCount = customers.filter(
    (c) => (customerStatsMap.get(c.id)?.totalOrdersCount || 0) <= 1
  ).length;
  const customersWithOutstandingCount = customers.filter(
    (c) => (customerStatsMap.get(c.id)?.totalOutstanding || 0) > 0
  ).length;
  const totalCustomerOutstandingBalance = customers.reduce(
    (acc, c) => acc + (customerStatsMap.get(c.id)?.totalOutstanding || 0),
    0
  );

  // Add Customer (with duplicate check)
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const inputPhoneNorm = normalizePhone(customerData.phone);
    if (!inputPhoneNorm) {
      return { success: false, error: 'A valid customer phone number is required.' };
    }

    // Check duplicate phone
    const duplicatePhone = customers.find(
      (c) => normalizePhone(c.phone) === inputPhoneNorm
    );
    if (duplicatePhone) {
      return {
        success: false,
        error: `Customer with phone ${customerData.phone} already exists (${duplicatePhone.fullName}).`,
      };
    }

    // Check duplicate email if provided
    if (customerData.email && customerData.email.trim()) {
      const duplicateEmail = customers.find(
        (c) => c.email && c.email.toLowerCase().trim() === customerData.email.toLowerCase().trim()
      );
      if (duplicateEmail) {
        return {
          success: false,
          error: `Customer with email ${customerData.email} already exists (${duplicateEmail.fullName}).`,
        };
      }
    }

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    return { success: true, customer: newCustomer };
  };

  // Update Customer
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    if (updates.phone) {
      const inputPhoneNorm = normalizePhone(updates.phone);
      const conflict = customers.find(
        (c) => c.id !== id && normalizePhone(c.phone) === inputPhoneNorm
      );
      if (conflict) {
        return {
          success: false,
          error: `Another customer (${conflict.fullName}) is already registered with this phone number.`,
        };
      }
    }

    if (updates.email && updates.email.trim()) {
      const conflictEmail = customers.find(
        (c) => c.id !== id && c.email && c.email.toLowerCase().trim() === updates.email!.toLowerCase().trim()
      );
      if (conflictEmail) {
        return {
          success: false,
          error: `Another customer (${conflictEmail.fullName}) is already registered with this email.`,
        };
      }
    }

    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    // If active in detail view, update detail view too
    setActiveDetailCustomer((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
    return { success: true };
  };

  // Delete Customer
  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (activeDetailCustomer?.id === id) {
      setActiveDetailCustomer(null);
    }
    if (editingCustomer?.id === id) {
      setEditingCustomer(null);
    }
    if (deletingCustomer?.id === id) {
      setDeletingCustomer(null);
    }
  };

  // -------------------------------------------------------------
  // Record a Sale
  // -------------------------------------------------------------
  const recordSale = (
    saleData: Omit<Sale, 'id' | 'receiptNo' | 'timestamp' | 'outstandingBalance'> & {
      amountPaid?: number;
      paymentStatus?: PaymentStatus;
    }
  ): Sale | null => {
    // 1. Validate that all items exist and have sufficient stock
    for (const item of saleData.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        console.warn(`Product with ID ${item.productId} not found in inventory.`);
        return null;
      }
      const totalSoldForThisProd = saleData.items
        .filter((i) => i.productId === item.productId)
        .reduce((sum, i) => sum + i.quantity, 0);

      if (totalSoldForThisProd > prod.stock) {
        console.warn(
          `Insufficient stock for "${prod.name}": requested ${totalSoldForThisProd}, available ${prod.stock}`
        );
        return null;
      }
    }

    const receiptId = `SMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = saleData.totalAmount;
    
    // Calculate amountPaid and outstandingBalance
    let paid = saleData.amountPaid !== undefined ? Math.max(0, saleData.amountPaid) : total;
    if (saleData.paymentMethod === 'credit' && saleData.amountPaid === undefined) {
      paid = 0;
    }
    paid = Math.min(total, paid);
    const balance = Math.max(0, total - paid);

    let status: PaymentStatus = 'paid';
    if (balance === 0) {
      status = 'paid';
    } else if (paid === 0) {
      status = 'unpaid';
    } else {
      status = 'partial';
    }

    const initialPayments: PaymentEntry[] = paid > 0 ? [
      {
        id: `pay-${Date.now()}`,
        amount: paid,
        paymentMethod: saleData.paymentMethod,
        reference: `POS-${receiptId}`,
        timestamp: new Date().toISOString(),
        note: `Initial POS payment (${status})`,
      }
    ] : [];

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      receiptNo: receiptId,
      amountPaid: paid,
      outstandingBalance: balance,
      paymentStatus: status,
      status: status === 'paid' ? 'paid' : 'partial',
      timestamp: new Date().toISOString(),
      payments: initialPayments,
    };

    // Auto-register customer if customer phone is present and not yet registered
    if (saleData.customerPhone && saleData.customerPhone.trim()) {
      const salePhoneNorm = normalizePhone(saleData.customerPhone);
      const existing = customers.find((c) => normalizePhone(c.phone) === salePhoneNorm);
      if (!existing && saleData.customerName && saleData.customerName.trim()) {
        const autoCustomer: Customer = {
          id: `cust-${Date.now()}`,
          fullName: saleData.customerName.trim(),
          phone: saleData.customerPhone.trim(),
          email: '',
          address: 'Walk-in / In-store purchase',
          city: 'Lagos',
          createdAt: new Date().toISOString(),
          notes: 'Customer created automatically from POS Sale',
          tag: 'Regular',
        };
        setCustomers((prev) => [autoCustomer, ...prev]);
      }
    }

    // 2. Compute updated products with deducted stock
    const updatedProducts = products.map((prod) => {
      const totalSold = saleData.items
        .filter((i) => i.productId === prod.id)
        .reduce((sum, i) => sum + i.quantity, 0);

      if (totalSold > 0) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - totalSold),
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    } catch (e) {
      console.error('Failed to sync products to storage', e);
    }

    // 3. Update sales state and write to localStorage
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));
    } catch (e) {
      console.error('Failed to sync sales to storage', e);
    }

    // 4. Log to global payment transactions ledger
    if (paid > 0) {
      const newPayTx: PaymentTransactionRecord = {
        id: `pay-tx-${Date.now()}`,
        reference: `POS-${receiptId}`,
        targetType: 'sale',
        targetId: newSale.id,
        targetReferenceNo: receiptId,
        customerName: saleData.customerName || 'Walk-in Customer',
        customerPhone: saleData.customerPhone,
        amount: paid,
        paymentMethod: saleData.paymentMethod,
        timestamp: new Date().toISOString(),
        note: `Sale receipt #${receiptId} payment (${status})`,
      };
      setPaymentTransactions((prev) => [newPayTx, ...prev]);
    }

    // 5. If outstanding balance, record in Debtor book
    if (balance > 0) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const newDebtor: Debtor = {
        id: `debt-${Date.now()}`,
        customerName: saleData.customerName || 'Customer (Unrecorded Name)',
        phone: saleData.customerPhone || '',
        amountOwed: balance,
        initialAmount: total,
        dueDate: dueDate.toISOString().split('T')[0],
        daysOverdue: 0,
        itemDescription: saleData.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
        notes: saleData.notes || (paid > 0 ? `Partially paid (₦${paid.toLocaleString()} paid, ₦${balance.toLocaleString()} outstanding)` : 'Purchased on store credit'),
        saleId: newSale.id,
      };
      const updatedDebtors = [newDebtor, ...debtors];
      setDebtors(updatedDebtors);
      try {
        localStorage.setItem(STORAGE_KEYS.DEBTORS, JSON.stringify(updatedDebtors));
      } catch (e) {
        console.error('Failed to sync debtors to storage', e);
      }
    }

    return newSale;
  };

  // Record additional payment on an existing sale
  const recordSalePayment = (
    saleId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string,
    reference?: string
  ) => {
    if (amount <= 0) return;

    let targetReceiptNo = '';
    let customer = '';
    let phone = '';

    setSales((prevSales) =>
      prevSales.map((sale) => {
        if (sale.id === saleId) {
          targetReceiptNo = sale.receiptNo;
          customer = sale.customerName;
          phone = sale.customerPhone;

          const currentPaid = sale.amountPaid || 0;
          const newPaid = Math.min(sale.totalAmount, currentPaid + amount);
          const newBalance = Math.max(0, sale.totalAmount - newPaid);
          const newStatus: PaymentStatus = newBalance === 0 ? 'paid' : 'partial';

          const newEntry: PaymentEntry = {
            id: `pay-entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            amount,
            paymentMethod,
            reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
            timestamp: new Date().toISOString(),
            note: note || `Payment of ₦${amount.toLocaleString()}`,
          };

          return {
            ...sale,
            amountPaid: newPaid,
            outstandingBalance: newBalance,
            paymentStatus: newStatus,
            status: newStatus === 'paid' ? 'paid' : 'partial',
            payments: [...(sale.payments || []), newEntry],
          };
        }
        return sale;
      })
    );

    // Update any linked debtor
    setDebtors((prevDebtors) =>
      prevDebtors
        .map((d) => {
          if (d.saleId === saleId) {
            const updatedOwed = Math.max(0, d.amountOwed - amount);
            return {
              ...d,
              amountOwed: updatedOwed,
            };
          }
          return d;
        })
        .filter((d) => d.amountOwed > 0)
    );

    // Add to global payment transaction audit trail
    const newTx: PaymentTransactionRecord = {
      id: `pay-tx-${Date.now()}`,
      reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      targetType: 'sale',
      targetId: saleId,
      targetReferenceNo: targetReceiptNo,
      customerName: customer || 'Customer',
      customerPhone: phone,
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
      note: note || `Payment installment for sale #${targetReceiptNo}`,
    };
    setPaymentTransactions((prev) => [newTx, ...prev]);
  };

  // Record additional payment on an existing order
  const recordOrderPayment = (
    orderId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string,
    reference?: string
  ) => {
    if (amount <= 0) return;

    let targetOrderNo = '';
    let customer = '';
    let phone = '';

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          targetOrderNo = order.orderNo;
          customer = order.customerName;
          phone = order.customerPhone;

          const currentPaid = order.amountPaid || 0;
          const newPaid = Math.min(order.totalAmount, currentPaid + amount);
          const newBalance = Math.max(0, order.totalAmount - newPaid);
          const newStatus: PaymentStatus = newBalance === 0 ? 'paid' : 'partial';

          const newEntry: PaymentEntry = {
            id: `ord-pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            amount,
            paymentMethod,
            reference: reference || `ORD-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
            timestamp: new Date().toISOString(),
            note: note || `Order payment of ₦${amount.toLocaleString()}`,
          };

          return {
            ...order,
            amountPaid: newPaid,
            outstandingBalance: newBalance,
            paymentStatus: newStatus,
            payments: [...(order.payments || []), newEntry],
          };
        }
        return order;
      })
    );

    const newTx: PaymentTransactionRecord = {
      id: `pay-tx-${Date.now()}`,
      reference: reference || `ORD-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      targetType: 'order',
      targetId: orderId,
      targetReferenceNo: targetOrderNo,
      customerName: customer || 'Customer',
      customerPhone: phone,
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
      note: note || `Payment installment for order #${targetOrderNo}`,
    };
    setPaymentTransactions((prev) => [newTx, ...prev]);
  };

  // Add Product
  const addProduct = (prodData: Omit<Product, 'id' | 'lastRestocked'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Restock Product
  const restockProduct = (id: string, addedUnits: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            stock: p.stock + addedUnits,
            lastRestocked: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Orders
  const updateOrderStatus = (id: string, status: OrderStatus, paymentStatus?: PaymentStatus) => {
    let deliveredOrder: Order | undefined;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          const nextPaymentStatus = paymentStatus || order.paymentStatus;
          const nextPaid = nextPaymentStatus === 'paid' ? order.totalAmount : order.amountPaid;
          const nextBalance = Math.max(0, order.totalAmount - nextPaid);

          if (status === 'delivered' && order.status !== 'delivered') {
            deliveredOrder = order;
          }

          return {
            ...order,
            status,
            paymentStatus: nextPaymentStatus,
            amountPaid: nextPaid,
            outstandingBalance: nextBalance,
          };
        }
        return order;
      })
    );

    // Atomically decrement product inventory stock when order is fulfilled
    if (deliveredOrder && (deliveredOrder as Order).items?.length) {
      const orderItems = (deliveredOrder as Order).items;
      setProducts((prev) =>
        prev.map((product) => {
          const item = orderItems.find(
            (i) => i.productId === product.id || i.productName.toLowerCase() === product.name.toLowerCase()
          );
          if (item) {
            return {
              ...product,
              stock: Math.max(0, product.stock - item.quantity),
            };
          }
          return product;
        })
      );
    }
  };

  const addOrder = (
    orderData: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'outstandingBalance'> & {
      amountPaid?: number;
      paymentStatus?: PaymentStatus;
    }
  ) => {
    const total = orderData.totalAmount;
    const paid = orderData.amountPaid !== undefined ? Math.min(total, Math.max(0, orderData.amountPaid)) : 0;
    const balance = Math.max(0, total - paid);
    const status: PaymentStatus = orderData.paymentStatus || (balance === 0 ? 'paid' : paid === 0 ? 'unpaid' : 'partial');

    const orderNo = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialPayments: PaymentEntry[] = paid > 0 ? [
      {
        id: `ord-pay-${Date.now()}`,
        amount: paid,
        paymentMethod: 'moniepoint',
        reference: `ORD-DEP-${orderNo}`,
        timestamp: new Date().toISOString(),
        note: `Initial order deposit (${status})`,
      }
    ] : [];

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNo,
      amountPaid: paid,
      outstandingBalance: balance,
      paymentStatus: status,
      createdAt: new Date().toISOString(),
      payments: initialPayments,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Auto-register customer if customer phone is present and not yet registered
    if (orderData.customerPhone && orderData.customerPhone.trim()) {
      const orderPhoneNorm = normalizePhone(orderData.customerPhone);
      const existing = customers.find((c) => normalizePhone(c.phone) === orderPhoneNorm);
      if (!existing && orderData.customerName && orderData.customerName.trim()) {
        const autoCustomer: Customer = {
          id: `cust-${Date.now()}`,
          fullName: orderData.customerName.trim(),
          phone: orderData.customerPhone.trim(),
          email: '',
          address: orderData.deliveryAddress || 'Address on file',
          city: orderData.cityArea || 'Lagos',
          createdAt: new Date().toISOString(),
          notes: 'Customer created automatically from Delivery Order',
          tag: 'Regular',
        };
        setCustomers((prev) => [autoCustomer, ...prev]);
      }
    }

    if (paid > 0) {
      const newTx: PaymentTransactionRecord = {
        id: `pay-tx-${Date.now()}`,
        reference: `ORD-DEP-${orderNo}`,
        targetType: 'order',
        targetId: newOrder.id,
        targetReferenceNo: orderNo,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        amount: paid,
        paymentMethod: 'moniepoint',
        timestamp: new Date().toISOString(),
        note: `Initial payment for order #${orderNo}`,
      };
      setPaymentTransactions((prev) => [newTx, ...prev]);
    }
  };

  // Debtors
  const recordDebtPayment = (debtorId: string, amountPaid: number) => {
    if (amountPaid <= 0) return;

    const targetDebtor = debtors.find((d) => d.id === debtorId);
    if (!targetDebtor) return;

    if (targetDebtor.saleId) {
      // recordSalePayment handles sale status, debtor balance, and payment transaction audit trail atomically
      recordSalePayment(targetDebtor.saleId, amountPaid, 'bank_transfer', `Debt settlement from ${targetDebtor.customerName}`);
    } else {
      // Standalone manual debtor (not created from POS sale)
      setDebtors((prev) =>
        prev
          .map((debtor) => {
            if (debtor.id === debtorId) {
              const newAmount = Math.max(0, debtor.amountOwed - amountPaid);
              return {
                ...debtor,
                amountOwed: newAmount,
              };
            }
            return debtor;
          })
          .filter((debtor) => debtor.amountOwed > 0)
      );

      const tx: PaymentTransactionRecord = {
        id: `pay-tx-${Date.now()}`,
        reference: `DEBT-REC-${Math.floor(100000 + Math.random() * 900000)}`,
        targetType: 'debt_settlement',
        targetId: debtorId,
        targetReferenceNo: targetDebtor.customerName,
        customerName: targetDebtor.customerName,
        customerPhone: targetDebtor.phone,
        amount: amountPaid,
        paymentMethod: 'bank_transfer',
        timestamp: new Date().toISOString(),
        note: `Debt settlement: ${targetDebtor.itemDescription}`,
      };
      setPaymentTransactions((prev) => [tx, ...prev]);
    }
  };

  const addDebtor = (debtorData: Omit<Debtor, 'id'>) => {
    const newDebtor: Debtor = {
      ...debtorData,
      id: `debt-${Date.now()}`,
    };
    setDebtors((prev) => [newDebtor, ...prev]);
  };

  const markDebtorReminderSent = (debtorId: string) => {
    setDebtors((prev) =>
      prev.map((d) =>
        d.id === debtorId
          ? { ...d, lastReminderSent: new Date().toISOString().split('T')[0] }
          : d
      )
    );
  };

  // Bank Payments
  const verifyBankPayment = (id: string) => {
    setBankPayments((prev) =>
      prev.map((bp) => (bp.id === id ? { ...bp, status: 'verified' } : bp))
    );
  };

  const updateSettings = (newSettings: MerchantSettings) => {
    setSettings(newSettings);
  };

  return (
    <MerchantContext.Provider
      value={{
        activeSection,
        setActiveSection,
        products,
        sales,
        debtors,
        orders,
        bankPayments,
        paymentTransactions,
        customers,
        settings,
        updateSettings,
        totalSalesToday,
        totalPaymentsReceived,
        totalOutstandingPayments,
        outstandingPayments,
        totalProductsInStock,
        totalUnitsInStock,
        lowStockAlertsCount,
        lowStockProducts,
        totalInventoryValuation,
        totalCustomersCount,
        newCustomersCount,
        returningCustomersCount,
        customersWithOutstandingCount,
        totalCustomerOutstandingBalance,
        getCustomerStats,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordSale,
        recordSalePayment,
        recordOrderPayment,
        addProduct,
        updateProduct,
        restockProduct,
        deleteProduct,
        updateOrderStatus,
        addOrder,
        recordDebtPayment,
        addDebtor,
        markDebtorReminderSent,
        verifyBankPayment,
        isNewSaleOpen,
        setIsNewSaleOpen,
        isAddProductOpen,
        setIsAddProductOpen,
        activeReceipt,
        setActiveReceipt,
        activeWhatsAppModalDebtor,
        setActiveWhatsAppModalDebtor,
        activeRestockProduct,
        setActiveRestockProduct,
        activePaymentTarget,
        openPaymentModal,
        closePaymentModal,
        activeDetailCustomer,
        setActiveDetailCustomer,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        editingCustomer,
        setEditingCustomer,
        deletingCustomer,
        setDeletingCustomer,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        totalExpensesToday,
        totalExpensesThisWeek,
        totalExpensesThisMonth,
        totalExpensesAllTime,
        operatingExpensesThisMonth,
        stockPurchasesThisMonth,
        getProfitabilitySummary,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        editingExpense,
        setEditingExpense,
        deletingExpense,
        setDeletingExpense,
        aiTab,
        setAiTab,
        openRestockPlanner,
        openAskAI,
        openCopilotDashboard,
        restockConfig,
        updateRestockConfig,
        restockInitialUnits,
        openRestockModal,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};
