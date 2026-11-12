export type PaymentMethod = 
  | 'opay'
  | 'moniepoint'
  | 'palmpay'
  | 'bank_transfer'
  | 'cash'
  | 'credit';

export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export type ProductCategory = 
  | 'Smartphones & Tablets'
  | 'Laptops & Computers'
  | 'Gaming Consoles & Gear'
  | 'Audio & Speakers'
  | 'Accessories & Power'
  | 'Smart Wearables';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  lastRestocked: string;
  supplier?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentEntry {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  timestamp: string;
  note?: string;
}

export interface Sale {
  id: string;
  receiptNo: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status?: 'paid' | 'credit' | 'partial';
  timestamp: string;
  notes?: string;
  payments?: PaymentEntry[];
}

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  cityArea: string;
  items: SaleItem[];
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveryNote?: string;
  payments?: PaymentEntry[];
}

export interface PaymentTransactionRecord {
  id: string;
  reference: string;
  targetType: 'sale' | 'order' | 'debt_settlement';
  targetId: string;
  targetReferenceNo: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  note?: string;
}

export interface Debtor {
  id: string;
  customerName: string;
  phone: string;
  amountOwed: number;
  initialAmount: number;
  dueDate: string;
  daysOverdue: number;
  itemDescription: string;
  notes: string;
  lastReminderSent?: string;
  saleId?: string;
}

export interface BankPaymentRecord {
  id: string;
  reference: string;
  bankName: 'OPay' | 'Moniepoint' | 'PalmPay' | 'GTBank' | 'Zenith Bank' | 'Kuda Bank' | 'Access Bank' | 'First Bank';
  senderName: string;
  amount: number;
  timestamp: string;
  status: 'verified' | 'flagged' | 'pending';
  narration: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isFallback?: boolean;
}

export interface MerchantSettings {
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  dailySalesTarget: number;
}

export type CustomerTag = 'VIP' | 'Regular' | 'Corporate' | 'Wholesale';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  createdAt: string;
  notes?: string;
  tag?: CustomerTag;
}

export interface CustomerPurchaseItem {
  id: string;
  type: 'sale' | 'order';
  referenceNo: string;
  date: string;
  itemDescription: string;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus?: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CustomerStats {
  totalOrdersCount: number;
  totalSpent: number;
  totalPaid: number;
  totalOutstanding: number;
  purchases: CustomerPurchaseItem[];
  payments: PaymentTransactionRecord[];
  isReturning: boolean;
  isOverdue: boolean;
  unpaidCount: number;
  partialCount: number;
}

export type ExpenseCategory =
  | 'Stock purchases'
  | 'Transportation and logistics'
  | 'Rent'
  | 'Electricity and utilities'
  | 'Salaries and wages'
  | 'Marketing and advertising'
  | 'Repairs and maintenance'
  | 'Internet and subscriptions'
  | 'Miscellaneous expenses';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD or ISO string
  paymentMethod: PaymentMethod;
  recipientVendor?: string;
  notes?: string;
  receiptRef?: string;
  createdAt: string;
}

export interface ProfitabilitySummary {
  periodLabel: string;
  totalRevenue: number;
  cogs: number; // Cost of goods sold (wholesale cost of units sold)
  grossProfit: number; // totalRevenue - cogs
  grossMarginPercent: number; // (grossProfit / totalRevenue) * 100
  operatingExpenses: number; // Expenses EXCLUDING 'Stock purchases'
  stockPurchasesExpenses: number; // Capital outlay on stock
  totalExpenses: number; // operatingExpenses + stockPurchasesExpenses
  netProfit: number; // grossProfit - operatingExpenses (avoids double-counting inventory!)
  netMarginPercent: number; // (netProfit / totalRevenue) * 100
  cashInflows: number; // Cleared payments received
  cashOutflows: number; // Total cash out (total expenses)
  netCashFlow: number; // cashInflows - cashOutflows
}

// ============================================================================
// RESTOCK PLANNER & INVENTORY INTELLIGENCE TYPES
// ============================================================================

export type InventoryWarningType =
  | 'critical_low'          // Stock <= minAlert / 2 or stock duration < leadTime
  | 'approaching_stockout'  // Stock <= minAlert or stock duration <= leadTime + safetyStockDays
  | 'slow_moving'           // Has sales, but velocity is low (< 0.1/day) and high days of stock (> 45d)
  | 'no_sales_history'      // 0 sales in analysis window (Flagged for manual review)
  | 'overstocked'           // Has sales, but stock covers > 60 days
  | 'healthy';              // Stock is balanced and sufficient

export interface RestockConfig {
  supplierLeadTimeDays: number; // e.g. 7 days
  safetyStockDays: number;      // e.g. 7 days
  analysisPeriodDays: number;   // e.g. 30 days
}

