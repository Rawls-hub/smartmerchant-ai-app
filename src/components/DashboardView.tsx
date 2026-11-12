import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  RotateCcw,
  Receipt,
  CheckCircle2,
  ChevronRight,
  Building2,
  Wallet,
  Zap,
  Users,
  PieChart,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';

export const DashboardView: React.FC = () => {
  const {
    totalSalesToday,
    totalPaymentsReceived,
    totalOutstandingPayments,
    outstandingPayments,
    totalProductsInStock,
    totalUnitsInStock,
    lowStockAlertsCount,
    lowStockProducts,
    debtors,
    customers,
    sales,
    orders,
    expenses,
    totalExpensesToday,
    totalExpensesThisMonth,
    getProfitabilitySummary,
    setActiveSection,
    setIsNewSaleOpen,
    setIsExpenseModalOpen,
    setActiveReceipt,
    setActiveWhatsAppModalDebtor,
    setActiveRestockProduct,
    setActiveDetailCustomer,
    settings,
    setAiTab,
    openRestockPlanner,
    openAskAI,
  } = useMerchant();

  const monthProfitability = useMemo(() => {
    return getProfitabilitySummary('month');
  }, [getProfitabilitySummary]);

  const overdueDebtors = debtors.filter((d) => d.daysOverdue > 0);
  const overdueTotal = overdueDebtors.reduce((acc, d) => acc + d.amountOwed, 0);

  // Payment Breakdown
  const paymentMethodTotals = sales.reduce(
    (acc, s) => {
      if (s.paymentMethod === 'opay' || s.paymentMethod === 'bank_transfer') {
        acc.transfers += s.totalAmount;
      } else if (s.paymentMethod === 'moniepoint') {
        acc.pos += s.totalAmount;
      } else if (s.paymentMethod === 'palmpay') {
        acc.transfers += s.totalAmount;
      } else if (s.paymentMethod === 'cash') {
        acc.cash += s.totalAmount;
      } else {
        acc.credit += s.totalAmount;
      }
      return acc;
    },
    { transfers: 0, pos: 0, cash: 0, credit: 0 }
  );

  const totalCalculated =
    paymentMethodTotals.transfers +
    paymentMethodTotals.pos +
    paymentMethodTotals.cash +
    paymentMethodTotals.credit || 1;

  const transferPercent = Math.round((paymentMethodTotals.transfers / totalCalculated) * 100);
  const posPercent = Math.round((paymentMethodTotals.pos / totalCalculated) * 100);
  const cashPercent = Math.round((paymentMethodTotals.cash / totalCalculated) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Merchant Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Merchant Dashboard
            </h1>
            <span className="rounded-full bg-blue-500/10 px-3 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Today&apos;s Snapshot
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time financial pulse and inventory intelligence for {settings.storeName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveSection('customers')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
          >
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Customers CRM</span>
          </button>

          <button
            onClick={() => setActiveSection('expenses')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
          >
            <Receipt className="h-4 w-4 text-rose-400" />
            <span className="hidden sm:inline">Expenses</span>
          </button>

          <button
            onClick={() => setActiveSection('ai')}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-cyan-300 hover:bg-cyan-900/30 transition-all glow-cyan-sm"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>AI Business Audit</span>
          </button>

          <button
            onClick={() => setIsNewSaleOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
          >
            <Zap className="h-4 w-4" />
            <span>Quick POS Sale</span>
          </button>
        </div>
      </div>

      {/* 6 CORE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Sales Turnover */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Total Sales Turnover
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-white mono-num tracking-tight truncate">
              {formatNaira(totalSalesToday)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                +18.4%
              </span>
              <span className="text-slate-400 truncate">{sales.length} sales</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">POS & Online</span>
            <button
              onClick={() => setActiveSection('sales')}
              className="font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              Sales &rarr;
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-80" />
        </div>

        {/* 2. Total Payments Received */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              Total Payments Received
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mono-num tracking-tight truncate">
              {formatNaira(totalPaymentsReceived)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-300 border border-emerald-500/20">
                Inflow Verified
              </span>
              <span className="truncate">Cash & Transfers</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Real Cash Collected</span>
            <button
              onClick={() => setActiveSection('payments')}
              className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
            >
              Ledger &rarr;
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </div>

        {/* 3. Total Outstanding Payments */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl transition-all duration-300 hover:border-rose-500/50 hover:shadow-rose-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-rose-400 uppercase">
              Total Outstanding Payments
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/15 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-rose-400 mono-num tracking-tight truncate">
              {formatNaira(totalOutstandingPayments)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center rounded-md bg-rose-500/10 px-1.5 py-0.5 font-semibold text-rose-400 border border-rose-500/20">
                {sales.filter(s => (s.outstandingBalance || 0) > 0).length + orders.filter(o => (o.outstandingBalance || 0) > 0).length} Pending
              </span>
              <span className="text-slate-400 truncate">
                {overdueDebtors.length} Overdue
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Receivables</span>
            <button
              onClick={() => setActiveSection('payments')}
              className="font-medium text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
            >
              Collect &rarr;
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 opacity-80" />
        </div>

        {/* 4. Total Expenses & Net Business Profit */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl transition-all duration-300 hover:border-rose-500/50 hover:shadow-rose-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-rose-300 uppercase">
              Total Expenses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/15 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-white mono-num tracking-tight truncate">
              {formatNaira(totalExpensesThisMonth)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-semibold text-[11px] border ${
                monthProfitability.netProfit >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                Profit: {formatNaira(monthProfitability.netProfit)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">October 2026</span>
            <button
              onClick={() => setActiveSection('expenses')}
              className="font-medium text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
            >
              Expenses &rarr;
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 opacity-80" />
        </div>

        {/* 4. Products in Stock */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Products in Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <Boxes className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-white mono-num tracking-tight">
              {totalProductsInStock} <span className="text-sm font-medium text-slate-400">Items</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-1.5 py-0.5 font-semibold text-cyan-400">
                {totalUnitsInStock} Units
              </span>
              <span className="text-slate-400 truncate">available</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Catalog</span>
            <button
              onClick={() => setActiveSection('inventory')}
              className="font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              Inventory &rarr;
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-80" />
        </div>

        {/* 5. Low-Stock Alerts */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
              Low-Stock Alerts
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mono-num tracking-tight flex items-center gap-2">
              {lowStockAlertsCount}{' '}
              <span className="text-sm font-medium text-slate-400">Products</span>
              {lowStockAlertsCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </div>
            <div className="mt-1 text-xs text-slate-400 truncate">
              {lowStockProducts.slice(0, 2).map((p) => `${p.name.split(' ')[0]} (${p.stock})`).join(', ') || 'Inventory healthy'}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium truncate">Needs Restock</span>
            <button
              onClick={() => openRestockPlanner()}
              className="font-medium text-amber-300 hover:text-amber-200 flex items-center gap-0.5"
            >
              Restock Matrix &rarr;
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500 opacity-80" />
        </div>
      </div>

      {/* AI MERCHANT COPILOT INSIGHT BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-[#0C1633] via-[#0B1A3A] to-[#0A1226] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  SmartMerchant AI Copilot Briefing
                </span>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                  Daily Recommendation
                </span>
              </div>
              <h3 className="mt-1 text-base sm:text-lg font-bold text-white">
                Protect weekend tech inventory: PS5 Slim (2 left) and Galaxy S25 Ultra (3 left) need reordering.
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Alhaji Musa Garba and Demola Williams have ₦1,000,000 in pending balances for MacBook & S25 Ultra orders. 
                Use AI-drafted polite WhatsApp reminders to recover payments without friction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                if (overdueDebtors[0]) {
                  setActiveWhatsAppModalDebtor(overdueDebtors[0]);
                } else {
                  setActiveSection('payments');
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Recover Debt via WhatsApp</span>
            </button>
            <button
              onClick={() => openAskAI()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-cyan-300 transition-colors"
            >
              <span>Ask AI Copilot</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: Sales Velocity & Payment Channels / Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Payment Distribution & Urgent Low Stock Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Profitability & Cost Control Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-emerald-400" />
                  <span>Business Profitability & Expense Control (October)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Accurate accounting: Revenue less COGS on sold units and operating overhead (no stock double-counting).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Log Expense</span>
                </button>
                <button
                  onClick={() => setActiveSection('expenses')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Ledger &rarr;
                </button>
              </div>
            </div>

            {/* Profit Waterfall Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-slate-800/80 bg-[#070B16]">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sales Turnover</span>
                <div className="text-sm sm:text-base font-bold text-white mono-num">
                  {formatNaira(monthProfitability.totalRevenue)}
                </div>
                <span className="text-[10px] text-slate-500">Gross turnover</span>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase block">COGS (Wholesale)</span>
                <div className="text-sm sm:text-base font-bold text-cyan-400 mono-num">
                  -{formatNaira(monthProfitability.cogs)}
                </div>
                <span className="text-[10px] text-cyan-500">Sold inventory cost</span>
              </div>

              <div>
                <span className="text-[10px] text-amber-400 font-semibold uppercase block">Operating (OPEX)</span>
                <div className="text-sm sm:text-base font-bold text-amber-400 mono-num">
                  -{formatNaira(monthProfitability.operatingExpenses)}
                </div>
                <span className="text-[10px] text-amber-500">Rent, power, staff, ads</span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Net Profit</span>
                <div className="text-sm sm:text-base font-extrabold text-emerald-400 mono-num">
                  {formatNaira(monthProfitability.netProfit)}
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {monthProfitability.netMarginPercent.toFixed(1)}% net margin
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  Inventory Capital Outlay: <strong className="text-slate-200">{formatNaira(monthProfitability.stockPurchasesExpenses)}</strong> (Asset on balance sheet)
                </span>
              </span>
              <button
                onClick={() => setActiveSection('expenses')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Cost breakdown &rarr;
              </button>
            </div>
          </div>

          {/* Payment Channels Today */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span>Payment Channels & Liquidity Today</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Instant breakdown between Bank Transfers (OPay/PalmPay), POS Terminals, and Cash.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                100% Real-time
              </span>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800/80 flex">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${transferPercent}%` }}
                  title={`Bank Transfers / OPay: ${transferPercent}%`}
                />
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${posPercent}%` }}
                  title={`Moniepoint POS: ${posPercent}%`}
                />
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${cashPercent}%` }}
                  title={`Counter Cash: ${cashPercent}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-blue-500 shrink-0"></span>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Transfers ({transferPercent}%)
                    </div>
                    <div className="text-slate-400 mono-num">
                      {formatNaira(paymentMethodTotals.transfers)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-cyan-400 shrink-0"></span>
                  <div>
                    <div className="font-semibold text-slate-200">POS Moniepoint ({posPercent}%)</div>
                    <div className="text-slate-400 mono-num">
                      {formatNaira(paymentMethodTotals.pos)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-emerald-400 shrink-0"></span>
                  <div>
                    <div className="font-semibold text-slate-200">Cash Counter ({cashPercent}%)</div>
                    <div className="text-slate-400 mono-num">
                      {formatNaira(paymentMethodTotals.cash)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts Action Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Low Stock Items Requiring Restock</h3>
              </div>
              <button
                onClick={() => setActiveSection('inventory')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View Full Inventory &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#070B16] p-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
                      {prod.category.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{prod.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>SKU: {prod.sku}</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-medium">Selling: {formatNaira(prod.sellingPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400">Current Stock</div>
                      <div className="text-sm font-bold text-rose-400">
                        {prod.stock} {prod.unit}{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          (Min {prod.minStockAlert})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveRestockProduct(prod)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restock</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Outstanding Debtors & Recent Sales */}
        <div className="space-y-6">
          {/* Debtor Action Box */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-rose-400" />
                <span>Overdue Debtors</span>
              </h3>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {overdueDebtors.length} Urgent
              </span>
            </div>

            <div className="space-y-3">
              {overdueDebtors.slice(0, 3).map((debtor) => (
                <div
                  key={debtor.id}
                  className="rounded-xl border border-slate-800 bg-[#070B16] p-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{debtor.customerName}</h4>
                      <p className="text-xs text-slate-400">{debtor.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-rose-400 mono-num">
                        {formatNaira(debtor.amountOwed)}
                      </div>
                      <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        {debtor.daysOverdue}d overdue
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 truncate">
                    For: {debtor.itemDescription}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {debtor.lastReminderSent
                        ? `Last reminded: ${debtor.lastReminderSent}`
                        : 'No reminder sent yet'}
                    </span>
                    <button
                      onClick={() => setActiveWhatsAppModalDebtor(debtor)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold transition-colors"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setActiveSection('payments')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View Complete Debtor Ledger ({debtors.length}) &rarr;
              </button>
            </div>
          </div>

          {/* Quick Recent Transactions */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-cyan-400" />
                <span>Recent Transactions</span>
              </h3>
              <button
                onClick={() => setActiveSection('sales')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                All Sales &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {sales.slice(0, 4).map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => setActiveReceipt(sale)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/60 bg-[#070B16] hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {sale.customerName || 'Walk-in Customer'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="uppercase text-cyan-400 font-medium">
                        {sale.paymentMethod.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(sale.timestamp)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white mono-num">
                      {formatNaira(sale.totalAmount)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {sale.receiptNo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
