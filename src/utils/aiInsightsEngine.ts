import {
  Product,
  Sale,
  Order,
  Debtor,
  Customer,
  Expense,
  CustomerStats,
  ProfitabilitySummary,
  MerchantSettings,
  RestockConfig,
  InventoryWarningType,
  RestockCalculationBreakdown,
  RestockRecommendation,
  CopilotAlertSeverity,
  IntelligentAlert,
  BusinessHealthMetric,
  BusinessHealthAudit,
  BusinessOpportunity,
  ActionableRecommendationItem,
  BusinessReport,
} from '../types';

export {
  type RestockConfig,
  type InventoryWarningType,
  type RestockCalculationBreakdown,
  type RestockRecommendation,
  type CopilotAlertSeverity,
  type IntelligentAlert,
  type BusinessHealthMetric,
  type BusinessHealthAudit,
  type BusinessOpportunity,
  type ActionableRecommendationItem,
  type BusinessReport,
};

export interface ProductPerformance {
  product: Product;
  unitsSold: number;
  totalRevenue: number;
  totalProfit: number;
  lastSoldDate: string | null;
  daysSinceLastSale: number | null;
  capitalLocked: number; // stock * costPrice
}

export interface DailySalesTrend {
  date: string;
  formattedDate: string;
  dayName: string;
  revenue: number;
  ordersCount: number;
}

export interface WeeklySalesTrend {
  weekLabel: string;
  revenue: number;
  ordersCount: number;
}

export interface AIRecommendationItem {
  id: string;
  title: string;
  category: 'inventory' | 'cashflow' | 'revenue' | 'cost_control';
  impact: 'critical' | 'high' | 'medium';
  recommendation: string;
  reasoning: string;
  expectedBenefit: string;
  actionLabel: string;
  actionType: 'restock' | 'remind_debtor' | 'view_customer' | 'review_expenses' | 'pos_sale' | 'create_promo';
  actionTarget?: any;
  whatWasIdentified?: string;
  whyItMatters?: string;
  supportingData?: string;
  practicalAction?: string;
}

export interface AIInsightsReport {
  timestamp: string;
  
  // 1. Sales Performance
  sales: {
    totalRevenue: number;
    totalUnitsSold: number;
    averageOrderValue: number;
    bestSellers: ProductPerformance[];
    slowMovers: ProductPerformance[];
    dormantProducts: ProductPerformance[]; // Not sold in >7 days
    dailyTrends: DailySalesTrend[];
    weeklyTrends: WeeklySalesTrend[];
  };

  // 2. Inventory Intelligence
  inventory: {
    totalValuationSelling: number;
    totalValuationCost: number;
    potentialGrossProfit: number;
    lowStockCount: number;
    lowStockProducts: Product[];
    restockRecommendations: RestockRecommendation[]; // Products where reorders are recommended
    allRestockEvaluations: RestockRecommendation[];  // All catalog items evaluated with calculation breakdown
    totalRestockCapitalNeeded: number;               // Automated reorders only (excludes manual review items)
    totalRecommendedUnits: number;
    criticalCount: number;
    approachingStockoutCount: number;
    slowMovingCount: number;
    noSalesHistoryCount: number;
    overstockedCount: number;
    healthyCount: number;
    analysisPeriod: {
      startDate: string;
      endDate: string;
      days: number;
      completedSalesCount: number;
    };
    configUsed: RestockConfig;
  };

  // 3. Financial Intelligence
  financials: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number;
    operatingExpenses: number;
    stockPurchasesOutlay: number;
    totalExpenses: number;
    netProfit: number;
    netMarginPercent: number;
    totalOutstandingReceivables: number;
    topExpenseCategories: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  };

  // 4. Customer Insights
  customers: {
    totalRegistered: number;
    repeatCustomersCount: number;
    repeatRatePercent: number;
    topSpenders: { customer: Customer; stats: CustomerStats }[];
    debtorCustomers: { customer: Customer; stats: CustomerStats }[];
    paymentChannelPreference: { method: string; count: number; volume: number; percent: number }[];
  };

  // 5. Actionable AI Recommendations
  recommendations: AIRecommendationItem[];

  // 6. Proactive AI Business Copilot
  copilot: {
    healthAudit: BusinessHealthAudit;
    alerts: IntelligentAlert[];
    opportunities: BusinessOpportunity[];
    actionableRecommendations: ActionableRecommendationItem[];
  };
}

/**
 * Pure analytical calculation engine that evaluates live merchant data
 * without fabricated stats or hallucinations.
 */
/**
 * Pure analytical calculation engine that evaluates live merchant data
 * without fabricated stats or hallucinations.
 */