export interface RestockCalculationBreakdown {
  currentStock: number;
  minStockAlert: number;
  unitsSoldInPeriod: number;
  analysisPeriodDays: number;
  periodStartDate: string;
  periodEndDate: string;
  supportingSalesReceipts: { receiptNo: string; quantity: number; date: string; customerName: string }[];
  dailySalesVelocity: number;
  leadTimeDays: number;
  safetyStockDays: number;
  leadTimeDemand: number;        // dailySalesVelocity * leadTimeDays
  safetyStockUnits: number;      // Math.max(minStockAlert, Math.ceil(dailySalesVelocity * safetyStockDays))
  targetReorderPoint: number;    // leadTimeDemand + safetyStockUnits
  shortfall: number;             // Math.max(0, targetReorderPoint - currentStock)
  recommendedOrderUnits: number; // Final rounded order units (0 if manual review or adequate)
  unitCostPrice: number;
  totalEstimatedCost: number;    // recommendedOrderUnits * unitCostPrice
  stockDurationDays: number | null; // Math.floor(currentStock / dailySalesVelocity) or null if velocity === 0
  stockDurationDisplay: string;  // e.g. "17 days" or "No sales data"
  isFlaggedForManualReview: boolean;
  isExcludedFromAutoTotal: boolean;
  warningTypes: InventoryWarningType[];
  primaryWarning: InventoryWarningType;
  explanation: string;
  businessEvidence: string;
}

export interface RestockRecommendation {
  product: Product;
  currentStock: number;
  minAlert: number;
  unitsSoldRecent: number;
  dailyVelocity: number;
  daysOfInventoryLeft: number | null;
  daysOfInventoryLeftDisplay: string;
  recommendedUnits: number;
  estimatedCost: number;
  urgency: 'critical' | 'moderate' | 'healthy' | 'manual_review' | 'overstocked';
  reason: string;
  isFlaggedForManualReview: boolean;
  isExcludedFromAutoTotal: boolean;
  warningTypes: InventoryWarningType[];
  primaryWarning: InventoryWarningType;
  breakdown: RestockCalculationBreakdown;
}

// ==========================================
// AI BUSINESS COPILOT TYPES
// ==========================================

export type CopilotAlertSeverity = 'critical' | 'warning' | 'opportunity' | 'info';

export interface IntelligentAlert {
  id: string;
  type:
    | 'critical_stock'
    | 'reorder_threshold'
    | 'overdue_debt'
    | 'unusual_expense'
    | 'dormant_inventory'
    | 'sales_decline'
    | 'margin_squeeze';
  severity: CopilotAlertSeverity;
  title: string;
  message: string;
  metricValue: string;
  timestamp: string;
  actionLabel: string;
  actionType: 'restock' | 'remind_debtor' | 'review_expenses' | 'pos_sale' | 'view_customer' | 'create_promo';
  actionTarget?: any;
  dismissed?: boolean;
}

export interface BusinessHealthMetric {
  name: string;
  score: number; // 0 - 100
  status: 'excellent' | 'good' | 'caution' | 'critical';
  valueDisplay: string;
  benchmark: string;
  detail: string;
}

export interface BusinessHealthAudit {
  overallScore: number; // 0 - 100
  status: 'healthy' | 'good' | 'needs_attention' | 'critical';
  statusLabel: string;
  summary: string;
  metrics: {
    salesMomentum: BusinessHealthMetric;
    workingCapital: BusinessHealthMetric;
    inventoryEfficiency: BusinessHealthMetric;
    profitDiscipline: BusinessHealthMetric;
  };
  keyTakeaway: string;
  evaluatedAt: string;
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  category: 'increasing_demand' | 'margin_expansion' | 'promo_campaign' | 'vip_upsell' | 'cash_unlock';
  categoryLabel: string;
  potentialImpact: string; // e.g. "+₦450,000 potential profit"
  description: string;
  evidence: string;
  suggestedAction: string;
  actionLabel: string;
  actionType: 'restock' | 'pos_sale' | 'view_customer' | 'remind_debtor' | 'review_expenses' | 'create_promo';
  actionTarget?: any;
}

export interface ActionableRecommendationItem {
  id: string;
  title: string;
  whatWasIdentified: string;
  whyItMatters: string;
  supportingData: string;
  practicalAction: string;
  category: 'inventory' | 'cashflow' | 'revenue' | 'cost_control';
  urgency: 'critical' | 'high' | 'medium';
  actionLabel: string;
  actionType: 'restock' | 'remind_debtor' | 'view_customer' | 'review_expenses' | 'pos_sale' | 'create_promo';
  actionTarget?: any;
}

export interface BusinessReport {
  period: 'daily' | 'weekly' | 'monthly';
  periodLabel: string;
  reportDate: string;
  executiveSummary: string;
  kpis: {
    label: string;
    value: string;
    subtext?: string;
    isPositive?: boolean;
  }[];
  topAchievements: string[];
  criticalAttentionItems: string[];
  actionPlan: string[];
  generatedAt: string;
}




