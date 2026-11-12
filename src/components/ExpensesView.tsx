import React, { useState, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  TrendingDown,
  TrendingUp,
  DollarSign,
  PieChart,
  Boxes,
  Truck,
  Building,
  Zap,
  Users,
  Megaphone,
  Wrench,
  Wifi,
  MoreHorizontal,
  Edit2,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    isOpex: boolean;
  }
> = {
  'Stock purchases': {
    icon: Boxes,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    isOpex: false, // Capital Outlay on Inventory (COGS handles sales)
  },
  'Transportation and logistics': {
    icon: Truck,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    isOpex: true,
  },
  'Rent': {
    icon: Building,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    isOpex: true,
  },
  'Electricity and utilities': {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    isOpex: true,
  },
  'Salaries and wages': {
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    isOpex: true,
  },
  'Marketing and advertising': {
    icon: Megaphone,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    isOpex: true,
  },
  'Repairs and maintenance': {
    icon: Wrench,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    isOpex: true,
  },
  'Internet and subscriptions': {
    icon: Wifi,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    isOpex: true,
  },
  'Miscellaneous expenses': {
    icon: MoreHorizontal,
    color: 'text-slate-300',
    bg: 'bg-slate-700/20',
    border: 'border-slate-600/30',
    isOpex: true,
  },
};

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    getProfitabilitySummary,
    setIsExpenseModalOpen,
    setEditingExpense,
    setDeletingExpense,
    settings,
  } = useMerchant();

  // Period state: 'today' | 'week' | 'month' | 'all' | 'custom'
  const [selectedPeriod, setSelectedPeriod] = useState<
    'today' | 'week' | 'month' | 'all' | 'custom'
  >('month');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category'
  >('date-desc');

  // Profitability summary for active period
  const profitability = useMemo(() => {
    return getProfitabilitySummary(selectedPeriod, customStartDate, customEndDate);
  }, [getProfitabilitySummary, selectedPeriod, customStartDate, customEndDate]);

  // Filtered expenses based on period + search + category + payment method
  const filteredExpenses = useMemo(() => {
    const realTodayIso = new Date().toISOString().split('T')[0];
    const allExpDates = expenses.map((e) => (e.date || '').slice(0, 10)).filter(Boolean);
    const latestDate = allExpDates.length > 0 ? [...allExpDates].sort().pop()! : '2026-10-31';
    const todayStr = expenses.some((e) => (e.date || '').slice(0, 10) === realTodayIso) ? realTodayIso : latestDate;
    const monthPrefix = todayStr.slice(0, 7);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return expenses
      .filter((exp) => {
        // Date period filter
        const dateOnly = (exp.date || '').slice(0, 10);
        const itemDate = new Date(exp.date);

        if (selectedPeriod === 'today') {
          if (dateOnly !== todayStr) return false;
        } else if (selectedPeriod === 'week') {
          if (itemDate < sevenDaysAgo || itemDate > now) return false;
        } else if (selectedPeriod === 'month') {
          if (!dateOnly.startsWith(monthPrefix)) return false;
        } else if (selectedPeriod === 'custom') {
          if (customStartDate && dateOnly < customStartDate) return false;
          if (customEndDate && dateOnly > customEndDate) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
          return false;
        }

        // Payment method filter
        if (selectedMethod !== 'all' && exp.paymentMethod !== selectedMethod) {
          return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchDesc = exp.description.toLowerCase().includes(q);
          const matchCat = exp.category.toLowerCase().includes(q);
          const matchVendor = (exp.recipientVendor || '').toLowerCase().includes(q);
          const matchNotes = (exp.notes || '').toLowerCase().includes(q);
          const matchRef = (exp.receiptRef || '').toLowerCase().includes(q);
          if (!matchDesc && !matchCat && !matchVendor && !matchNotes && !matchRef) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // date-desc
      });
  }, [
    expenses,
    selectedPeriod,
    customStartDate,
    customEndDate,
    selectedCategory,
    selectedMethod,
    searchTerm,
    sortBy,
  ]);

  // Category breakdown calculation for filtered items (or current period)
  const categoryBreakdown = useMemo(() => {
    const map: Record<ExpenseCategory, { total: number; count: number }> = {
      'Stock purchases': { total: 0, count: 0 },
      'Transportation and logistics': { total: 0, count: 0 },
      Rent: { total: 0, count: 0 },
      'Electricity and utilities': { total: 0, count: 0 },
      'Salaries and wages': { total: 0, count: 0 },
      'Marketing and advertising': { total: 0, count: 0 },
      'Repairs and maintenance': { total: 0, count: 0 },
      'Internet and subscriptions': { total: 0, count: 0 },
      'Miscellaneous expenses': { total: 0, count: 0 },
    };

    let totalSum = 0;
    filteredExpenses.forEach((e) => {
      if (map[e.category]) {
        map[e.category].total += e.amount;
        map[e.category].count += 1;
        totalSum += e.amount;
      }
    });

    const categories = Object.keys(map) as ExpenseCategory[];
    return categories
      .map((cat) => ({
        category: cat,
        total: map[cat].total,
        count: map[cat].count,
        percent: totalSum > 0 ? (map[cat].total / totalSum) * 100 : 0,
        config: CATEGORY_CONFIG[cat],
      }))
      .filter((item) => item.count > 0 || selectedCategory === item.category)
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses, selectedCategory]);

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'opay':
        return 'OPay Transfer';
      case 'moniepoint':
        return 'Moniepoint POS';
      case 'palmpay':
        return 'PalmPay';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash Counter';
      case 'credit':
        return 'Credit Payout';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Expenses & Cost Intelligence
            </h1>
            <span className="rounded bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
              {expenses.length} Records
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Track operating expenses, inventory capital restocks, and calculate accurate business net profit for {settings.storeName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Period Selection Navigation Strip */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-2 hidden sm:inline">
            Summary Period:
          </span>

          <button
            onClick={() => setSelectedPeriod('today')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              selectedPeriod === 'today'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            Daily (Today)
          </button>

          <button
            onClick={() => setSelectedPeriod('week')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              selectedPeriod === 'week'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            Weekly (Last 7d)
          </button>

          <button
            onClick={() => setSelectedPeriod('month')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              selectedPeriod === 'month'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            Monthly (October 2026)
          </button>

          <button
            onClick={() => setSelectedPeriod('all')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              selectedPeriod === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            All-Time
          </button>

          <button
            onClick={() => setSelectedPeriod('custom')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedPeriod === 'custom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Custom Dates</span>
          </button>
        </div>

        {/* Custom Date Pickers (if custom selected) */}
        {selectedPeriod === 'custom' && (
          <div className="flex items-center gap-2 text-xs animate-in fade-in duration-150">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#070B16] px-2.5 py-1 text-xs text-white focus:outline-none"
            />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#070B16] px-2.5 py-1 text-xs text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 4 CORE FINANCIAL PROFITABILITY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Period Expenses */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white mono-num">
              {formatNaira(profitability.totalExpenses)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <span>{profitability.periodLabel}</span>
              <span className="text-slate-300 font-medium">{filteredExpenses.length} entries</span>
            </div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 opacity-80" />
        </div>

        {/* KPI 2: Operating Expenses (OPEX) */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Operating Expenses (OPEX)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mono-num">
              {formatNaira(profitability.operatingExpenses)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Rent, Utilities, Staff, Ads & Logistics
            </div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-80" />
        </div>

        {/* KPI 3: Stock Capital Purchases */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Stock Purchases (Asset)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mono-num">
              {formatNaira(profitability.stockPurchasesExpenses)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Inventory asset (accounted via COGS)
            </div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" />
        </div>

        {/* KPI 4: Net Operating Profit */}
        <div className={`rounded-2xl border p-5 shadow-lg relative overflow-hidden group transition-all ${
          profitability.netProfit >= 0
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-rose-500/40 bg-rose-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              profitability.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              Net Business Profit
            </span>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              profitability.netProfit >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-extrabold mono-num ${
              profitability.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatNaira(profitability.netProfit)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">Net Margin:</span>
              <span className={`font-bold ${
                profitability.netMarginPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {profitability.netMarginPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            profitability.netProfit >= 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-rose-500 to-red-600'
          }`} />
        </div>
      </div>

      {/* ACCURATE BUSINESS PROFITABILITY AUDIT BANNER (Requirement 9) */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-[#0C1633] via-[#0B1A3A] to-[#0A1226] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Accounting Profitability & Cash Flow Engine
              </span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                Anti-Double Counting Verified
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Formula: Gross Profit (Revenue - COGS) - Operating Expenses (OPEX)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When gadgets are sold, their wholesale wholesale cost is captured in <strong>Cost of Goods Sold (COGS)</strong>. Stock purchases are capital investments in inventory and are excluded from Operating Expenses to prevent deducting stock twice.
            </p>
          </div>

          {/* Transparent Profit Waterfall Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 bg-[#070B16]/80 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">1. Revenue</span>
              <span className="text-sm font-bold text-white mono-num">
                {formatNaira(profitability.totalRevenue)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">2. Less COGS</span>
              <span className="text-sm font-bold text-cyan-400 mono-num">
                -{formatNaira(profitability.cogs)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">3. Less OPEX</span>
              <span className="text-sm font-bold text-amber-400 mono-num">
                -{formatNaira(profitability.operatingExpenses)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase block">4. Net Profit</span>
              <span className="text-sm font-extrabold text-emerald-400 mono-num">
                ={formatNaira(profitability.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN SECTION (Requirement 7) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/60 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Expense Category Breakdown & Allocation
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Click category to filter
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryBreakdown.map((item) => {
            const Icon = item.config.icon;
            const isSelected = selectedCategory === item.category;

            return (
              <div
                key={item.category}
                onClick={() =>
                  setSelectedCategory(isSelected ? 'all' : item.category)
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? `${item.config.border} ${item.config.bg} shadow-md`
                    : 'border-slate-800/80 bg-[#070B16] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.config.bg} ${item.config.color} border ${item.config.border}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white leading-tight">
                        {item.category}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.config.isOpex ? 'Operating Cost' : 'Asset Outlay'} • {item.count} items
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-white mono-num">
                    {item.percent.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.config.color.includes('cyan')
                        ? '#06b6d4'
                        : item.config.color.includes('emerald')
                        ? '#10b981'
                        : item.config.color.includes('amber')
                        ? '#f59e0b'
                        : item.config.color.includes('indigo')
                        ? '#818cf8'
                        : item.config.color.includes('yellow')
                        ? '#eab308'
                        : item.config.color.includes('pink')
                        ? '#ec4899'
                        : item.config.color.includes('orange')
                        ? '#f97316'
                        : '#38bdf8',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Spent:</span>
                  <span className="font-bold text-slate-200 mono-num">
                    {formatNaira(item.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEARCH, FILTER, AND SORTING CONTROLS */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/60 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses by description, vendor, token ref, or notes..."
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All 9 Categories</option>
              <option value="Stock purchases">Stock purchases</option>
              <option value="Transportation and logistics">Transportation and logistics</option>
              <option value="Rent">Rent</option>
              <option value="Electricity and utilities">Electricity and utilities</option>
              <option value="Salaries and wages">Salaries and wages</option>
              <option value="Marketing and advertising">Marketing and advertising</option>
              <option value="Repairs and maintenance">Repairs and maintenance</option>
              <option value="Internet and subscriptions">Internet and subscriptions</option>
              <option value="Miscellaneous expenses">Miscellaneous expenses</option>
            </select>

            {/* Payment Channel Dropdown */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Payment Channels</option>
              <option value="opay">OPay</option>
              <option value="moniepoint">Moniepoint POS</option>
              <option value="palmpay">PalmPay</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash Counter</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount (₦)</option>
              <option value="amount-asc">Lowest Amount (₦)</option>
              <option value="category">Category (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* EXPENSE LEDGER TABLE / CARD LIST */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070B16]/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Date & Reference</th>
                <th className="px-5 py-3.5">Description & Vendor</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Payment Channel</th>
                <th className="px-5 py-3.5 text-right">Amount (₦)</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredExpenses.map((exp) => {
                const conf = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG['Miscellaneous expenses'];
                const Icon = conf.icon;

                return (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Date & Ref */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white mono-num">
                        {exp.date}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {exp.receiptRef || formatTimeAgo(exp.createdAt || exp.date)}
                      </div>
                    </td>

                    {/* Description & Vendor */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-white max-w-sm">
                        {exp.description}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {exp.recipientVendor && (
                          <span className="text-slate-300 font-medium">
                            To: {exp.recipientVendor}
                          </span>
                        )}
                        {exp.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate italic max-w-xs">{exp.notes}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Category Pill */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border ${conf.bg} ${conf.color} ${conf.border}`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{exp.category}</span>
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                        {getMethodBadge(exp.paymentMethod)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="font-extrabold text-white text-sm mono-num">
                        {formatNaira(exp.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingExpense(exp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeletingExpense(exp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Receipt className="h-10 w-10 mx-auto text-slate-500 mb-2 opacity-60" />
            <h4 className="text-sm font-semibold text-white">No expenses found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchTerm || selectedCategory !== 'all' || selectedMethod !== 'all'
                ? 'Try adjusting your search filters or period selector.'
                : 'Click "Record Expense" to log your first store operating cost or stock purchase.'}
            </p>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              + Record Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