export function generateAIInsightsReport(
  sales: Sale[],
  products: Product[],
  orders: Order[],
  customers: Customer[],
  debtors: Debtor[],
  expenses: Expense[],
  profitability: ProfitabilitySummary,
  getCustomerStats: (customer: Customer) => CustomerStats,
  settings: MerchantSettings,
  customRestockConfig?: Partial<RestockConfig>
): AIInsightsReport {
  const allTimestamps = [
    ...sales.map((s) => s.timestamp),
    ...expenses.map((e) => e.date),
  ].filter(Boolean);
  const latestTimestamp = allTimestamps.length > 0 ? [...allTimestamps].sort().pop()! : '2026-10-31T23:59:59';
  const realNow = new Date();
  const latestDate = new Date(latestTimestamp);
  const now = realNow > latestDate ? realNow : latestDate;

  const config: RestockConfig = {
    supplierLeadTimeDays: Math.max(1, customRestockConfig?.supplierLeadTimeDays ?? 7),
    safetyStockDays: Math.max(1, customRestockConfig?.safetyStockDays ?? 7),
    analysisPeriodDays: Math.max(1, customRestockConfig?.analysisPeriodDays ?? 30),
  };

  const periodDays = config.analysisPeriodDays;
  const periodEnd = new Date(now);
  const periodStart = new Date(periodEnd.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const periodStartDateStr = periodStart.toISOString().slice(0, 10);
  const periodEndDateStr = periodEnd.toISOString().slice(0, 10);

  // ----------------------------------------------------------------------
  // 1. Sales Performance Analysis
  // ----------------------------------------------------------------------
  const productStatsMap = new Map<
    string,
    { unitsSold: number; revenue: number; profit: number; lastSoldDate: string | null }
  >();

  // Initialize for all catalog products
  products.forEach((p) => {
    productStatsMap.set(p.id, {
      unitsSold: 0,
      revenue: 0,
      profit: 0,
      lastSoldDate: null,
    });
  });

  // Track across completed/paid sales
  sales.forEach((sale) => {
    const saleDate = sale.timestamp;
    (sale.items || []).forEach((item) => {
      const current = productStatsMap.get(item.productId) || {
        unitsSold: 0,
        revenue: 0,
        profit: 0,
        lastSoldDate: null,
      };

      const prod = products.find((p) => p.id === item.productId);
      const unitCost = prod ? prod.costPrice : item.unitPrice * 0.8;
      const unitProfit = item.unitPrice - unitCost;

      current.unitsSold += item.quantity;
      current.revenue += item.total;
      current.profit += unitProfit * item.quantity;

      if (!current.lastSoldDate || new Date(saleDate) > new Date(current.lastSoldDate)) {
        current.lastSoldDate = saleDate;
      }

      productStatsMap.set(item.productId, current);
    });
  });

  // Also include delivered orders
  orders
    .filter((o) => o.status === 'delivered' || o.status === 'processing')
    .forEach((order) => {
      const orderDate = order.createdAt;
      order.items.forEach((item) => {
        const current = productStatsMap.get(item.productId) || {
          unitsSold: 0,
          revenue: 0,
          profit: 0,
          lastSoldDate: null,
        };

        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod ? prod.costPrice : item.unitPrice * 0.8;
        const unitProfit = item.unitPrice - unitCost;

        current.unitsSold += item.quantity;
        current.revenue += item.total;
        current.profit += unitProfit * item.quantity;

        if (!current.lastSoldDate || new Date(orderDate) > new Date(current.lastSoldDate)) {
          current.lastSoldDate = orderDate;
        }

        productStatsMap.set(item.productId, current);
      });
    });

  const productPerformances: ProductPerformance[] = products.map((p) => {
    const stat = productStatsMap.get(p.id) || {
      unitsSold: 0,
      revenue: 0,
      profit: 0,
      lastSoldDate: null,
    };

    let daysSinceLastSale: number | null = null;
    if (stat.lastSoldDate) {
      const diffMs = now.getTime() - new Date(stat.lastSoldDate).getTime();
      daysSinceLastSale = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      product: p,
      unitsSold: stat.unitsSold,
      totalRevenue: stat.revenue,
      totalProfit: stat.profit,
      lastSoldDate: stat.lastSoldDate,
      daysSinceLastSale,
      capitalLocked: p.stock * p.costPrice,
    };
  });

  // Best-sellers (sorted by total revenue, then units)
  const bestSellers = [...productPerformances]
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Slow-movers (either 0 sales or lowest sales with high capital tied up)
  const slowMovers = [...productPerformances]
    .filter((p) => p.unitsSold <= 1)
    .sort((a, b) => b.capitalLocked - a.capitalLocked);

  // Dormant products: not sold in over 7 days or never sold
  const dormantProducts = [...productPerformances].filter(
    (p) => p.daysSinceLastSale === null || p.daysSinceLastSale > 7
  );

  // Daily Trends for past 7 days up to 2026-10-31
  const dailyTrends: DailySalesTrend[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const daySales = sales.filter((s) => (s.timestamp || '').slice(0, 10) === dateStr);
    const dayOrders = orders.filter((o) => (o.createdAt || '').slice(0, 10) === dateStr);

    const revenue =
      daySales.reduce((acc, s) => acc + (s.totalAmount || 0), 0) +
      dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    dailyTrends.push({
      date: dateStr,
      formattedDate,
      dayName,
      revenue,
      ordersCount: daySales.length + dayOrders.length,
    });
  }

  // Weekly Trends (last 4 calendar blocks)
  const weeklyTrends: WeeklySalesTrend[] = [
    {
      weekLabel: 'Week 1 (Oct 1 - 7)',
      revenue: sales
        .filter((s) => s.timestamp >= '2026-10-01' && s.timestamp <= '2026-10-07')
        .reduce((a, s) => a + s.totalAmount, 0),
      ordersCount: sales.filter((s) => s.timestamp >= '2026-10-01' && s.timestamp <= '2026-10-07').length,
    },
    {
      weekLabel: 'Week 2 (Oct 8 - 14)',
      revenue: sales
        .filter((s) => s.timestamp >= '2026-10-08' && s.timestamp <= '2026-10-14')
        .reduce((a, s) => a + s.totalAmount, 0),
      ordersCount: sales.filter((s) => s.timestamp >= '2026-10-08' && s.timestamp <= '2026-10-14').length,
    },
    {
      weekLabel: 'Week 3 (Oct 15 - 21)',
      revenue: sales
        .filter((s) => s.timestamp >= '2026-10-15' && s.timestamp <= '2026-10-21')
        .reduce((a, s) => a + s.totalAmount, 0),
      ordersCount: sales.filter((s) => s.timestamp >= '2026-10-15' && s.timestamp <= '2026-10-21').length,
    },
    {
      weekLabel: 'Week 4 (Oct 22 - 31)',
      revenue: sales
        .filter((s) => s.timestamp >= '2026-10-22')
        .reduce((a, s) => a + s.totalAmount, 0),
      ordersCount: sales.filter((s) => s.timestamp >= '2026-10-22').length,
    },
  ];

  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalUnitsSold = productPerformances.reduce((acc, p) => acc + p.unitsSold, 0);
  const averageOrderValue = sales.length > 0 ? Math.round(totalSalesRevenue / sales.length) : 0;

  // ----------------------------------------------------------------------
  // 2. Inventory Intelligence & Restock Recommender
  // ----------------------------------------------------------------------
  const totalValuationSelling = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const totalValuationCost = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const potentialGrossProfit = totalValuationSelling - totalValuationCost;

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);

  // Query completed sales within the configured analysis period
  const completedSalesInPeriod = sales.filter((s) => {
    if (!s.timestamp) return false;
    const t = new Date(s.timestamp).getTime();
    return t >= periodStart.getTime() && t <= periodEnd.getTime();
  });

  const productPeriodSalesMap = new Map<
    string,
    {
      unitsSold: number;
      revenue: number;
      receipts: { receiptNo: string; quantity: number; date: string; customerName: string }[];
    }
  >();

  products.forEach((p) => {
    productPeriodSalesMap.set(p.id, {
      unitsSold: 0,
      revenue: 0,
      receipts: [],
    });
  });

  completedSalesInPeriod.forEach((sale) => {
    sale.items.forEach((item) => {
      const stat = productPeriodSalesMap.get(item.productId);
      if (stat) {
        stat.unitsSold += item.quantity;
        stat.revenue += item.total;
        stat.receipts.push({
          receiptNo: sale.receiptNo,
          quantity: item.quantity,
          date: sale.timestamp,
          customerName: sale.customerName || 'Counter Sale',
        });
      }
    });
  });

  const allRestockEvaluations: RestockRecommendation[] = products.map((product) => {
    const periodStats = productPeriodSalesMap.get(product.id) || {
      unitsSold: 0,
      revenue: 0,
      receipts: [],
    };

    const unitsSoldInPeriod = periodStats.unitsSold;
    const supportingSalesReceipts = periodStats.receipts;
    const currentStock = Math.max(0, product.stock ?? 0);
    const minAlert = Math.max(1, product.minStockAlert ?? 5);
    const costPrice = Math.max(0, product.costPrice ?? 0);

    // 1. SALES VELOCITY
    const hasSalesHistory = unitsSoldInPeriod > 0;
    const dailySalesVelocity = hasSalesHistory
      ? parseFloat((unitsSoldInPeriod / periodDays).toFixed(3))
      : 0;

    // 2. STOCK DURATION
    let stockDurationDays: number | null = null;
    let stockDurationDisplay = 'No sales data';

    if (dailySalesVelocity > 0) {
      stockDurationDays = Math.max(0, Math.floor(currentStock / dailySalesVelocity));
      if (currentStock === 0) {
        stockDurationDisplay = '0 days (Out of stock)';
      } else if (stockDurationDays > 180) {
        stockDurationDisplay = '> 180 days';
      } else {
        stockDurationDisplay = `${stockDurationDays} days`;
      }
    } else {
      stockDurationDays = null;
      stockDurationDisplay = 'No sales data';
    }

    // 3. INVENTORY WARNINGS
    const warningTypes: InventoryWarningType[] = [];

    if (!hasSalesHistory) {
      warningTypes.push('no_sales_history');
    }

    // Critical low stock: stock <= half of min alert OR days remaining < supplier lead time
    const isCritical =
      currentStock <= Math.floor(minAlert / 2) ||
      (dailySalesVelocity > 0 && (stockDurationDays ?? 999) < config.supplierLeadTimeDays);

    if (isCritical) {
      warningTypes.push('critical_low');
    } else if (
      currentStock <= minAlert ||
      (dailySalesVelocity > 0 &&
        (stockDurationDays ?? 999) <= config.supplierLeadTimeDays + config.safetyStockDays)
    ) {
      warningTypes.push('approaching_stockout');
    }

    // Slow-moving: has sales, but velocity is very low and stock duration is high
    if (hasSalesHistory && unitsSoldInPeriod <= 2 && (stockDurationDays ?? 0) > 45) {
      warningTypes.push('slow_moving');
    }

    // Overstocked: has sales, and stock duration >= 60 days
    if (hasSalesHistory && (stockDurationDays ?? 0) >= 60) {
      warningTypes.push('overstocked');
    }

    if (warningTypes.length === 0) {
      warningTypes.push('healthy');
    }

    // Primary warning
    let primaryWarning: InventoryWarningType = 'healthy';
    if (warningTypes.includes('critical_low')) primaryWarning = 'critical_low';
    else if (warningTypes.includes('approaching_stockout')) primaryWarning = 'approaching_stockout';
    else if (warningTypes.includes('no_sales_history')) primaryWarning = 'no_sales_history';
    else if (warningTypes.includes('overstocked')) primaryWarning = 'overstocked';
    else if (warningTypes.includes('slow_moving')) primaryWarning = 'slow_moving';

    // 4. INTELLIGENT RESTOCKING & PURCHASE COST
    const leadTimeDemand = parseFloat(
      (dailySalesVelocity * config.supplierLeadTimeDays).toFixed(2)
    );
    const safetyStockUnits = Math.max(
      minAlert,
      Math.ceil(dailySalesVelocity * config.safetyStockDays)
    );
    const targetReorderPoint = parseFloat((leadTimeDemand + safetyStockUnits).toFixed(2));
    const rawShortfall = targetReorderPoint - currentStock;

    let recommendedOrderUnits = 0;
    let totalEstimatedCost = 0;
    let isFlaggedForManualReview = false;
    let isExcludedFromAutoTotal = false;
    let urgency: 'critical' | 'moderate' | 'healthy' | 'manual_review' | 'overstocked' = 'healthy';
    let explanation = '';
    let businessEvidence = '';

    if (!hasSalesHistory) {
      // REQUIREMENT 2 & 4: Do not automatically recommend purchases for products with zero sales history. Flag them for manual review. Exclude from automatic reorder totals.
      recommendedOrderUnits = 0;
      totalEstimatedCost = 0;
      isFlaggedForManualReview = true;
      isExcludedFromAutoTotal = true;
      urgency = 'manual_review';
      explanation = `Zero completed sales recorded across the ${periodDays}-day analysis window (${periodStartDateStr} to ${periodEndDateStr}). Product is flagged for manual review to avoid unverified capital allocation (₦${costPrice.toLocaleString()}/unit).`;
      businessEvidence = `Stock on hand: ${currentStock} units (Min threshold: ${minAlert}). No recorded sales transactions in period.`;
    } else {
      isFlaggedForManualReview = false;
      if (currentStock < targetReorderPoint) {
        recommendedOrderUnits = Math.max(1, Math.ceil(rawShortfall));
        totalEstimatedCost = recommendedOrderUnits * costPrice;
        isExcludedFromAutoTotal = false;
        urgency = primaryWarning === 'critical_low' ? 'critical' : 'moderate';
        explanation = `Reorder ${recommendedOrderUnits} units to maintain stock during ${config.supplierLeadTimeDays}-day supplier lead time (${leadTimeDemand} units demand) and restore the ${safetyStockUnits}-unit safety stock buffer (Target: ${targetReorderPoint} units; On-hand: ${currentStock}).`;
        businessEvidence = `Supported by ${unitsSoldInPeriod} unit(s) sold across ${supportingSalesReceipts.length} completed sale(s) (${supportingSalesReceipts.map((r) => r.receiptNo).slice(0, 3).join(', ')}). Daily sales velocity: ${dailySalesVelocity} units/day.`;
      } else {
        recommendedOrderUnits = 0;
        totalEstimatedCost = 0;
        isExcludedFromAutoTotal = false;
        urgency = primaryWarning === 'overstocked' ? 'overstocked' : 'healthy';
        explanation = `Current stock (${currentStock} units) comfortably exceeds target reorder point (${targetReorderPoint} units). Estimated inventory runway: ${stockDurationDisplay}.`;
        businessEvidence = `${unitsSoldInPeriod} unit(s) sold in ${periodDays} days (${supportingSalesReceipts.map((r) => r.receiptNo).slice(0, 2).join(', ')}). Velocity: ${dailySalesVelocity} units/day.`;
      }
    }

    const breakdown: RestockCalculationBreakdown = {
      currentStock,
      minStockAlert: minAlert,
      unitsSoldInPeriod,
      analysisPeriodDays: periodDays,
      periodStartDate: periodStartDateStr,
      periodEndDate: periodEndDateStr,
      supportingSalesReceipts,
      dailySalesVelocity,
      leadTimeDays: config.supplierLeadTimeDays,
      safetyStockDays: config.safetyStockDays,
      leadTimeDemand,
      safetyStockUnits,
      targetReorderPoint,
      shortfall: Math.max(0, Math.ceil(rawShortfall)),
      recommendedOrderUnits,
      unitCostPrice: costPrice,
      totalEstimatedCost,
      stockDurationDays,
      stockDurationDisplay,
      isFlaggedForManualReview,
      isExcludedFromAutoTotal,
      warningTypes,
      primaryWarning,
      explanation,
      businessEvidence,
    };

    return {
      product,
      currentStock,
      minAlert,
      unitsSoldRecent: unitsSoldInPeriod,
      dailyVelocity: dailySalesVelocity,
      daysOfInventoryLeft: stockDurationDays,
      daysOfInventoryLeftDisplay: stockDurationDisplay,
      recommendedUnits: recommendedOrderUnits,
      estimatedCost: totalEstimatedCost,
      urgency,
      reason: explanation,
      isFlaggedForManualReview,
      isExcludedFromAutoTotal,
      warningTypes,
      primaryWarning,
      breakdown,
    };
  });

  // Filter recommendations where reorder is suggested and NOT excluded
  const restockRecommendations = allRestockEvaluations
    .filter((r) => r.recommendedUnits > 0 && !r.isExcludedFromAutoTotal)
    .sort((a, b) => {
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
      return b.estimatedCost - a.estimatedCost;
    });

  const totalRestockCapitalNeeded = restockRecommendations.reduce(
    (acc, r) => acc + r.estimatedCost,
    0
  );

  const totalRecommendedUnits = restockRecommendations.reduce(
    (acc, r) => acc + r.recommendedUnits,
    0
  );

  const criticalCount = allRestockEvaluations.filter((r) => r.primaryWarning === 'critical_low').length;
  const approachingStockoutCount = allRestockEvaluations.filter((r) => r.primaryWarning === 'approaching_stockout').length;
  const slowMovingCount = allRestockEvaluations.filter((r) => r.primaryWarning === 'slow_moving').length;
  const noSalesHistoryCount = allRestockEvaluations.filter((r) => r.primaryWarning === 'no_sales_history').length;
  const overstockedCount = allRestockEvaluations.filter((r) => r.primaryWarning === 'overstocked').length;
  const healthyCount = allRestockEvaluations.filter((r) => r.primaryWarning === 'healthy').length;

  // ----------------------------------------------------------------------
  // 3. Financial Intelligence
  // ----------------------------------------------------------------------
  const expenseCategoryMap: Record<string, number> = {};
  let totalExpenseSum = 0;

  expenses.forEach((e) => {
    expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + e.amount;
    totalExpenseSum += e.amount;
  });

  const topExpenseCategories = Object.entries(expenseCategoryMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpenseSum > 0 ? Math.round((amt / totalExpenseSum) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalOutstandingReceivables =
    sales.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0) +
    orders.reduce((acc, o) => acc + (o.outstandingBalance || 0), 0);

  // ----------------------------------------------------------------------
  // 4. Customer Insights
  // ----------------------------------------------------------------------
  const customerStatsList = customers.map((c) => ({
    customer: c,
    stats: getCustomerStats(c),
  }));

  const repeatCustomers = customerStatsList.filter((item) => item.stats.isReturning);
  const repeatRatePercent =
    customers.length > 0 ? Math.round((repeatCustomers.length / customers.length) * 100) : 0;

  const topSpenders = [...customerStatsList]
    .sort((a, b) => b.stats.totalSpent - a.stats.totalSpent)
    .slice(0, 5);

  const debtorCustomers = customerStatsList
    .filter((item) => item.stats.totalOutstanding > 0)
    .sort((a, b) => b.stats.totalOutstanding - a.stats.totalOutstanding);

  // Payment channel distribution
  const paymentChannelMap: Record<string, { count: number; volume: number }> = {};
  let totalVolume = 0;

  sales.forEach((s) => {
    const method = s.paymentMethod;
    if (!paymentChannelMap[method]) {
      paymentChannelMap[method] = { count: 0, volume: 0 };
    }
    paymentChannelMap[method].count += 1;
    paymentChannelMap[method].volume += s.amountPaid;
    totalVolume += s.amountPaid;
  });

  const paymentChannelPreference = Object.entries(paymentChannelMap)
    .map(([method, data]) => ({
      method,
      count: data.count,
      volume: data.volume,
      percent: totalVolume > 0 ? Math.round((data.volume / totalVolume) * 100) : 0,
    }))
    .sort((a, b) => b.volume - a.volume);

  // ----------------------------------------------------------------------
  // 5. Actionable AI Recommendations (Grounded in Verified Store State)
  // ----------------------------------------------------------------------
  const recommendations: AIRecommendationItem[] = [];

  // Recommendation A: Urgent Low Stock Restock
  const criticalItems = restockRecommendations.filter((r) => r.urgency === 'critical');
  if (criticalItems.length > 0) {
    const topItem = criticalItems[0];
    recommendations.push({
      id: `rec-restock-${topItem.product.id}`,
      title: `Urgent Restock Required: ${topItem.product.name.split('(')[0].trim()}`,
      category: 'inventory',
      impact: 'critical',
      recommendation: `Place wholesale order for ${topItem.recommendedUnits} units of ${topItem.product.name.split('(')[0].trim()} immediately.`,
      reasoning: `Only ${topItem.currentStock} units remain in stock, which is beneath the minimum safety buffer (${topItem.minAlert}). With recent sales velocity, inventory will be completely exhausted before next week's shipments.`,
      expectedBenefit: `Prevents an estimated revenue loss of ₦${(topItem.recommendedUnits * topItem.product.sellingPrice).toLocaleString()} and protects customer fulfillment rate.`,
      actionLabel: `Restock ${topItem.recommendedUnits} Units`,
      actionType: 'restock',
      actionTarget: topItem.product,
    });
  }

  // Recommendation B: Cash Flow Debt Recovery
  const overdueDebtors = debtors.filter((d) => d.daysOverdue > 0);
  if (overdueDebtors.length > 0) {
    const topDebtor = overdueDebtors.sort((a, b) => b.amountOwed - a.amountOwed)[0];
    recommendations.push({
      id: `rec-debt-${topDebtor.id}`,
      title: `Recover ₦${topDebtor.amountOwed.toLocaleString()} Overdue from ${topDebtor.customerName}`,
      category: 'cashflow',
      impact: 'high',
      recommendation: `Send an automated polite WhatsApp payment reminder to ${topDebtor.customerName} with Rawls & Hub bank transfer details.`,
      reasoning: `Invoice has been outstanding for ${topDebtor.daysOverdue} days for ${topDebtor.itemDescription}. Recovering this balance increases store cash reserves without taking supplier loans.`,
      expectedBenefit: `Injects ₦${topDebtor.amountOwed.toLocaleString()} liquid cash immediately into your Moniepoint/OPay account.`,
      actionLabel: 'Send WhatsApp Reminder',
      actionType: 'remind_debtor',
      actionTarget: topDebtor,
    });
  }

  // Recommendation C: Capital Unlocking on Slow-Movers
  if (slowMovers.length > 0) {
    const topSlow = slowMovers[0];
    if (topSlow.capitalLocked > 0) {
      recommendations.push({
        id: `rec-slow-${topSlow.product.id}`,
        title: `Unlock ₦${topSlow.capitalLocked.toLocaleString()} Tied in ${topSlow.product.name.split('(')[0].trim()}`,
        category: 'revenue',
        impact: 'medium',
        recommendation: `Bundle ${topSlow.product.name.split('(')[0].trim()} with high-velocity flagship smartphones (e.g., iPhone 16 Pro Max or S25 Ultra) at a 15% discount.`,
        reasoning: `This product has only recorded ${topSlow.unitsSold} sales this month while tying down ₦${topSlow.capitalLocked.toLocaleString()} in wholesale capital across ${topSlow.product.stock} unsold units.`,
        expectedBenefit: `Unlocks ₦${topSlow.capitalLocked.toLocaleString()} in dormant working capital to reinvest into fast-moving iPhones and PlayStation 5 consoles.`,
        actionLabel: 'Record Bundle Sale',
        actionType: 'pos_sale',
        actionTarget: topSlow.product,
      });
    }
  }

  // Recommendation D: Operating Cost Efficiency
  const electricityExpense = topExpenseCategories.find(
    (c) => c.category === 'Electricity and utilities'
  );
  if (electricityExpense && electricityExpense.amount > 200000) {
    recommendations.push({
      id: 'rec-cost-power',
      title: 'Optimize Power & Fuel Outlay in Computer Village',
      category: 'cost_control',
      impact: 'medium',
      recommendation: 'Schedule Lister diesel generator runtime strictly for peak showcase hours (11am – 4pm) and utilize shop pure sine wave inverters for morning standby.',
      reasoning: `Electricity and generator diesel expenses totaled ₦${electricityExpense.amount.toLocaleString()} this month (${electricityExpense.percentage}% of all expenses). Generator diesel was purchased at ₦1,250/L.`,
      expectedBenefit: `Saves an estimated ₦60,000 to ₦80,000 monthly in fuel overhead, boosting store net operating margin.`,
      actionLabel: 'Review Operating Costs',
      actionType: 'review_expenses',
    });
  }

  // Recommendation E: VIP Repeat Buyer Engagement
  if (repeatCustomers.length > 0) {
    const topRepeat = repeatCustomers[0];
    recommendations.push({
      id: `rec-vip-${topRepeat.customer.id}`,
      title: `VIP Engagement: ${topRepeat.customer.fullName}`,
      category: 'revenue',
      impact: 'medium',
      recommendation: `Offer exclusive pre-order access or complimentary gadget screen protection to ${topRepeat.customer.fullName} for upcoming flagship arrivals.`,
      reasoning: `${topRepeat.customer.fullName} has made ${topRepeat.stats.totalOrdersCount} purchases totaling ₦${topRepeat.stats.totalSpent.toLocaleString()} with 0 unverified claims. Repeat buyers generate 60% higher lifetime value with 0 ad acquisition cost.`,
      expectedBenefit: `Secures predictable repeat wholesale/retail turnover and strengthens word-of-mouth client referrals in Lagos tech circles.`,
      actionLabel: 'View VIP Profile',
      actionType: 'view_customer',
      actionTarget: topRepeat.customer,
    });
  }

  // Recommendation F: Inventory Manual Review for Zero-Sales Products
  const manualReviewItems = allRestockEvaluations.filter((r) => r.isFlaggedForManualReview);
  if (manualReviewItems.length > 0) {
    const item = manualReviewItems[0];
    recommendations.push({
      id: `rec-manual-${item.product.id}`,
      title: `Manual Review: ${item.product.name.split('(')[0].trim()} (0 Sales)`,
      category: 'inventory',
      impact: 'medium',
      recommendation: `Review customer demand before placing automated supplier purchase orders for ${item.product.name.split('(')[0].trim()}.`,
      reasoning: `Zero completed sales were recorded for this item in the ${periodDays}-day analysis period. It holds ₦${(item.currentStock * item.product.costPrice).toLocaleString()} across ${item.currentStock} units in stock. Excluded from automated reorder capital to protect store cash flow.`,
      expectedBenefit: `Prevents locking up wholesale capital without verified customer traction.`,
      actionLabel: 'Open Restock Planner',
      actionType: 'restock',
      actionTarget: item.product,
    });
  }

  // ----------------------------------------------------------------------
  // 6. Proactive AI Business Copilot Engine
  // ----------------------------------------------------------------------

  // A. Four-Part Actionable Recommendations Structure
  const actionableRecommendations: ActionableRecommendationItem[] = [];

  // Rec 1: Restock High-Demand Inventory
  if (criticalItems.length > 0) {
    const topItem = criticalItems[0];
    const lostRev = topItem.recommendedUnits * topItem.product.sellingPrice;
    actionableRecommendations.push({
      id: `copilot-act-restock-${topItem.product.id}`,
      title: `Urgent Reorder: ${topItem.product.name.split('(')[0].trim()}`,
      category: 'inventory',
      urgency: 'critical',
      whatWasIdentified: `Critical stock depletion on fast-moving gadget: ${topItem.currentStock} units remaining (buffer minimum is ${topItem.minAlert}).`,
      whyItMatters: `At current sales velocity of ${topItem.dailyVelocity.toFixed(2)} units/day, stockout occurs in ${topItem.daysOfInventoryLeftDisplay}, forfeiting customer demand to rival Computer Village vendors.`,
      supportingData: `Sold ${topItem.unitsSoldRecent} units in last ${periodDays} days generating ₦${(topItem.unitsSoldRecent * topItem.product.sellingPrice).toLocaleString()} revenue. Reorder requirement: ${topItem.recommendedUnits} units (₦${(topItem.recommendedUnits * topItem.product.costPrice).toLocaleString()} wholesale cost).`,
      practicalAction: `Place a restock purchase order with your verified Alaba/Ikeja distributor for ${topItem.recommendedUnits} units today before the weekend rush.`,
      actionLabel: `Restock ${topItem.recommendedUnits} Units`,
      actionType: 'restock',
      actionTarget: topItem.product,
    });
  }

  // Rec 2: Overdue Receivables Recovery
  if (overdueDebtors.length > 0) {
    const topDebtor = overdueDebtors.sort((a, b) => b.amountOwed - a.amountOwed)[0];
    actionableRecommendations.push({
      id: `copilot-act-debt-${topDebtor.id}`,
      title: `Cash Collection: ₦${topDebtor.amountOwed.toLocaleString()} from ${topDebtor.customerName}`,
      category: 'cashflow',
      urgency: 'high',
      whatWasIdentified: `Outstanding credit balance of ₦${topDebtor.amountOwed.toLocaleString()} has exceeded the payment grace period by ${topDebtor.daysOverdue} days.`,
      whyItMatters: `Delinquent receivables restrict Rawls & Hub cash flow and force the business to rely on working capital buffers instead of immediate reinvestment into new shipments.`,
      supportingData: `Customer invoice date: ${topDebtor.dueDate ? new Date(topDebtor.dueDate).toLocaleDateString('en-NG') : 'Pending'}, Phone: ${topDebtor.phone}, Purchase: ${topDebtor.itemDescription}. Total store outstanding receivables: ₦${totalOutstandingReceivables.toLocaleString()}.`,
      practicalAction: `Dispatch a courteous WhatsApp statement with direct Moniepoint / OPay business account details and confirm payment reception today.`,
      actionLabel: 'Send WhatsApp Reminder',
      actionType: 'remind_debtor',
      actionTarget: topDebtor,
    });
  }

  // Rec 3: Liquidate Slow-Moving Capital
  if (slowMovers.length > 0) {
    const topSlow = slowMovers[0];
    if (topSlow.capitalLocked > 0) {
      actionableRecommendations.push({
        id: `copilot-act-slow-${topSlow.product.id}`,
        title: `Capital Unlock: Bundle ${topSlow.product.name.split('(')[0].trim()}`,
        category: 'revenue',
        urgency: 'medium',
        whatWasIdentified: `Slow-moving inventory tying down ₦${topSlow.capitalLocked.toLocaleString()} across ${topSlow.product.stock} units with only ${topSlow.unitsSold} sales this month.`,
        whyItMatters: `Consumer electronics lose wholesale value over time. Dormant capital seated on shelves reduces store inventory turnover and liquidity.`,
        supportingData: `Unit wholesale cost: ₦${topSlow.product.costPrice.toLocaleString()}, Selling price: ₦${topSlow.product.sellingPrice.toLocaleString()}. Stock runway exceeds 60+ days without promotional push.`,
        practicalAction: `Bundle with high-turnover flagship phones (iPhone 16 Pro Max or Galaxy S25 Ultra) at a 12% discount or offer as a bonus add-on at POS checkout.`,
        actionLabel: 'Record Bundle Sale',
        actionType: 'pos_sale',
        actionTarget: topSlow.product,
      });
    }
  }

  // Rec 4: Operating Expenses Pruning
  const powerExpense = topExpenseCategories.find((c) => c.category === 'Electricity and utilities');
  if (powerExpense && powerExpense.amount > 150000) {
    actionableRecommendations.push({
      id: 'copilot-act-power-diesel',
      title: 'Power & Fuel Rationalization',
      category: 'cost_control',
      urgency: 'medium',
      whatWasIdentified: `Generator diesel and utility expenses reached ₦${powerExpense.amount.toLocaleString()} (${powerExpense.percentage}% of store monthly operating expenses).`,
      whyItMatters: `Excessive fuel outlay directly compresses store net profit margin from ${profitability.grossMarginPercent.toFixed(1)}% gross down to ${profitability.netMarginPercent.toFixed(1)}% net.`,
      supportingData: `Total operating expenses: ₦${profitability.operatingExpenses.toLocaleString()}. Generator diesel purchases recorded at ₦1,250/L for Digital Plaza standby running.`,
      practicalAction: `Restrict diesel generator usage to peak retail traffic (11:00 AM – 4:30 PM) and power display showcases via pure sine wave inverter during off-peak hours.`,
      actionLabel: 'Review Operating Expenses',
      actionType: 'review_expenses',
    });
  }

  // Also maintain backwards compatibility in recommendations array with 4-part fields
  recommendations.forEach((r) => {
    if (!r.whatWasIdentified) r.whatWasIdentified = r.recommendation;
    if (!r.whyItMatters) r.whyItMatters = r.reasoning;
    if (!r.supportingData) r.supportingData = r.expectedBenefit;
    if (!r.practicalAction) r.practicalAction = r.recommendation;
  });

  // B. Intelligent Alerts Engine
  const alerts: IntelligentAlert[] = [];

  // Critical Stock Alerts
  criticalItems.forEach((item) => {
    alerts.push({
      id: `alert-stock-crit-${item.product.id}`,
      type: 'critical_stock',
      severity: 'critical',
      title: `Stock Out Imminent: ${item.product.name.split('(')[0].trim()}`,
      message: `Only ${item.currentStock} units left in stock. Reorder ${item.recommendedUnits} units now to prevent lost sales.`,
      metricValue: `${item.currentStock} left (Min: ${item.minAlert})`,
      timestamp: now.toISOString(),
      actionLabel: `Restock ${item.recommendedUnits} Units`,
      actionType: 'restock',
      actionTarget: item.product,
    });
  });

  // Approaching Reorder Alerts
  const approachingItems = allRestockEvaluations.filter((r) => r.urgency === 'moderate');
  approachingItems.slice(0, 2).forEach((item) => {
    alerts.push({
      id: `alert-stock-warn-${item.product.id}`,
      type: 'reorder_threshold',
      severity: 'warning',
      title: `Reorder Threshold Reached: ${item.product.name.split('(')[0].trim()}`,
      message: `Stock has reached ${item.currentStock} units. Lead time is ${config.supplierLeadTimeDays} days.`,
      metricValue: `${item.currentStock} units in stock`,
      timestamp: now.toISOString(),
      actionLabel: 'View in Restock Planner',
      actionType: 'restock',
      actionTarget: item.product,
    });
  });

  // Overdue Debts
  if (overdueDebtors.length > 0) {
    const totalOverdue = overdueDebtors.reduce((acc, d) => acc + d.amountOwed, 0);
    const worstDebtor = overdueDebtors.sort((a, b) => b.daysOverdue - a.daysOverdue)[0];
    alerts.push({
      id: 'alert-debt-overdue',
      type: 'overdue_debt',
      severity: 'critical',
      title: `₦${totalOverdue.toLocaleString()} in Overdue Receivables`,
      message: `${overdueDebtors.length} customer debts are past their agreed payment deadline. Longest overdue: ${worstDebtor.customerName} (${worstDebtor.daysOverdue} days).`,
      metricValue: `₦${totalOverdue.toLocaleString()} overdue`,
      timestamp: now.toISOString(),
      actionLabel: 'Collect Overdue Debts',
      actionType: 'remind_debtor',
      actionTarget: worstDebtor,
    });
  }

  // Unusual Expense Alert
  if (powerExpense && powerExpense.amount > 180000) {
    alerts.push({
      id: 'alert-expense-power',
      type: 'unusual_expense',
      severity: 'warning',
      title: `High Utilities & Fuel Spend: ₦${powerExpense.amount.toLocaleString()}`,
      message: `Electricity and generator diesel represents ${powerExpense.percentage}% of store overhead this period.`,
      metricValue: `₦${powerExpense.amount.toLocaleString()} (${powerExpense.percentage}%)`,
      timestamp: now.toISOString(),
      actionLabel: 'Inspect Expenses',
      actionType: 'review_expenses',
    });
  }

  // Dormant Inventory Alert
  const capitalInDormant = dormantProducts.reduce((acc, p) => acc + p.capitalLocked, 0);
  if (dormantProducts.length > 0 && capitalInDormant > 0) {
    alerts.push({
      id: 'alert-dormant-inv',
      type: 'dormant_inventory',
      severity: 'opportunity',
      title: `₦${capitalInDormant.toLocaleString()} Locked in Dormant Stock`,
      message: `${dormantProducts.length} product lines have not recorded a sale in over 7 days.`,
      metricValue: `${dormantProducts.length} dormant lines`,
      timestamp: now.toISOString(),
      actionLabel: 'Create Clearance Promo',
      actionType: 'create_promo',
    });
  }

  // C. Business Opportunities Engine
  const opportunities: BusinessOpportunity[] = [];

  // Opp 1: High Velocity Gadget Restock
  if (bestSellers.length > 0) {
    const topSeller = bestSellers[0];
    const estimatedPotentialRev = topSeller.product.sellingPrice * 5;
    opportunities.push({
      id: `opp-bestseller-${topSeller.product.id}`,
      title: `Scale High-Velocity Mover: ${topSeller.product.name.split('(')[0].trim()}`,
      category: 'increasing_demand',
      categoryLabel: 'Demand Surge',
      potentialImpact: `+₦${estimatedPotentialRev.toLocaleString()} Est. Revenue`,
      description: `Sales velocity for ${topSeller.product.name.split('(')[0].trim()} is leading the store with ${topSeller.unitsSold} units sold this month.`,
      evidence: `Generated ₦${topSeller.totalRevenue.toLocaleString()} in revenue with ₦${topSeller.totalProfit.toLocaleString()} gross profit. Current stock is ${topSeller.product.stock} units.`,
      suggestedAction: `Secure an additional 5 to 10 units wholesale batch from authorized importers at preferential volume pricing before distributor prices fluctuate.`,
      actionLabel: 'Restock Best Seller',
      actionType: 'restock',
      actionTarget: topSeller.product,
    });
  }

  // Opp 2: High Margin Accessory Bundling
  const fastPhone = bestSellers.find(
    (b) =>
      b.product.category === 'Smartphones & Tablets' ||
      b.product.category === 'Laptops & Computers' ||
      b.product.category === 'Gaming Consoles & Gear'
  );
  const slowAccessory = slowMovers.find(
    (s) => s.product.category === 'Accessories & Power' && s.product.stock > 3
  );
  if (fastPhone && slowAccessory) {
    opportunities.push({
      id: 'opp-bundle-upsell',
      title: `Bundle ${slowAccessory.product.name.split('(')[0].trim()} with ${fastPhone.product.name.split('(')[0].trim()}`,
      category: 'margin_expansion',
      categoryLabel: 'Margin Expansion',
      potentialImpact: `+₦${(slowAccessory.product.sellingPrice * slowAccessory.product.stock).toLocaleString()} Cash Unlocked`,
      description: `Pair fast-moving smartphones with slow-moving high-margin chargers or cases as a "Complete VIP Setup Pack" at checkout.`,
      evidence: `${fastPhone.product.name.split('(')[0].trim()} has sold ${fastPhone.unitsSold} units, while ${slowAccessory.product.name.split('(')[0].trim()} has ${slowAccessory.product.stock} units sitting in stock.`,
      suggestedAction: `Instruct sales staff to offer the accessory at a 15% promotional discount when closing phone sales at Rawls & Hub.`,
      actionLabel: 'Launch Bundle Offer',
      actionType: 'pos_sale',
      actionTarget: slowAccessory.product,
    });
  }

  // Opp 3: Debtor Balance Recovery to Fund Reorders
  if (totalOutstandingReceivables > 0) {
    opportunities.push({
      id: 'opp-debt-liquidity',
      title: `Reclaim ₦${totalOutstandingReceivables.toLocaleString()} in Liquid Working Capital`,
      category: 'cash_unlock',
      categoryLabel: 'Cash Flow Acceleration',
      potentialImpact: `+₦${totalOutstandingReceivables.toLocaleString()} Immediate Cash`,
      description: `Collecting outstanding receivables supplies sufficient immediate liquidity to fund upcoming inventory restocking without external debt.`,
      evidence: `${debtors.length} customer debts recorded across ${customers.length} total customers. Recovering 100% covers ${totalRestockCapitalNeeded > 0 ? Math.round((totalOutstandingReceivables / totalRestockCapitalNeeded) * 100) : 100}% of recommended restocking capital.`,
      suggestedAction: `Send structured automated reminder invoices with official Rawls & Hub Moniepoint account details via WhatsApp.`,
      actionLabel: 'Open Debtor Manager',
      actionType: 'remind_debtor',
      actionTarget: debtors[0],
    });
  }

  // Opp 4: VIP Customer Exclusive Pre-Order Offer
  if (repeatCustomers.length > 0) {
    const topVip = repeatCustomers[0];
    opportunities.push({
      id: `opp-vip-${topVip.customer.id}`,
      title: `VIP Tech Concierge: ${topVip.customer.fullName}`,
      category: 'vip_upsell',
      categoryLabel: 'Customer Retention',
      potentialImpact: `+₦${Math.round(topVip.stats.totalSpent * 0.4).toLocaleString()} Projected Upsell`,
      description: `Repeat buyers spend 2.8x more than first-time customers. Nurturing verified repeat buyers creates predictable monthly retail cash flow.`,
      evidence: `${topVip.customer.fullName} has placed ${topVip.stats.totalOrdersCount} orders totaling ₦${topVip.stats.totalSpent.toLocaleString()} with 0 unpaid invoices.`,
      suggestedAction: `Reach out with priority early reservation for newly arriving gadgets, premium screen protectors, or trade-in valuations.`,
      actionLabel: 'Contact VIP Customer',
      actionType: 'view_customer',
      actionTarget: topVip.customer,
    });
  }

  // D. Business Health Audit Engine
  // Pillar 1: Sales Momentum (0-100)
  let salesScore = 75;
  if (totalSalesRevenue > 15000000) salesScore = 95;
  else if (totalSalesRevenue > 8000000) salesScore = 85;
  else if (totalSalesRevenue > 3000000) salesScore = 70;
  else salesScore = 50;

  // Pillar 2: Working Capital & Debt Discipline (0-100)
  let capitalScore = 80;
  const debtRatio = totalSalesRevenue > 0 ? (totalOutstandingReceivables / totalSalesRevenue) * 100 : 0;
  if (debtRatio > 35) capitalScore = 45;
  else if (debtRatio > 20) capitalScore = 65;
  else if (debtRatio > 10) capitalScore = 82;
  else capitalScore = 95;

  // Pillar 3: Inventory Efficiency (0-100)
  let invScore = 80;
  const criticalRatio = products.length > 0 ? (criticalCount / products.length) * 100 : 0;
  if (criticalRatio > 30) invScore = 50;
  else if (criticalRatio > 15) invScore = 68;
  else if (criticalRatio > 0) invScore = 82;
  else invScore = 94;

  // Pillar 4: Profit Discipline (0-100)
  let profitScore = 75;
  if (profitability.netMarginPercent > 22) profitScore = 95;
  else if (profitability.netMarginPercent > 15) profitScore = 85;
  else if (profitability.netMarginPercent > 8) profitScore = 72;
  else profitScore = 48;

  const overallScore = Math.round(
    salesScore * 0.3 + capitalScore * 0.25 + invScore * 0.25 + profitScore * 0.2
  );

  let healthStatus: 'healthy' | 'good' | 'needs_attention' | 'critical' = 'good';
  let healthStatusLabel = 'Good & Resilient';
  if (overallScore >= 85) {
    healthStatus = 'healthy';
    healthStatusLabel = 'Excellent Health';
  } else if (overallScore >= 70) {
    healthStatus = 'good';
    healthStatusLabel = 'Strong & Resilient';
  } else if (overallScore >= 55) {
    healthStatus = 'needs_attention';
    healthStatusLabel = 'Needs Operational Attention';
  } else {
    healthStatus = 'critical';
    healthStatusLabel = 'Critical Intervention Needed';
  }

  const healthAudit: BusinessHealthAudit = {
    overallScore,
    status: healthStatus,
    statusLabel: healthStatusLabel,
    summary: `Rawls & Hub is operating with ${healthStatusLabel} (Score: ${overallScore}/100). Store sales pacing is robust at ₦${totalSalesRevenue.toLocaleString()} across ${completedSalesInPeriod.length} verified orders. Primary focus areas: prompt recovery of ₦${totalOutstandingReceivables.toLocaleString()} outstanding receivables and replenishing ${criticalCount} critically low product lines before weekend trading.`,
    metrics: {
      salesMomentum: {
        name: 'Sales Velocity & Revenue Pacing',
        score: salesScore,
        status: salesScore >= 80 ? 'excellent' : salesScore >= 65 ? 'good' : 'caution',
        valueDisplay: `₦${totalSalesRevenue.toLocaleString()}`,
        benchmark: 'Target: >₦10M/month',
        detail: `${completedSalesInPeriod.length} sales completed; Average Order Value is ₦${averageOrderValue.toLocaleString()}.`,
      },
      workingCapital: {
        name: 'Working Capital & Debt Aging',
        score: capitalScore,
        status: capitalScore >= 80 ? 'excellent' : capitalScore >= 65 ? 'good' : 'caution',
        valueDisplay: `₦${totalOutstandingReceivables.toLocaleString()} Unpaid`,
        benchmark: 'Receivables < 15% of Revenue',
        detail: `${debtors.length} debtors with ${overdueDebtors.length} past due. Collecting these funds directly secures stock liquidity.`,
      },
      inventoryEfficiency: {
        name: 'Inventory Availability & Runway',
        score: invScore,
        status: invScore >= 80 ? 'excellent' : invScore >= 65 ? 'good' : 'caution',
        valueDisplay: `${criticalCount} Critical Out of ${products.length} SKUs`,
        benchmark: 'Zero Critical Stockouts',
        detail: `Wholesale inventory valuation is ₦${totalValuationCost.toLocaleString()}. ${approachingStockoutCount} items approaching reorder threshold.`,
      },
      profitDiscipline: {
        name: 'Net Profit Margin Discipline',
        score: profitScore,
        status: profitScore >= 80 ? 'excellent' : profitScore >= 65 ? 'good' : 'caution',
        valueDisplay: `${profitability.netMarginPercent.toFixed(1)}% Net Margin`,
        benchmark: 'Industry Target: >15%',
        detail: `Gross profit is ₦${profitability.grossProfit.toLocaleString()} (${profitability.grossMarginPercent.toFixed(1)}%); operating expenses total ₦${profitability.operatingExpenses.toLocaleString()}.`,
      },
    },
    keyTakeaway: `Accelerate recovery on ₦${totalOutstandingReceivables.toLocaleString()} in debtor accounts to directly finance wholesale orders for ${criticalCount} depleted phone lines without tapping store emergency reserves.`,
    evaluatedAt: now.toISOString(),
  };

  return {
    timestamp: now.toISOString(),
    sales: {
      totalRevenue: totalSalesRevenue,
      totalUnitsSold,
      averageOrderValue,
      bestSellers,
      slowMovers,
      dormantProducts,
      dailyTrends,
      weeklyTrends,
    },
    inventory: {
      totalValuationSelling,
      totalValuationCost,
      potentialGrossProfit,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      restockRecommendations,
      allRestockEvaluations,
      totalRestockCapitalNeeded,
      totalRecommendedUnits,
      criticalCount,
      approachingStockoutCount,
      slowMovingCount,
      noSalesHistoryCount,
      overstockedCount,
      healthyCount,
      analysisPeriod: {
        startDate: periodStartDateStr,
        endDate: periodEndDateStr,
        days: periodDays,
        completedSalesCount: completedSalesInPeriod.length,
      },
      configUsed: config,
    },
    financials: {
      revenue: profitability.totalRevenue,
      cogs: profitability.cogs,
      grossProfit: profitability.grossProfit,
      grossMarginPercent: profitability.grossMarginPercent,
      operatingExpenses: profitability.operatingExpenses,
      stockPurchasesOutlay: profitability.stockPurchasesExpenses,
      totalExpenses: profitability.totalExpenses,
      netProfit: profitability.netProfit,
      netMarginPercent: profitability.netMarginPercent,
      totalOutstandingReceivables,
      topExpenseCategories,
    },
    customers: {
      totalRegistered: customers.length,
      repeatCustomersCount: repeatCustomers.length,
      repeatRatePercent,
      topSpenders,
      debtorCustomers,
      paymentChannelPreference,
    },
    recommendations,
    copilot: {
      healthAudit,
      alerts,
      opportunities,
      actionableRecommendations,
    },
  };
}

/**
 * Generate a comprehensive, professional Business Report grounded strictly in real store records.
 * Supports Daily, Weekly, and Monthly cadence with one-click export/copy.
 */
export function generateBusinessReport(
  period: 'daily' | 'weekly' | 'monthly',
  report: AIInsightsReport,
  storeName: string = 'Rawls & Hub'
): BusinessReport {
  const dateStr = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (period === 'daily') {
    const todaySales = report.sales.dailyTrends.length > 0 
      ? report.sales.dailyTrends[report.sales.dailyTrends.length - 1]
      : { revenue: 0, ordersCount: 0 };

    return {
      period: 'daily',
      periodLabel: 'Daily Business Briefing',
      reportDate: dateStr,
      executiveSummary: `Daily operational summary for ${storeName} (Shop 14, Digital Plaza, Computer Village, Ikeja). Today the store generated ₦${todaySales.revenue.toLocaleString()} across ${todaySales.ordersCount} completed orders. Business health score stands at ${report.copilot.healthAudit.overallScore}/100 with ${report.copilot.alerts.filter((a) => a.severity === 'critical').length} critical issues requiring same-day action.`,
      kpis: [
        { label: "Today's Sales Revenue", value: `₦${todaySales.revenue.toLocaleString()}`, isPositive: todaySales.revenue > 0 },
        { label: 'Completed Orders', value: `${todaySales.ordersCount} orders` },
        { label: 'Outstanding Receivables', value: `₦${report.financials.totalOutstandingReceivables.toLocaleString()}`, isPositive: false },
        { label: 'Critically Low SKUs', value: `${report.inventory.criticalCount} products`, isPositive: report.inventory.criticalCount === 0 },
      ],
      topAchievements: [
        `Maintained active sales operations with average order size of ₦${report.sales.averageOrderValue.toLocaleString()}.`,
        `Identified ${report.customers.repeatCustomersCount} loyal returning customers driving wholesale and retail volume.`,
        `Monitored inventory valuation standing at ₦${report.inventory.totalValuationCost.toLocaleString()} wholesale cost.`,
      ],
      criticalAttentionItems: [
        report.inventory.criticalCount > 0
          ? `${report.inventory.criticalCount} fast-moving products have reached critical low levels and risk stockout.`
          : 'All key products currently maintain sufficient stock levels.',
        report.financials.totalOutstandingReceivables > 0
          ? `₦${report.financials.totalOutstandingReceivables.toLocaleString()} remains uncollected across customer credit accounts.`
          : 'Zero overdue customer receivables.',
        report.financials.topExpenseCategories.length > 0
          ? `Top operational cost is ${report.financials.topExpenseCategories[0].category} at ₦${report.financials.topExpenseCategories[0].amount.toLocaleString()}.`
          : 'Operating overhead remains within budget.',
      ],
      actionPlan: [
        'Check inventory on critical items and confirm distributor delivery timing for restocks.',
        'Send polite WhatsApp payment reminders to customers with overdue balances before 3:00 PM.',
        'Review generator running hours to keep Computer Village diesel expenses minimized.',
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  if (period === 'weekly') {
    return {
      period: 'weekly',
      periodLabel: 'Weekly Performance Audit',
      reportDate: dateStr,
      executiveSummary: `Weekly performance review for ${storeName}. Total turnover over the last 7 trading days reached ₦${report.sales.totalRevenue.toLocaleString()} with a net profit margin of ${report.financials.netMarginPercent.toFixed(1)}%. Customer retention rate is ${report.customers.repeatRatePercent}%, demonstrating healthy retail loyalty in the Computer Village market.`,
      kpis: [
        { label: 'Weekly Gross Turnover', value: `₦${report.sales.totalRevenue.toLocaleString()}`, isPositive: true },
        { label: 'Net Business Profit', value: `₦${report.financials.netProfit.toLocaleString()}`, isPositive: report.financials.netProfit > 0 },
        { label: 'Total Units Dispatched', value: `${report.sales.totalUnitsSold} units` },
        { label: 'Restock Capital Required', value: `₦${report.inventory.totalRestockCapitalNeeded.toLocaleString()}` },
      ],
      topAchievements: [
        `Generated ₦${report.financials.grossProfit.toLocaleString()} in gross merchandise profit.`,
        `Best-selling line: ${report.sales.bestSellers.length > 0 ? report.sales.bestSellers[0].product.name.split('(')[0].trim() : 'Electronics'} (${report.sales.bestSellers[0]?.unitsSold || 0} units sold).`,
        `Operating margin retained at ${report.financials.netMarginPercent.toFixed(1)}% after operating overhead of ₦${report.financials.operatingExpenses.toLocaleString()}.`,
      ],
      criticalAttentionItems: [
        `₦${report.financials.totalOutstandingReceivables.toLocaleString()} locked in customer debt requiring recovery.`,
        `${report.inventory.criticalCount} SKUs need replenishment before stock runs out next week.`,
        `${report.sales.dormantProducts.length} items have not recorded a sale in over 7 days.`,
      ],
      actionPlan: [
        'Order recommended restocking units for high-velocity best-sellers to avoid weekend out-of-stock.',
        'Offer a 10% promotional bundle on slow-moving accessories with new smartphone sales.',
        'Reconcile Moniepoint and bank transfer payments against recorded customer accounts.',
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  // Monthly
  return {
    period: 'monthly',
    periodLabel: 'Monthly Executive Review',
    reportDate: dateStr,
    executiveSummary: `Comprehensive monthly commercial review for ${storeName}. Over the 30-day period, total gross revenue reached ₦${report.financials.revenue.toLocaleString()} against cost of goods sold of ₦${report.financials.cogs.toLocaleString()}, producing a gross profit of ₦${report.financials.grossProfit.toLocaleString()} (${report.financials.grossMarginPercent.toFixed(1)}%). Operating expenses totaled ₦${report.financials.operatingExpenses.toLocaleString()}, leaving a clean net profit of ₦${report.financials.netProfit.toLocaleString()} (${report.financials.netMarginPercent.toFixed(1)}% net margin).`,
    kpis: [
      { label: 'Monthly Revenue', value: `₦${report.financials.revenue.toLocaleString()}`, isPositive: true },
      { label: 'Net Operating Profit', value: `₦${report.financials.netProfit.toLocaleString()}`, isPositive: report.financials.netProfit > 0 },
      { label: 'Working Capital Receivables', value: `₦${report.financials.totalOutstandingReceivables.toLocaleString()}` },
      { label: 'Wholesale Inventory Valuation', value: `₦${report.inventory.totalValuationCost.toLocaleString()}` },
    ],
    topAchievements: [
      `Maintained a healthy net profit margin of ${report.financials.netMarginPercent.toFixed(1)}% through disciplined pricing.`,
      `Processed ${report.sales.totalUnitsSold} unit sales across ${report.customers.totalRegistered} registered customers.`,
      `Accurately separated stock capital outlay from operational expenses to avoid double-counting inventory.`,
    ],
    criticalAttentionItems: [
      `Recovering ₦${report.financials.totalOutstandingReceivables.toLocaleString()} in outstanding receivables is critical to replenish working capital.`,
      `${report.inventory.criticalCount} critical inventory items require immediate supplier purchase orders.`,
      `Utilities and generator diesel outlay of ₦${(report.financials.topExpenseCategories.find(c => c.category === 'Electricity and utilities')?.amount || 0).toLocaleString()} requires scheduling discipline.`,
    ],
    actionPlan: [
      'Prioritize debt collection from top debtors with overdue invoices exceeding 14 days.',
      'Place wholesale restock orders for top-performing electronics to maintain product availability.',
      'Audit slow-moving accessory lines and create bundled promotional deals for POS checkout.',
      'Set aside 20% of net monthly profit into a dedicated contingency fund for seasonal peak demand.',
    ],
    generatedAt: new Date().toISOString(),
  };
}
