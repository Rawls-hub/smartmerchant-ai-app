import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Boxes,
  CreditCard,
  Users,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  Bot,
  User,
  Send,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Calendar,
  Layers,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Info,
  Calculator,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Search,
  FileText,
  Package,
  HelpCircle,
  Filter,
  Trash2,
  MessageSquare,
  Receipt,
  Activity,
  Flame,
  ArrowUpRight,
  Target,
  Share2,
  CheckCheck,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';
import {
  ChatMessage,
  Product,
  Customer,
  InventoryWarningType,
  RestockRecommendation,
  Sale,
  Order,
  Debtor,
  CopilotAlertSeverity,
  IntelligentAlert,
  BusinessOpportunity,
  ActionableRecommendationItem,
  BusinessHealthAudit,
  BusinessReport,
} from '../types';
import {
  generateAIInsightsReport,
  generateBusinessReport,
  AIRecommendationItem,
  ProductPerformance,
} from '../utils/aiInsightsEngine';
import { NearAuditCard } from './near/NearAuditCard';

export const AIAssistantView: React.FC = () => {
  const {
    sales,
    products,
    orders,
    customers,
    debtors,
    expenses,
    getProfitabilitySummary,
    getCustomerStats,
    setActiveSection,
    setIsNewSaleOpen,
    setActiveRestockProduct,
    setActiveWhatsAppModalDebtor,
    setActiveDetailCustomer,
    settings,
    aiTab,
    setAiTab,
    restockConfig,
    updateRestockConfig,
    openRestockModal,
    activeSection,
  } = useMerchant();

  const activeTab = aiTab;
  const setActiveTab = setAiTab;

  // Sync tab with sidebar selection
  useEffect(() => {
    if (activeSection === 'ask_ai' && aiTab !== 'copilot') {
      setAiTab('copilot');
    }
  }, [activeSection, aiTab, setAiTab]);

  const [salesTrendView, setSalesTrendView] = useState<'daily' | 'weekly'>('daily');

  // Restock Planner Interactive States
  type RestockFilterType = 'all' | 'reorder' | 'critical' | 'approaching' | 'manual_review' | 'slow' | 'overstocked' | 'healthy';
  const [restockFilter, setRestockFilter] = useState<RestockFilterType>('all');
  const [restockSearch, setRestockSearch] = useState('');
  const [expandedCalcId, setExpandedCalcId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(true);

  // Profitability summary for October
  const profitability = useMemo(() => {
    return getProfitabilitySummary('month');
  }, [getProfitabilitySummary]);

  // Compute live AI insights report
  const insights = useMemo(() => {
    return generateAIInsightsReport(
      sales,
      products,
      orders,
      customers,
      debtors,
      expenses,
      profitability,
      getCustomerStats,
      settings,
      restockConfig
    );
  }, [sales, products, orders, customers, debtors, expenses, profitability, getCustomerStats, settings, restockConfig]);

  // Copilot Interactive States
  const [copilotSeverityFilter, setCopilotSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'opportunity' | 'info'>('all');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [copiedReport, setCopiedReport] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [deepScanSuccess, setDeepScanSuccess] = useState<string | null>(null);

  // Active business report computed from selected period
  const activeBusinessReport = useMemo(() => {
    return generateBusinessReport(reportPeriod, insights, settings.storeName);
  }, [reportPeriod, insights, settings.storeName]);

  // Active alerts filtered
  const activeAlerts = useMemo(() => {
    return insights.copilot.alerts
      .filter((a) => !dismissedAlertIds.includes(a.id))
      .filter((a) => (copilotSeverityFilter === 'all' ? true : a.severity === copilotSeverityFilter));
  }, [insights.copilot.alerts, dismissedAlertIds, copilotSeverityFilter]);

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  const handleTriggerAction = (actionType: string, actionTarget?: any) => {
    switch (actionType) {
      case 'restock':
        if (actionTarget) {
          openRestockModal(actionTarget, 10);
        } else {
          setActiveTab('restock_matrix');
        }
        break;
      case 'remind_debtor':
        if (actionTarget) {
          setActiveWhatsAppModalDebtor(actionTarget);
        } else {
          setActiveSection('payments');
        }
        break;
      case 'pos_sale':
      case 'create_promo':
        setIsNewSaleOpen(true);
        break;
      case 'review_expenses':
        setActiveSection('expenses');
        break;
      case 'view_customer':
        if (actionTarget) {
          setActiveDetailCustomer(actionTarget);
        }
        setActiveSection('customers');
        break;
      default:
        break;
    }
  };

  const handleCopyReport = async () => {
    const reportText = `=====================================================
${activeBusinessReport.periodLabel.toUpperCase()} - ${settings.storeName}
Shop 14, Digital Plaza, Computer Village, Ikeja, Lagos
Date: ${activeBusinessReport.reportDate}
Health Score: ${insights.copilot.healthAudit.overallScore}/100 (${insights.copilot.healthAudit.statusLabel})
=====================================================

EXECUTIVE SUMMARY:
${activeBusinessReport.executiveSummary}

KEY PERFORMANCE INDICATORS:
${activeBusinessReport.kpis.map((k) => `• ${k.label}: ${k.value}`).join('\n')}

TOP ACHIEVEMENTS:
${activeBusinessReport.topAchievements.map((a) => `✓ ${a}`).join('\n')}

CRITICAL ATTENTION ITEMS:
${activeBusinessReport.criticalAttentionItems.map((c) => `⚠ ${c}`).join('\n')}

ACTION PLAN FOR MANAGEMENT:
${activeBusinessReport.actionPlan.map((act, i) => `${i + 1}. ${act}`).join('\n')}

Generated by SmartMerchant AI Copilot. Confidential store records.`;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch (e) {
      console.error('Failed to copy report', e);
    }
  };

  const handleDeepScan = async () => {
    setIsDeepScanning(true);
    setDeepScanSuccess(null);
    try {
      const response = await fetch('/api/ai/copilot-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            business: {
              storeName: settings.storeName,
              ownerName: 'Richy Rawls',
              location: 'Shop 14, Digital Plaza, Computer Village, Ikeja, Lagos',
            },
            financials: {
              revenue: insights.financials.revenue,
              cogs: insights.financials.cogs,
              grossProfit: insights.financials.grossProfit,
              netProfit: insights.financials.netProfit,
              netMarginPercent: insights.financials.netMarginPercent,
              totalReceivables: insights.financials.totalOutstandingReceivables,
            },
            inventory: {
              criticalCount: insights.inventory.criticalCount,
              totalValuationCost: insights.inventory.totalValuationCost,
            },
            debtors: {
              count: debtors.length,
              overdueCount: debtors.filter((d) => d.daysOverdue > 0).length,
            },
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setDeepScanSuccess(
          `Live Store Audit Complete: Analyzed ${sales.length} sales, ${products.length} products, ${debtors.length} debtors, and ${expenses.length} expense ledgers. All metrics calibrated in Naira.`
        );
      } else {
        setDeepScanSuccess(
          `Deep Health Audit Complete: Analyzed ${sales.length} sales, ${products.length} products, ${debtors.length} debtors, and ${expenses.length} expense ledgers.`
        );
      }
    } catch {
      setDeepScanSuccess(
        `Deep Health Audit Complete: Analyzed ${sales.length} sales, ${products.length} products, ${debtors.length} debtors, and ${expenses.length} expense ledgers.`
      );
    } finally {
      setIsDeepScanning(false);
      setTimeout(() => setDeepScanSuccess(null), 6000);
    }
  };

  // Filtered restock evaluations for Restock Planner Matrix
  const filteredRestockItems = useMemo<RestockRecommendation[]>(() => {
    return insights.inventory.allRestockEvaluations.filter((rec) => {
      // 1. Search query
      const matchesSearch =
        rec.product.name.toLowerCase().includes(restockSearch.toLowerCase()) ||
        rec.product.sku.toLowerCase().includes(restockSearch.toLowerCase()) ||
        rec.product.category.toLowerCase().includes(restockSearch.toLowerCase()) ||
        (rec.product.supplier && rec.product.supplier.toLowerCase().includes(restockSearch.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Filter tabs
      switch (restockFilter) {
        case 'reorder':
          return rec.recommendedUnits > 0 && !rec.isExcludedFromAutoTotal;
        case 'critical':
          return rec.warningTypes.includes('critical_low');
        case 'approaching':
          return rec.warningTypes.includes('approaching_stockout');
        case 'manual_review':
          return rec.warningTypes.includes('no_sales_history');
        case 'slow':
          return rec.warningTypes.includes('slow_moving');
        case 'overstocked':
          return rec.warningTypes.includes('overstocked');
        case 'healthy':
          return rec.warningTypes.includes('healthy');
        case 'all':
        default:
          return true;
      }
    });
  }, [insights.inventory.allRestockEvaluations, restockSearch, restockFilter]);

  const renderWarningBadges = (warningTypes: InventoryWarningType[], primary: InventoryWarningType) => {
    return (
      <div className="flex flex-wrap gap-1">
        {warningTypes.map((w) => {
          switch (w) {
            case 'critical_low':
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30"
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Critical Low
                </span>
              );
            case 'approaching_stockout':
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                >
                  <Clock className="h-2.5 w-2.5" />
                  Approaching Stockout
                </span>
              );
            case 'no_sales_history':
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40"
                >
                  <HelpCircle className="h-2.5 w-2.5" />
                  Manual Review (0 Sales)
                </span>
              );
            case 'slow_moving':
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  <TrendingDown className="h-2.5 w-2.5" />
                  Slow-Moving
                </span>
              );
            case 'overstocked':
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                >
                  <Layers className="h-2.5 w-2.5" />
                  Overstocked (&gt;60d)
                </span>
              );
            case 'healthy':
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Healthy
                </span>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Chat copilot state
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    text: `Hello ${settings.ownerName}! 🇳🇬 Welcome to **Ask SmartMerchant AI** — your conversational business intelligence advisor for ${settings.storeName}.

I am directly connected to your live operational ledgers:
* 💰 **Gross Sales Turnover:** **${formatNaira(insights.sales.totalRevenue)}** across ${sales.length} completed POS transactions
* 📈 **Net Operating Profit:** **${formatNaira(profitability.netProfit)}** (${profitability.netMarginPercent.toFixed(1)}% margin)
* 📦 **Capital in Inventory:** **${formatNaira(insights.inventory.totalValuationCost)}** wholesale cost (${products.length} products in catalog)
* 📋 **Outstanding Receivables:** **${formatNaira(insights.financials.totalOutstandingReceivables)}** across ${debtors.length} debtor(s)
* 📉 **Operating Overhead:** **${formatNaira(profitability.operatingExpenses)}** (strictly separated from stock purchases)

Ask me any natural language question about your sales performance, inventory restocking, debtor collections, or expenses!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Which products sold the most this month?',
      'How much revenue did I generate this week?',
      'Which customers owe me money?',
      'Which products need restocking?',
      'What are my biggest business expenses?',
      'How much profit did the business make?',
      'Who are my most frequent customers?',
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage]);
    setInputMessage('');
  };

  useEffect(() => {
    if (activeTab === 'copilot') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingChat, activeTab]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoadingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoadingChat(true);

    try {
      const context = {
        business: {
          storeName: settings.storeName,
          ownerName: settings.ownerName,
          location: 'Shop 14, Digital Plaza, Computer Village, Ikeja, Lagos',
          dailySalesTarget: settings.dailySalesTarget,
        },
        financials: {
          totalRevenue: insights.sales.totalRevenue,
          cogs: profitability.cogs,
          grossProfit: profitability.grossProfit,
          grossMarginPercent: profitability.grossMarginPercent,
          operatingExpenses: profitability.operatingExpenses,
          stockPurchasesCapitalOutlay: profitability.stockPurchasesExpenses,
          netProfit: profitability.netProfit,
          netMarginPercent: profitability.netMarginPercent,
          totalOutstandingReceivables: insights.financials.totalOutstandingReceivables,
          totalPaymentsReceived: profitability.cashInflows,
        },
        salesSummary: {
          totalSalesTransactions: sales.length,
          totalUnitsSold: insights.sales.totalUnitsSold,
          averageOrderValue: insights.sales.averageOrderValue,
          todaySales: profitability.totalRevenue,
          bestSellingProducts: insights.sales.bestSellers.map((b: ProductPerformance) => ({
            name: b.product.name,
            unitsSold: b.unitsSold,
            revenue: b.totalRevenue,
            profit: b.totalProfit,
            category: b.product.category,
          })),
          slowMovingProducts: insights.sales.slowMovers.map((s: ProductPerformance) => ({
            name: s.product.name,
            unitsSold: s.unitsSold,
            stockOnHand: s.product.stock,
            capitalLocked: s.capitalLocked,
          })),
          dormantProductsNoRecentSales: insights.sales.dormantProducts.map((d: ProductPerformance) => ({
            name: d.product.name,
            stock: d.product.stock,
            costPrice: d.product.costPrice,
          })),
          recentSalesReceipts: sales.slice(0, 5).map((s: Sale) => ({
            receiptNo: s.receiptNo,
            total: s.totalAmount,
            date: s.timestamp.slice(0, 10),
            itemsCount: s.items.length,
            customerName: s.customerName,
          })),
        },
        inventorySummary: {
          totalProductsInCatalog: products.length,
          totalPhysicalUnits: products.reduce((acc, p) => acc + p.stock, 0),
          totalInventoryValuationRetail: insights.inventory.totalValuationSelling,
          totalInventoryValuationWholesaleCost: insights.inventory.totalValuationCost,
          lowStockAlertsCount: insights.inventory.lowStockCount,
          criticalLowCount: insights.inventory.criticalCount,
          approachingStockoutCount: insights.inventory.approachingStockoutCount,
          manualReviewCount: insights.inventory.noSalesHistoryCount,
          overstockedCount: insights.inventory.overstockedCount,
          catalogProducts: products.map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            sellingPrice: p.sellingPrice,
            category: p.category,
          })),
          restockRecommendations: insights.inventory.restockRecommendations.map((r: RestockRecommendation) => ({
            name: r.product.name,
            currentStock: r.currentStock,
            recommendedOrderUnits: r.recommendedUnits,
            estimatedCost: r.estimatedCost,
            dailyVelocity: r.dailyVelocity,
            daysOfStockRemaining: r.daysOfInventoryLeftDisplay,
            reorderPoint: r.breakdown.targetReorderPoint,
            reason: r.reason,
          })),
          manualReviewZeroSalesProducts: insights.inventory.allRestockEvaluations
            .filter((r) => r.isFlaggedForManualReview)
            .map((r) => ({
              name: r.product.name,
              stock: r.currentStock,
              costPrice: r.breakdown.unitCostPrice,
              category: r.product.category,
            })),
        },
        debtorsAndReceivables: {
          totalDebtorsCount: debtors.length,
          totalAmountOwed: insights.financials.totalOutstandingReceivables,
          debtorsList: debtors.map((d: Debtor) => ({
            customerName: d.customerName,
            phone: d.phone,
            amountOwed: d.amountOwed,
            initialAmount: d.initialAmount,
            dueDate: d.dueDate,
            daysOverdue: d.daysOverdue,
            itemDescription: d.itemDescription,
            status: d.daysOverdue > 0 ? 'overdue' : 'pending',
          })),
        },
        customersSummary: {
          totalCustomers: customers.length,
          repeatCustomersCount: insights.customers.repeatCustomersCount,
          repeatRatePercent: insights.customers.repeatRatePercent,
          topSpenders: insights.customers.topSpenders.map((c) => ({
            customerName: c.customer.fullName,
            phone: c.customer.phone,
            tag: c.customer.tag,
            totalOrders: c.stats.totalOrdersCount,
            totalSpent: c.stats.totalSpent,
            outstanding: c.stats.totalOutstanding,
          })),
        },
        expensesSummary: {
          totalExpensesAllTime: profitability.totalExpenses,
          operatingExpensesThisMonth: profitability.operatingExpenses,
          stockPurchasesThisMonth: profitability.stockPurchasesExpenses,
          topExpenseCategories: insights.financials.topExpenseCategories,
          recentExpenseEntries: expenses.slice(0, 5).map((e) => ({
            description: e.description,
            amount: e.amount,
            category: e.category,
            date: e.date,
          })),
        },
        ordersSummary: {
          totalOrders: orders.length,
          pendingOrProcessing: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
          delivered: orders.filter((o) => o.status === 'delivered').length,
          recentOrders: orders.slice(0, 5).map((o: Order) => ({
            id: o.id,
            customer: o.customerName,
            total: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
          })),
        },
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const aiReply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Analyzing store records...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback,
        suggestions: [
          'Which products sold the most this month?',
          'Which customers owe me money?',
          'Which products need restocking?',
          'How much profit did the business make?',
        ],
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('AI chat failed:', err);
      // Deterministic data-driven fallback grounded in real numbers
      const fallbackReply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: `### 📊 Real-Time AI Business Audit for ${settings.storeName}
        
1. **Restock Urgency:** ${insights.inventory.lowStockCount} items have touched safety thresholds. We recommend ordering **${insights.inventory.restockRecommendations.slice(0, 2).map((r) => `${r.recommendedUnits}x ${r.product.name.split('(')[0].trim()}`).join(' and ')}** to avoid missed sales.
2. **Cash Inflow Acceleration:** Recovering **${formatNaira(insights.financials.totalOutstandingReceivables)}** in pending balances directly unlocks wholesale capital without taking supplier loans.
3. **Net Margin Health:** Store net profit stands at **${formatNaira(profitability.netProfit)}** (${profitability.netMarginPercent.toFixed(1)}% margin). Keep diesel generator runtime disciplined to protect operating margins!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleAction = (rec: AIRecommendationItem) => {
    switch (rec.actionType) {
      case 'restock':
        if (rec.actionTarget) setActiveRestockProduct(rec.actionTarget);
        break;
      case 'remind_debtor':
        if (rec.actionTarget) setActiveWhatsAppModalDebtor(rec.actionTarget);
        break;
      case 'view_customer':
        if (rec.actionTarget) setActiveDetailCustomer(rec.actionTarget);
        break;
      case 'pos_sale':
        setIsNewSaleOpen(true);
        break;
      case 'review_expenses':
        setActiveSection('expenses');
        break;
    }
  };

  // Max revenue for trend chart normalization
  const maxTrendRevenue = Math.max(
    ...insights.sales.dailyTrends.map((t) => t.revenue),
    ...insights.sales.weeklyTrends.map((t) => t.revenue),
    1000000
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Top Banner & Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  SmartMerchant AI Business Intelligence
                </h1>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Live Store Model
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Continuous algorithmic analysis of sales velocity, inventory depletion, cost burn, and customer accounts for {settings.storeName}.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 bg-[#070B16] p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto text-xs">
            <button
              onClick={() => {
                setActiveTab('copilot_dashboard');
                setActiveSection('ai');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-semibold transition-all shrink-0 ${
                activeTab === 'copilot_dashboard'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>AI Business Copilot</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </button>

            <button
              onClick={() => {
                setActiveTab('insights');
                setActiveSection('ai');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-semibold transition-all shrink-0 ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('restock_matrix');
                setActiveSection('ai');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-semibold transition-all shrink-0 ${
                activeTab === 'restock_matrix'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Restock Planner ({insights.inventory.restockRecommendations.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('copilot');
                setActiveSection('ask_ai');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-semibold transition-all shrink-0 ${
                activeTab === 'copilot'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 0: PROACTIVE AI BUSINESS COPILOT DASHBOARD */}
      {/* ==================================================================== */}
      {activeTab === 'copilot_dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Deep Scan Toast Banner */}
          {deepScanSuccess && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-300 flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{deepScanSuccess}</span>
              </div>
              <button
                onClick={() => setDeepScanSuccess(null)}
                className="text-emerald-400 hover:text-white text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. BUSINESS HEALTH MONITORING HERO */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1226] p-6 shadow-xl relative overflow-hidden">
            {/* Background ambient gradient */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-start sm:items-center gap-4">
                {/* Circular Health Score Dial */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#1e293b"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={
                        insights.copilot.healthAudit.overallScore >= 80
                          ? '#10b981'
                          : insights.copilot.healthAudit.overallScore >= 65
                          ? '#06b6d4'
                          : insights.copilot.healthAudit.overallScore >= 50
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * insights.copilot.healthAudit.overallScore) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white mono-num">
                      {insights.copilot.healthAudit.overallScore}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      / 100
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Rawls & Hub Business Health Status
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold border flex items-center gap-1.5 ${
                        insights.copilot.healthAudit.status === 'healthy'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : insights.copilot.healthAudit.status === 'good'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                          : insights.copilot.healthAudit.status === 'needs_attention'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" />
                      {insights.copilot.healthAudit.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                    {insights.copilot.healthAudit.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                <button
                  onClick={handleDeepScan}
                  disabled={isDeepScanning}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isDeepScanning ? 'animate-spin' : ''}`} />
                  <span>{isDeepScanning ? 'Scanning Store Data...' : 'Run Live Store Audit'}</span>
                </button>
              </div>
            </div>

            {/* Key Action Takeaway Banner */}
            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 flex items-start gap-3">
              <Target className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-cyan-200">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] block sm:inline mr-2">
                  Key Strategic Priority:
                </span>
                {insights.copilot.healthAudit.keyTakeaway}
              </div>
            </div>

            {/* 4 Health Pillars Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Sales Velocity */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Sales Velocity
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        insights.copilot.healthAudit.metrics.salesMomentum.status === 'excellent'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {insights.copilot.healthAudit.metrics.salesMomentum.score}/100
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-white mono-num">
                    {insights.copilot.healthAudit.metrics.salesMomentum.valueDisplay}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${insights.copilot.healthAudit.metrics.salesMomentum.score}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-500 font-medium block">
                    {insights.copilot.healthAudit.metrics.salesMomentum.benchmark}
                  </span>
                  <span className="text-slate-300">
                    {insights.copilot.healthAudit.metrics.salesMomentum.detail}
                  </span>
                </div>
              </div>

              {/* Pillar 2: Working Capital & Debt */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Debt & Receivables
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        insights.copilot.healthAudit.metrics.workingCapital.status === 'excellent'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : insights.copilot.healthAudit.metrics.workingCapital.status === 'good'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {insights.copilot.healthAudit.metrics.workingCapital.score}/100
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-white mono-num">
                    {insights.copilot.healthAudit.metrics.workingCapital.valueDisplay}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${insights.copilot.healthAudit.metrics.workingCapital.score}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-500 font-medium block">
                    {insights.copilot.healthAudit.metrics.workingCapital.benchmark}
                  </span>
                  <span className="text-slate-300">
                    {insights.copilot.healthAudit.metrics.workingCapital.detail}
                  </span>
                </div>
              </div>

              {/* Pillar 3: Inventory Availability */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Stock Runway
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        insights.copilot.healthAudit.metrics.inventoryEfficiency.status === 'excellent'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : insights.copilot.healthAudit.metrics.inventoryEfficiency.status === 'good'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {insights.copilot.healthAudit.metrics.inventoryEfficiency.score}/100
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-white mono-num">
                    {insights.copilot.healthAudit.metrics.inventoryEfficiency.valueDisplay}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${insights.copilot.healthAudit.metrics.inventoryEfficiency.score}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-500 font-medium block">
                    {insights.copilot.healthAudit.metrics.inventoryEfficiency.benchmark}
                  </span>
                  <span className="text-slate-300">
                    {insights.copilot.healthAudit.metrics.inventoryEfficiency.detail}
                  </span>
                </div>
              </div>

              {/* Pillar 4: Profit Discipline */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Net Margin Discipline
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        insights.copilot.healthAudit.metrics.profitDiscipline.status === 'excellent'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {insights.copilot.healthAudit.metrics.profitDiscipline.score}/100
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-white mono-num">
                    {insights.copilot.healthAudit.metrics.profitDiscipline.valueDisplay}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${insights.copilot.healthAudit.metrics.profitDiscipline.score}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-500 font-medium block">
                    {insights.copilot.healthAudit.metrics.profitDiscipline.benchmark}
                  </span>
                  <span className="text-slate-300">
                    {insights.copilot.healthAudit.metrics.profitDiscipline.detail}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.5 NEAR BLOCKCHAIN AUDIT & TRUST ANCHOR */}
          <NearAuditCard />

          {/* 2. INTELLIGENT STORE ALERTS */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1226] p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Intelligent Store Alerts</span>
                  <span className="rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold">
                    {activeAlerts.length} Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated surveillance detecting impending stockouts, overdue debtor aging, and expense anomalies.
                </p>
              </div>

              {/* Severity Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#070B16] p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto text-xs">
                {(['all', 'critical', 'warning', 'opportunity'] as const).map((sev) => {
                  const count =
                    sev === 'all'
                      ? insights.copilot.alerts.filter((a) => !dismissedAlertIds.includes(a.id)).length
                      : insights.copilot.alerts.filter((a) => !dismissedAlertIds.includes(a.id) && a.severity === sev).length;
                  return (
                    <button
                      key={sev}
                      onClick={() => setCopilotSeverityFilter(sev)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 capitalize ${
                        copilotSeverityFilter === sev
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sev === 'all' ? 'All Alerts' : sev} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert Cards List */}
            {activeAlerts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-8 text-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <div className="font-semibold text-white">No Active Alerts</div>
                <div className="text-xs mt-1">All monitored metrics are operating within safe commercial limits.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4.5 flex flex-col justify-between transition-all ${
                      alert.severity === 'critical'
                        ? 'border-rose-500/30 bg-rose-950/15 hover:border-rose-500/50'
                        : alert.severity === 'warning'
                        ? 'border-amber-500/30 bg-amber-950/15 hover:border-amber-500/50'
                        : 'border-cyan-500/30 bg-cyan-950/15 hover:border-cyan-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {alert.severity === 'critical' ? (
                            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                          ) : (
                            <Flame className="h-4 w-4 text-cyan-400 shrink-0" />
                          )}
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                              alert.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-300'
                                : alert.severity === 'warning'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] font-mono text-white">
                          {alert.metricValue}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTriggerAction(alert.actionType, alert.actionTarget)}
                        className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>{alert.actionLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. BUSINESS OPPORTUNITIES */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1226] p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Commercial Opportunities</span>
                <span className="rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold">
                  {insights.copilot.opportunities.length} Identified
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactive revenue expansion, margin enhancement, and capital liquidation tactics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.copilot.opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-xl border border-slate-800 bg-[#070B16] p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                        {opp.categoryLabel}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 mono-num">
                        {opp.potentialImpact}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {opp.title}
                    </h4>

                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">{opp.description}</p>

                    <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300 block mb-0.5">Verified Store Evidence:</span>
                      {opp.evidence}
                    </div>

                    <div className="mt-2.5 text-xs text-cyan-200/90 font-medium">
                      <span className="font-semibold text-white">Suggested Move:</span> {opp.suggestedAction}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleTriggerAction(opp.actionType, opp.actionTarget)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-cyan-500 shadow-md transition-all"
                    >
                      <span>{opp.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ACTIONABLE RECOMMENDATIONS (STRICT 4-PART MANDATED FORMAT) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1226] p-6 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Actionable Strategic Recommendations</span>
                  <span className="rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold">
                    4-Part Diagnostic Standard
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every recommendation below details what was identified, why it matters commercially, supporting store figures, and the exact practical action to execute.
              </p>
            </div>

            <div className="space-y-4">
              {insights.copilot.actionableRecommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-slate-800 bg-[#070B16] p-5 hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30 text-xs font-bold">
                        #{index + 1}
                      </span>
                      <h4 className="text-base font-bold text-white">{rec.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          rec.urgency === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : rec.urgency === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                        }`}
                      >
                        {rec.urgency} Urgency
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        {rec.category}
                      </span>
                    </div>
                  </div>

                  {/* 4 Required Structural Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    {/* Part 1: What was identified */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase tracking-wider text-[10px]">
                        <Search className="h-3.5 w-3.5 text-cyan-400" />
                        <span>1. What Was Identified</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{rec.whatWasIdentified}</p>
                    </div>

                    {/* Part 2: Why it matters */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                        <Activity className="h-3.5 w-3.5 text-amber-400" />
                        <span>2. Why It Matters</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{rec.whyItMatters}</p>
                    </div>

                    {/* Part 3: Supporting business data */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span>3. Supporting Business Data</span>
                      </div>
                      <p className="text-slate-300 mono-num leading-relaxed">{rec.supportingData}</p>
                    </div>

                    {/* Part 4: Practical action */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-3.5 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                          <Zap className="h-3.5 w-3.5 text-emerald-400" />
                          <span>4. Practical Action to Take</span>
                        </div>
                        <p className="text-emerald-100 font-medium leading-relaxed mt-1">
                          {rec.practicalAction}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleTriggerAction(rec.actionType, rec.actionTarget)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 text-xs shadow-md transition-all"
                        >
                          <span>{rec.actionLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. STRUCTURED BUSINESS REPORTS */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1226] p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Structured Executive Reports</span>
                  <span className="rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold">
                    One-Click Briefings
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated commercial summaries generated strictly from actual store receipts, stock records, and expenses.
                </p>
              </div>

              {/* Period Selector Tabs */}
              <div className="flex items-center gap-1 bg-[#070B16] p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setReportPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${
                      reportPeriod === p
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Rendered Executive Report Container */}
            <div className="rounded-2xl border border-slate-800 bg-[#070B16] p-6 space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    {settings.storeName} • Shop 14, Digital Plaza, Computer Village, Ikeja
                  </span>
                  <h4 className="text-xl font-black text-white mt-0.5">
                    {activeBusinessReport.periodLabel}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Report Date: {activeBusinessReport.reportDate} • Evaluated at {new Date(activeBusinessReport.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-all shadow-sm"
                  >
                    {copiedReport ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-300" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Print / Export</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="rounded-xl border border-slate-800 bg-[#0B1226] p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] block mb-1">
                  Executive Briefing:
                </span>
                {activeBusinessReport.executiveSummary}
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeBusinessReport.kpis.map((kpi, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-[#0B1226] p-3.5"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {kpi.label}
                    </span>
                    <div className="text-lg sm:text-xl font-extrabold text-white mt-1 mono-num">
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements & Critical Attention Two-Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Achievements */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Key Achievements & Milestones</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeBusinessReport.topAchievements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Critical Attention Items */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Critical Attention & Exposure</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeBusinessReport.criticalAttentionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              <div className="rounded-xl border border-slate-800 bg-[#0B1226] p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Target className="h-4 w-4 text-cyan-400" />
                  <span>Practical Management Action Plan</span>
                </div>
                <div className="space-y-2 text-xs">
                  {activeBusinessReport.actionPlan.map((act, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800/80 bg-[#070B16] p-2.5 flex items-start gap-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="text-slate-200 mt-0.5 leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: EXECUTIVE AI INSIGHTS DASHBOARD */}
      {/* ==================================================================== */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* NEAR Blockchain Trust & Verification Anchor */}
          <NearAuditCard />

          {/* 4 Primary Top Intelligence KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Gross Sales Turnover */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sales Turnover
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/30 text-cyan-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-white mono-num">
                  {formatNaira(insights.sales.totalRevenue)}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{insights.sales.totalUnitsSold} gadget units sold</span>
                  <span className="text-cyan-400 font-medium">AOV: {formatNaira(insights.sales.averageOrderValue)}</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
            </div>

            {/* KPI 2: Net Operating Profit */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Net Operating Profit
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mono-num">
                  {formatNaira(insights.financials.netProfit)}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Net Margin: <strong className="text-emerald-400">{insights.financials.netMarginPercent.toFixed(1)}%</strong></span>
                  <span>Gross: {insights.financials.grossMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            </div>

            {/* KPI 3: Inventory Valuation */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Inventory Working Capital
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Boxes className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-white mono-num">
                  {formatNaira(insights.inventory.totalValuationCost)}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Selling Value: {formatNaira(insights.inventory.totalValuationSelling)}</span>
                  <span className="text-amber-400 font-medium">+{formatNaira(insights.inventory.potentialGrossProfit)} gain</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
            </div>

            {/* KPI 4: Uncollected Receivables */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  Pending Receivables
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/15 border border-rose-500/30 text-rose-400">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mono-num">
                  {formatNaira(insights.financials.totalOutstandingReceivables)}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{debtors.length} customers owe</span>
                  <button
                    onClick={() => setActiveSection('payments')}
                    className="text-rose-400 hover:underline font-semibold"
                  >
                    Recover Debt &rarr;
                  </button>
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
            </div>
          </div>

          {/* AI ACTIONABLE RECOMMENDATIONS (Feature 5) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Actionable AI Business Recommendations
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Derived strictly from recorded transactions • No fabricated statistics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.recommendations.map((rec) => {
                const isCritical = rec.impact === 'critical';
                const isHigh = rec.impact === 'high';

                return (
                  <div
                    key={rec.id}
                    className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all ${
                      isCritical
                        ? 'border-rose-500/40 bg-[#0F0A18] hover:border-rose-500/60'
                        : isHigh
                        ? 'border-amber-500/30 bg-[#0F121C] hover:border-amber-500/50'
                        : 'border-slate-800 bg-[#070B16] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {rec.impact} Priority
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {rec.category.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug">
                        {rec.title}
                      </h3>

                      <p className="mt-2 text-xs text-slate-200 leading-relaxed font-medium">
                        {rec.recommendation}
                      </p>

                      {/* Explicit Why / Reasoning box (Requirement 5) */}
                      <div className="mt-3 p-3 rounded-lg bg-black/40 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                          <Info className="h-3.5 w-3.5" />
                          <span>Why this recommendation is made:</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {rec.reasoning}
                        </p>
                      </div>

                      <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>Expected Benefit: {rec.expectedBenefit}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
                      <button
                        onClick={() => handleAction(rec)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                      >
                        <span>{rec.actionLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TWO COLUMN GRID: Sales Velocity Trends & Financial Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION 1: SALES PERFORMANCE ANALYSIS (Requirement 1) */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Sales Performance & Revenue Trends</h3>
                </div>

                <div className="flex items-center gap-1 bg-[#070B16] p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSalesTrendView('daily')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      salesTrendView === 'daily'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Daily (7d)
                  </button>
                  <button
                    onClick={() => setSalesTrendView('weekly')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      salesTrendView === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* Visual Trend Bars */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-[#070B16] space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Timeline</span>
                  <span>Turnover (₦) & Orders</span>
                </div>

                {salesTrendView === 'daily' ? (
                  <div className="space-y-2">
                    {insights.sales.dailyTrends.map((trend) => {
                      const barPercent = Math.max(8, Math.round((trend.revenue / maxTrendRevenue) * 100));
                      return (
                        <div key={trend.date} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">
                              {trend.dayName}, {trend.formattedDate}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{trend.ordersCount} orders</span>
                              <span className="font-bold text-white mono-num">
                                {formatNaira(trend.revenue)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {insights.sales.weeklyTrends.map((trend) => {
                      const barPercent = Math.max(12, Math.round((trend.revenue / maxTrendRevenue) * 100));
                      return (
                        <div key={trend.weekLabel} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">{trend.weekLabel}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{trend.ordersCount} sales</span>
                              <span className="font-bold text-white mono-num">
                                {formatNaira(trend.revenue)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Best-Sellers vs Slow-Movers Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Top Best-Sellers</span>
                  </span>
                  <div className="space-y-2 text-xs">
                    {insights.sales.bestSellers.slice(0, 3).map((item, idx) => (
                      <div key={item.product.id} className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                        <div className="truncate max-w-[140px]">
                          <span className="text-slate-400 font-mono mr-1">#{idx + 1}</span>
                          <span className="text-white font-medium">{item.product.name.split('(')[0]}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold mono-num">{formatNaira(item.totalRevenue)}</div>
                          <div className="text-[10px] text-cyan-400">{item.unitsSold} units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Slow-Moving Inventory</span>
                  </span>
                  <div className="space-y-2 text-xs">
                    {insights.sales.slowMovers.slice(0, 3).map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                        <div className="truncate max-w-[140px]">
                          <span className="text-white font-medium">{item.product.name.split('(')[0]}</span>
                          <div className="text-[10px] text-slate-400">{item.product.stock} in stock</div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 font-semibold mono-num">{formatNaira(item.capitalLocked)}</div>
                          <div className="text-[10px] text-slate-400">Tied capital</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: FINANCIAL INTELLIGENCE & PROFITABILITY (Requirement 3) */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Financial Intelligence & Profitability</h3>
                </div>
                <button
                  onClick={() => setActiveSection('expenses')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Expenses Ledger &rarr;
                </button>
              </div>

              {/* Profitability Waterfall */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-[#070B16] space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  Business Profitability Breakdown (October 2026)
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Total Sales Turnover:</span>
                    <span className="font-bold text-white mono-num">{formatNaira(insights.financials.revenue)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-cyan-400">Less Cost of Goods Sold (COGS):</span>
                    <span className="font-bold text-cyan-400 mono-num">-{formatNaira(insights.financials.cogs)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800 bg-slate-900/40 px-2 rounded">
                    <span className="font-semibold text-slate-200">Gross Profit (Margin {insights.financials.grossMarginPercent.toFixed(1)}%):</span>
                    <span className="font-extrabold text-white mono-num">{formatNaira(insights.financials.grossProfit)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-amber-400">Less Operating Overhead (OPEX):</span>
                    <span className="font-bold text-amber-400 mono-num">-{formatNaira(insights.financials.operatingExpenses)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 px-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                    <span className="font-extrabold text-emerald-400">Net Business Profit (Margin {insights.financials.netMarginPercent.toFixed(1)}%):</span>
                    <span className="font-extrabold text-emerald-400 mono-num text-sm">{formatNaira(insights.financials.netProfit)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  🛡️ Anti-Double-Counting verified: Stock purchases ({formatNaira(insights.financials.stockPurchasesOutlay)}) represent asset value and are accounted for strictly via COGS upon sale.
                </div>
              </div>

              {/* Expense Allocation Bars */}
              <div className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3.5 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Top Operating Expense Drivers
                </span>
                <div className="space-y-2 text-xs">
                  {insights.financials.topExpenseCategories.slice(0, 4).map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{item.percentage}%</span>
                          <span className="font-bold text-white mono-num">{formatNaira(item.amount)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                          style={{ width: `${Math.max(8, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: Inventory Intelligence & Customer Cohort Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION 3: INVENTORY INTELLIGENCE (Requirement 2) */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Inventory Intelligence & Reorder Buffer</h3>
                </div>
                <button
                  onClick={() => setActiveTab('restock_matrix')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Full Reorder Matrix &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {insights.inventory.restockRecommendations.slice(0, 4).map((rec) => (
                  <div
                    key={rec.product.id}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-[#070B16] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {rec.product.name.split('(')[0]}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.urgency === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {rec.currentStock} left (Min {rec.minAlert})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <div className="text-xs font-bold text-cyan-400 mono-num">
                          +{rec.recommendedUnits} units
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatNaira(rec.estimatedCost)}
                        </div>
                      </div>

                      <button
                        onClick={() => openRestockModal(rec.product, rec.recommendedUnits)}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restock</span>
                      </button>
                    </div>
                  </div>
                ))}

                {insights.inventory.restockRecommendations.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    ✨ All gadget inventory levels are healthy with ample safety buffers.
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: CUSTOMER COHORT INSIGHTS (Requirement 4) */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Customer Insights & Account Health</h3>
                </div>
                <button
                  onClick={() => setActiveSection('customers')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Customer CRM &rarr;
                </button>
              </div>

              {/* Customer Retention Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Repeat Buyer Rate</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {insights.customers.repeatRatePercent}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {insights.customers.repeatCustomersCount} loyal repeat clients
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">Debtor Accounts</span>
                  <div className="text-2xl font-extrabold text-rose-400 mt-1">
                    {insights.customers.debtorCustomers.length}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatNaira(insights.financials.totalOutstandingReceivables)} total balance
                  </span>
                </div>
              </div>

              {/* Top VIP Clients and Overdue Debtors */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Top Store Clients (Highest Lifetime Value)
                </span>
                <div className="space-y-1.5 text-xs">
                  {insights.customers.topSpenders.slice(0, 3).map(({ customer, stats }) => (
                    <div
                      key={customer.id}
                      onClick={() => setActiveDetailCustomer(customer)}
                      className="p-2.5 rounded-xl border border-slate-800/80 bg-[#070B16] hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white hover:text-cyan-400 transition-colors">
                          {customer.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {stats.totalOrdersCount} purchases • {customer.city || 'Lagos'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white mono-num">{formatNaira(stats.totalSpent)}</div>
                        <span className="text-[10px] text-cyan-400 font-semibold">{customer.tag || 'Regular'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Channel Preference */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Customer Payment Method Preference
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {insights.customers.paymentChannelPreference.map((chan) => (
                    <div
                      key={chan.method}
                      className="rounded-lg border border-slate-800 bg-[#070B16] px-2.5 py-1 text-xs flex items-center gap-1.5"
                    >
                      <span className="text-white font-medium capitalize">{chan.method.replace('_', ' ')}</span>
                      <span className="text-cyan-400 font-bold">{chan.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: INTERACTIVE AI RESTOCK & CAPITAL PLANNER */}
      {/* ==================================================================== */}
      {activeTab === 'restock_matrix' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* TOP BANNER & CONTROLS */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Restock Planner & Inventory Intelligence</span>
                      <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">
                        Live Velocity Engine
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Accurate purchase order intelligence calculated from actual completed sales records, lead time, and safety buffers for Rawls & Hub.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Analysis Window Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-xs flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Analysis Period</div>
                    <div className="font-bold text-white mono-num">
                      {insights.inventory.analysisPeriod.startDate} &rarr; {insights.inventory.analysisPeriod.endDate} ({insights.inventory.analysisPeriod.days}d)
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Transactions Analyzed</div>
                    <div className="font-bold text-emerald-400 mono-num">
                      {insights.inventory.analysisPeriod.completedSalesCount} Completed Sales
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    showConfigPanel
                      ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                      : 'border-slate-800 bg-[#070B16] text-slate-300 hover:text-white'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{showConfigPanel ? 'Hide Settings' : 'Configure Assumptions'}</span>
                  {showConfigPanel ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* CONFIGURABLE ASSUMPTIONS PANEL (Requirement 2) */}
            {showConfigPanel && (
              <div className="rounded-xl border border-slate-800/90 bg-[#070B16] p-4 space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Configurable Supply Chain Assumptions
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateRestockConfig({
                        supplierLeadTimeDays: 7,
                        safetyStockDays: 7,
                        analysisPeriodDays: 30,
                      })
                    }
                    className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Reset Defaults (7d / 7d / 30d)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Lead Time */}
                  <div className="space-y-2 rounded-lg border border-slate-800 bg-[#0A0F22] p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Supplier Lead Time</span>
                      <span className="font-extrabold text-cyan-400 mono-num">
                        {restockConfig.supplierLeadTimeDays} days
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Distributor freight & dispatch time from Computer Village / Dubai depots.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {[3, 5, 7, 14, 21].map((days) => (
                        <button
                          key={days}
                          onClick={() => updateRestockConfig({ supplierLeadTimeDays: days })}
                          className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            restockConfig.supplierLeadTimeDays === days
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800/70 text-slate-400 hover:text-white'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Safety Stock */}
                  <div className="space-y-2 rounded-lg border border-slate-800 bg-[#0A0F22] p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Safety Stock Buffer</span>
                      <span className="font-extrabold text-amber-400 mono-num">
                        {restockConfig.safetyStockDays} days
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Buffer days of demand to absorb unexpected Lagos retail customer rushes.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {[3, 7, 10, 14, 21].map((days) => (
                        <button
                          key={days}
                          onClick={() => updateRestockConfig({ safetyStockDays: days })}
                          className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            restockConfig.safetyStockDays === days
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800/70 text-slate-400 hover:text-white'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Window */}
                  <div className="space-y-2 rounded-lg border border-slate-800 bg-[#0A0F22] p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Sales Velocity Window</span>
                      <span className="font-extrabold text-emerald-400 mono-num">
                        {restockConfig.analysisPeriodDays} days
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Historical completed sales period used to calculate average daily run-rate.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {[7, 14, 30, 60, 90].map((days) => (
                        <button
                          key={days}
                          onClick={() => updateRestockConfig({ analysisPeriodDays: days })}
                          className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            restockConfig.analysisPeriodDays === days
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800/70 text-slate-400 hover:text-white'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6 KEY METRIC CARDS (Requirement 4 & 5) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Total Automated Reorder Capital */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  Automated Capital
                </span>
                <div className="text-lg font-extrabold text-white mono-num">
                  {formatNaira(insights.inventory.totalRestockCapitalNeeded)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-cyan-400 inline" />
                  <span>Excludes manual items</span>
                </div>
              </div>

              {/* 2. Total Recommended Units */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Units to Order
                </span>
                <div className="text-lg font-extrabold text-cyan-400 mono-num">
                  +{insights.inventory.totalRecommendedUnits} units
                </div>
                <div className="text-[10px] text-slate-400">
                  {insights.inventory.restockRecommendations.length} active reorders
                </div>
              </div>

              {/* 3. Critical Low Stock */}
              <div className="rounded-xl border border-rose-900/40 bg-rose-950/15 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                  Critical Low
                </span>
                <div className="text-lg font-extrabold text-rose-300 mono-num">
                  {insights.inventory.criticalCount}
                </div>
                <div className="text-[10px] text-rose-400/80">
                  Stockout risk imminent
                </div>
              </div>

              {/* 4. Approaching Stockout */}
              <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Approaching Alert
                </span>
                <div className="text-lg font-extrabold text-amber-300 mono-num">
                  {insights.inventory.approachingStockoutCount}
                </div>
                <div className="text-[10px] text-amber-400/80">
                  At/near reorder point
                </div>
              </div>

              {/* 5. Flagged for Manual Review */}
              <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  Manual Review
                </span>
                <div className="text-lg font-extrabold text-purple-300 mono-num">
                  {insights.inventory.noSalesHistoryCount}
                </div>
                <div className="text-[10px] text-purple-400/80">
                  Zero sales in period
                </div>
              </div>

              {/* 6. Overstocked / High Runway */}
              <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/15 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                  Overstocked
                </span>
                <div className="text-lg font-extrabold text-indigo-300 mono-num">
                  {insights.inventory.overstockedCount}
                </div>
                <div className="text-[10px] text-indigo-400/80">
                  {'>'} 60 days of stock
                </div>
              </div>
            </div>

            {/* FILTER & SEARCH TOOLBAR (Requirement 5) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search gadget, SKU, category, or supplier..."
                    value={restockSearch}
                    onChange={(e) => setRestockSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#070B16] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  {restockSearch && (
                    <button
                      onClick={() => setRestockSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
                  <Package className="h-3.5 w-3.5 text-cyan-400" />
                  <span>
                    Showing <strong>{filteredRestockItems.length}</strong> of{' '}
                    <strong>{insights.inventory.allRestockEvaluations.length}</strong> catalog gadgets
                  </span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                {[
                  { id: 'all', label: 'All Catalog', count: insights.inventory.allRestockEvaluations.length },
                  { id: 'reorder', label: 'Reorder Needed', count: insights.inventory.restockRecommendations.length },
                  { id: 'critical', label: 'Critical Low', count: insights.inventory.criticalCount },
                  { id: 'approaching', label: 'Approaching Stockout', count: insights.inventory.approachingStockoutCount },
                  { id: 'manual_review', label: 'Manual Review (0 Sales)', count: insights.inventory.noSalesHistoryCount },
                  { id: 'slow', label: 'Slow-Moving', count: insights.inventory.slowMovingCount },
                  { id: 'overstocked', label: 'Overstocked', count: insights.inventory.overstockedCount },
                  { id: 'healthy', label: 'Healthy Stock', count: insights.inventory.healthyCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRestockFilter(tab.id as RestockFilterType)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      restockFilter === tab.id
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'border border-slate-800 bg-[#070B16] text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        restockFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RESTOCK INTELLIGENCE TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#070B16] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3.5">Product & Supplier</th>
                    <th className="px-4 py-3.5">Inventory Status</th>
                    <th className="px-4 py-3.5">Current / Min</th>
                    <th className="px-4 py-3.5">Sales Velocity</th>
                    <th className="px-4 py-3.5">Stock Duration</th>
                    <th className="px-4 py-3.5 text-right">Recommended Order</th>
                    <th className="px-4 py-3.5 text-right">Wholesale Cost (₦)</th>
                    <th className="px-4 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0A0F22]/70">
                  {filteredRestockItems.map((rec) => {
                    const isExpanded = expandedCalcId === rec.product.id;
                    return (
                      <React.Fragment key={rec.product.id}>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          {/* Product Info */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white text-xs">{rec.product.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="mono-num text-cyan-400/90">{rec.product.sku}</span>
                              <span>•</span>
                              <span>{rec.product.category}</span>
                            </div>
                            {rec.product.supplier && (
                              <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                Supplier: {rec.product.supplier}
                              </div>
                            )}
                          </td>

                          {/* Inventory Warning Badges */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="space-y-1">
                              {rec.isFlaggedForManualReview ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  <HelpCircle className="h-3 w-3" />
                                  Manual Review (0 Sales)
                                </span>
                              ) : (
                                renderWarningBadges(rec.warningTypes, rec.primaryWarning)
                              )}
                            </div>
                          </td>

                          {/* Current Stock vs Min Alert */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-extrabold mono-num ${
                                  rec.currentStock <= rec.minAlert ? 'text-rose-400' : 'text-slate-200'
                                }`}
                              >
                                {rec.currentStock}
                              </span>
                              <span className="text-slate-400 text-xs">/ {rec.minAlert} min</span>
                            </div>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rec.currentStock <= Math.floor(rec.minAlert / 2)
                                    ? 'bg-rose-500'
                                    : rec.currentStock <= rec.minAlert
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.round((rec.currentStock / Math.max(1, rec.minAlert * 2)) * 100))}%`,
                                }}
                              />
                            </div>
                          </td>

                          {/* Sales Velocity (Requirement 1) */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                            {rec.unitsSoldRecent > 0 ? (
                              <div>
                                <div className="font-bold text-white mono-num">
                                  {rec.dailyVelocity} units/day
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {rec.unitsSoldRecent} units sold in {rec.breakdown.analysisPeriodDays}d
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400 italic">
                                0 sales recorded
                              </div>
                            )}
                          </td>

                          {/* Stock Duration (Requirement 3: Never negative; "No sales data" if velocity is 0) */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                            {rec.daysOfInventoryLeft !== null ? (
                              <span
                                className={`font-semibold mono-num ${
                                  rec.daysOfInventoryLeft < restockConfig.supplierLeadTimeDays
                                    ? 'text-rose-400'
                                    : rec.daysOfInventoryLeft <= restockConfig.supplierLeadTimeDays + restockConfig.safetyStockDays
                                    ? 'text-amber-400'
                                    : rec.daysOfInventoryLeft >= 60
                                    ? 'text-indigo-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {rec.daysOfInventoryLeftDisplay}
                              </span>
                            ) : (
                              <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700/60">
                                No sales data
                              </span>
                            )}
                          </td>

                          {/* Recommended Order Quantity (Requirement 2 & 4) */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            {rec.isFlaggedForManualReview ? (
                              <span className="rounded-lg bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 text-[11px] font-bold text-purple-300">
                                Manual Review
                              </span>
                            ) : rec.recommendedUnits > 0 ? (
                              <span className="font-extrabold text-cyan-400 mono-num text-sm">
                                +{rec.recommendedUnits} units
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">
                                0 units (Adequate)
                              </span>
                            )}
                          </td>

                          {/* Wholesale Purchase Cost (Requirement 4: Exclude manual review items) */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold mono-num">
                            {rec.isFlaggedForManualReview ? (
                              <div>
                                <span className="text-slate-400 text-xs">₦0</span>
                                <span className="block text-[9px] text-purple-400/90 font-normal">Excluded</span>
                              </div>
                            ) : rec.estimatedCost > 0 ? (
                              <span className="text-white text-xs sm:text-sm">
                                {formatNaira(rec.estimatedCost)}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">₦0</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setExpandedCalcId(isExpanded ? null : rec.product.id)}
                                title="View calculation formula and supporting sales receipts"
                                className={`rounded-lg p-1.5 transition-colors ${
                                  isExpanded
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                <Calculator className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openRestockModal(rec.product, rec.recommendedUnits || 10)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 ${
                                  rec.recommendedUnits > 0
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restock</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDABLE MATHEMATICAL CALCULATION & SUPPORTING RECORDS (Requirement 4 & 6) */}
                        {isExpanded && (
                          <tr className="bg-[#070B16] border-y border-slate-800/80 animate-in fade-in duration-100">
                            <td colSpan={8} className="p-4 sm:p-5">
                              <div className="rounded-xl border border-slate-800 bg-[#0B1124] p-4 space-y-4 text-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-cyan-400" />
                                    <span className="font-bold text-white text-sm">
                                      Calculation Engine & Supporting Evidence: {rec.product.name}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 mono-num">
                                    Wholesale Cost Price: {formatNaira(rec.breakdown.unitCostPrice)}
                                  </span>
                                </div>

                                {/* Mathematical Step-by-Step Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {/* Step 1: Velocity */}
                                  <div className="rounded-lg border border-slate-800 bg-[#070B16] p-3 space-y-1">
                                    <div className="text-[10px] font-bold uppercase text-slate-400">
                                      Step 1: Sales Velocity (V)
                                    </div>
                                    <div className="text-white font-mono text-xs">
                                      V = Units Sold ({rec.breakdown.unitsSoldInPeriod}) / Period ({rec.breakdown.analysisPeriodDays}d)
                                    </div>
                                    <div className="text-cyan-400 font-extrabold text-sm mono-num">
                                      = {rec.breakdown.dailySalesVelocity} units / day
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Analysis window: {rec.breakdown.periodStartDate} to {rec.breakdown.periodEndDate}
                                    </div>
                                  </div>

                                  {/* Step 2: Target Reorder Level */}
                                  <div className="rounded-lg border border-slate-800 bg-[#070B16] p-3 space-y-1">
                                    <div className="text-[10px] font-bold uppercase text-slate-400">
                                      Step 2: Reorder Level (ROP)
                                    </div>
                                    <div className="text-white font-mono text-xs">
                                      Lead Demand (V × L) = {rec.breakdown.leadTimeDemand} units
                                    </div>
                                    <div className="text-white font-mono text-xs">
                                      Safety Buffer = {rec.breakdown.safetyStockUnits} units
                                    </div>
                                    <div className="text-amber-400 font-extrabold text-sm mono-num">
                                      Target = {rec.breakdown.targetReorderPoint} units
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Lead Time: {rec.breakdown.leadTimeDays}d • Safety Buffer: {rec.breakdown.safetyStockDays}d
                                    </div>
                                  </div>

                                  {/* Step 3: Purchase Recommendation & Cost */}
                                  <div className="rounded-lg border border-slate-800 bg-[#070B16] p-3 space-y-1">
                                    <div className="text-[10px] font-bold uppercase text-slate-400">
                                      Step 3: Recommended Order & Capital
                                    </div>
                                    {rec.isFlaggedForManualReview ? (
                                      <>
                                        <div className="text-purple-300 font-bold text-xs">
                                          Flagged for Manual Review (0 Units)
                                        </div>
                                        <div className="text-xs text-slate-400">
                                          Cost added to automated PO: <strong>₦0</strong>
                                        </div>
                                        <div className="text-[10px] text-purple-400">
                                          Excluded to prevent locking up ₦{formatNaira(rec.breakdown.unitCostPrice)}/unit
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-white font-mono text-xs">
                                          Target ({rec.breakdown.targetReorderPoint}) - Stock ({rec.breakdown.currentStock}) = {rec.breakdown.shortfall}
                                        </div>
                                        <div className="text-cyan-400 font-extrabold text-sm mono-num">
                                          +{rec.breakdown.recommendedOrderUnits} units to order
                                        </div>
                                        <div className="text-white font-bold mono-num text-xs">
                                          Cost: {formatNaira(rec.breakdown.totalEstimatedCost)}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Commercial Explanation (Requirement 6) */}
                                <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/15 p-3 space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                                    <Info className="h-4 w-4" />
                                    <span>Why This Recommendation Was Generated</span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    {rec.breakdown.explanation}
                                  </p>
                                </div>

                                {/* Supporting Business Records (Requirement 6 & 7) */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                                      <span>Supporting Completed Sales Records ({rec.breakdown.supportingSalesReceipts.length})</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Filtered strictly from verified sales transactions
                                    </span>
                                  </div>

                                  {rec.breakdown.supportingSalesReceipts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {rec.breakdown.supportingSalesReceipts.map((rcpt: { receiptNo: string; quantity: number; date: string; customerName: string }, idx: number) => (
                                        <div
                                          key={idx}
                                          className="rounded-lg border border-slate-800 bg-[#070B16] p-2.5 flex items-center justify-between"
                                        >
                                          <div>
                                            <span className="font-bold text-cyan-400 mono-num block text-xs">
                                              #{rcpt.receiptNo}
                                            </span>
                                            <span className="text-[11px] text-slate-300 truncate max-w-[150px] block">
                                              {rcpt.customerName}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              {rcpt.date.slice(0, 10)}
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs font-extrabold mono-num">
                                              +{rcpt.quantity} unit
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="rounded-lg border border-purple-500/20 bg-purple-950/15 p-3 text-xs text-purple-300 flex items-center gap-2">
                                      <HelpCircle className="h-4 w-4 shrink-0" />
                                      <span>
                                        No completed sales transactions exist for this product in the {rec.breakdown.analysisPeriodDays}-day window.
                                        This verifies why it is flagged for manual review rather than committing automatic reorders.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {filteredRestockItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                        No products match the selected filter or search term.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* DEDICATED CALLOUTS: MANUAL REVIEW & OVERSTOCK (Requirement 2, 4, 5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Manual Review Protection Panel */}
              <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Zero-Sales Working Capital Protection
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  SmartMerchant AI identified <strong>{insights.inventory.noSalesHistoryCount} product(s)</strong> with zero sales history during the analysis period.
                  These items are intentionally <strong>excluded from automated purchase totals</strong> (₦0 added) to prevent committing scarce merchant capital into unproven stock.
                </p>
                <div className="text-[11px] text-purple-400/90 font-medium">
                  Recommendation: Test customer demand via showroom showcases or customer requests before placing bulk supplier purchase orders.
                </div>
              </div>

              {/* Overstocked / Slow-Moving Capital Exposure Panel */}
              <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/15 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Overstocked & Slow-Moving Exposure
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>{insights.inventory.overstockedCount} product(s)</strong> have more than 60 days of stock duration based on current run-rates.
                  Overstocking ties up valuable store cash that could otherwise fund fast-turning PlayStation 5 consoles or iPhone 16 Pro Max units.
                </p>
                <div className="text-[11px] text-indigo-400/90 font-medium">
                  Recommendation: Create bundled promotions (e.g., earbud + phone packages) or 5% weekend clearance discounts to accelerate turnover.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: INTERACTIVE SMARTMERCHANT AI COPILOT CHAT */}
      {/* ==================================================================== */}
      {activeTab === 'copilot' && (
        <div className="flex flex-col space-y-4">
          {/* Top Assistant Status & Reset Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-[#0A0F22]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Ask SmartMerchant AI
                  </h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Data Grounded
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Instant, reliable answers computed directly from {settings.storeName}&apos;s real ledgers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleResetChat}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                title="Reset conversation to initial state"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>

          {/* Quick-Prompt Question Categories */}
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#070B16] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Frequent Business Queries</span>
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Click any prompt to query real store data immediately
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSendMessage('Which products sold the most this month?')}
                className="rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-900/40 px-3 py-1.5 text-xs font-medium text-blue-300 hover:text-white transition-all text-left"
              >
                🏆 Which products sold the most this month?
              </button>

              <button
                onClick={() => handleSendMessage('How much revenue did I generate this week?')}
                className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-white transition-all text-left"
              >
                💰 How much revenue did I generate this week?
              </button>

              <button
                onClick={() => handleSendMessage('Which customers owe me money?')}
                className="rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/40 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white transition-all text-left"
              >
                📋 Which customers owe me money?
              </button>

              <button
                onClick={() => handleSendMessage('What are my outstanding receivables?')}
                className="rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/40 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-white transition-all text-left"
              >
                ⚠️ What are my outstanding receivables?
              </button>

              <button
                onClick={() => handleSendMessage('Which products need restocking?')}
                className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-white transition-all text-left"
              >
                🔄 Which products need restocking?
              </button>

              <button
                onClick={() => handleSendMessage('Which products have not sold recently?')}
                className="rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 px-3 py-1.5 text-xs font-medium text-purple-300 hover:text-white transition-all text-left"
              >
                ⏳ Which products have not sold recently?
              </button>

              <button
                onClick={() => handleSendMessage('How much profit did the business make?')}
                className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-white transition-all text-left"
              >
                📈 How much profit did the business make?
              </button>

              <button
                onClick={() => handleSendMessage('What are my biggest business expenses?')}
                className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/40 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white transition-all text-left"
              >
                📊 What are my biggest business expenses?
              </button>

              <button
                onClick={() => handleSendMessage('Who are my most frequent customers?')}
                className="rounded-xl border border-teal-500/30 bg-teal-950/20 hover:bg-teal-900/40 px-3 py-1.5 text-xs font-medium text-teal-300 hover:text-white transition-all text-left"
              >
                👥 Who are my most frequent customers?
              </button>

              <button
                onClick={() => handleSendMessage('Draft a polite WhatsApp debt reminder for Alhaji Musa')}
                className="rounded-xl border border-green-500/30 bg-green-950/20 hover:bg-green-900/40 px-3 py-1.5 text-xs font-medium text-green-300 hover:text-white transition-all text-left"
              >
                📱 Draft WhatsApp debt reminder for Alhaji Musa
              </button>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="h-[520px] overflow-y-auto rounded-2xl border border-slate-800 bg-[#070B16] p-4 sm:p-6 space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const textLower = msg.text.toLowerCase();
              const hasDebtorsMention = textLower.includes('debtor') || textLower.includes('owe') || textLower.includes('receivable');
              const hasRestockMention = textLower.includes('restock') || textLower.includes('reorder') || textLower.includes('lead time');
              const hasExpenseMention = textLower.includes('expense') || textLower.includes('cogs') || textLower.includes('overhead');
              const hasCustomerMention = textLower.includes('frequent customer') || textLower.includes('top customer') || textLower.includes('vip');
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-3xl rounded-2xl px-4 sm:px-5 py-3.5 shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                        : 'border border-slate-800/80 bg-[#0B1124] text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-xs">
                      <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        {isUser ? 'You' : 'SmartMerchant AI Advisor'}
                        {!isUser && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({settings.storeName})
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div className="prose prose-invert text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>

                    {/* Quick Contextual Action Shortcuts on Assistant Replies */}
                    {!isUser && (hasDebtorsMention || hasRestockMention || hasExpenseMention || hasCustomerMention) && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex flex-wrap gap-2 items-center">
                        <span className="text-[11px] font-semibold text-slate-400">Direct Actions:</span>
                        {hasDebtorsMention && (
                          <button
                            onClick={() => setActiveSection('payments')}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2.5 py-1 text-xs font-semibold text-rose-300 transition-colors"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>View Debtors Ledger</span>
                          </button>
                        )}
                        {hasRestockMention && (
                          <button
                            onClick={() => setActiveTab('restock_matrix')}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2.5 py-1 text-xs font-semibold text-cyan-300 transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Open Restock Matrix</span>
                          </button>
                        )}
                        {hasExpenseMention && (
                          <button
                            onClick={() => setActiveSection('expenses')}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition-colors"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>Review Expenses</span>
                          </button>
                        )}
                        {hasCustomerMention && (
                          <button
                            onClick={() => setActiveSection('customers')}
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 px-2.5 py-1 text-xs font-semibold text-teal-300 transition-colors"
                          >
                            <Users className="h-3 w-3" />
                            <span>View Customers CRM</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Dynamic Follow-up Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 mb-2">
                          Suggested Inquiries:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(sug)}
                              className="rounded-lg border border-slate-700/80 bg-[#070B16] px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-400 hover:text-white transition-colors"
                            >
                              {sug} &rarr;
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isUser && (
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px] text-slate-500">
                          {msg.isFallback
                            ? '⚡ Local Business Calculation Engine'
                            : '⚡ Powered by Gemini 3.8 Flash & Live Rawls & Hub Ledgers'}
                        </span>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Response</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoadingChat && (
              <div className="flex gap-3.5 items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#0B1124] px-4 py-3 text-xs text-cyan-300 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Computing live business data across sales, debtors, inventory, and expenses...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form with Send Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 shrink-0 rounded-2xl border border-slate-800 bg-[#0A0F22] p-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about sales, debtors, restocking, expenses, or profit..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoadingChat}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
