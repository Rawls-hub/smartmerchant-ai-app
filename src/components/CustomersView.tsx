import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Receipt,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';
import { Customer, CustomerTag } from '../types';

export const CustomersView: React.FC = () => {
  const {
    customers,
    totalCustomersCount,
    newCustomersCount,
    returningCustomersCount,
    customersWithOutstandingCount,
    totalCustomerOutstandingBalance,
    getCustomerStats,
    setIsCustomerModalOpen,
    setActiveDetailCustomer,
    setEditingCustomer,
    setDeletingCustomer,
    openPaymentModal,
    settings,
  } = useMerchant();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'outstanding' | 'returning' | 'vip' | 'corporate' | 'wholesale'
  >('all');
  const [sortBy, setSortBy] = useState<
    'spent-desc' | 'balance-desc' | 'orders-desc' | 'recent' | 'name'
  >('balance-desc');

  // Compute stats for each customer once for sorting & filtering
  const customersWithStats = useMemo(() => {
    return customers.map((c) => ({
      customer: c,
      stats: getCustomerStats(c),
    }));
  }, [customers, getCustomerStats]);

  // Counts for filter pills
  const counts = useMemo(() => {
    let vip = 0;
    let corporate = 0;
    let wholesale = 0;

    customers.forEach((c) => {
      if (c.tag === 'VIP') vip++;
      else if (c.tag === 'Corporate') corporate++;
      else if (c.tag === 'Wholesale') wholesale++;
    });

    return {
      all: customers.length,
      outstanding: customersWithOutstandingCount,
      returning: returningCustomersCount,
      vip,
      corporate,
      wholesale,
    };
  }, [customers, customersWithOutstandingCount, returningCustomersCount]);

  // Filter & Search logic
  const filteredCustomers = useMemo(() => {
    return customersWithStats
      .filter(({ customer, stats }) => {
        // Text search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = customer.fullName.toLowerCase().includes(q);
          const matchPhone = customer.phone.toLowerCase().includes(q);
          const matchEmail = (customer.email || '').toLowerCase().includes(q);
          const matchCity = (customer.city || '').toLowerCase().includes(q);
          const matchAddress = (customer.address || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEmail && !matchCity && !matchAddress) {
            return false;
          }
        }

        // Pill filter
        if (filterType === 'outstanding') return stats.totalOutstanding > 0;
        if (filterType === 'returning') return stats.isReturning;
        if (filterType === 'vip') return customer.tag === 'VIP';
        if (filterType === 'corporate') return customer.tag === 'Corporate';
        if (filterType === 'wholesale') return customer.tag === 'Wholesale';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'balance-desc') return b.stats.totalOutstanding - a.stats.totalOutstanding;
        if (sortBy === 'spent-desc') return b.stats.totalSpent - a.stats.totalSpent;
        if (sortBy === 'orders-desc') return b.stats.totalOrdersCount - a.stats.totalOrdersCount;
        if (sortBy === 'name') return a.customer.fullName.localeCompare(b.customer.fullName);
        if (sortBy === 'recent') {
          return new Date(b.customer.createdAt).getTime() - new Date(a.customer.createdAt).getTime();
        }
        return 0;
      });
  }, [customersWithStats, searchTerm, filterType, sortBy]);

  const getTagBadge = (tag?: CustomerTag) => {
    switch (tag) {
      case 'VIP':
        return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
      case 'Corporate':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'Wholesale':
        return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700/80';
    }
  };

  const handlePayFirstOutstanding = (customer: Customer, stats: ReturnType<typeof getCustomerStats>) => {
    const targetItem = stats.purchases.find((p) => p.outstandingBalance > 0);
    if (targetItem) {
      openPaymentModal({
        type: targetItem.type,
        id: targetItem.id,
        referenceNo: targetItem.referenceNo,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        totalAmount: targetItem.totalAmount,
        amountPaid: targetItem.amountPaid,
        outstandingBalance: targetItem.outstandingBalance,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Customer Management & CRM
            </h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-blue-500/30">
              {totalCustomersCount} Active
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Client profiles, purchase histories, payment tracking, and outstanding balances for {settings.storeName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Dashboard KPI Cards (4 metrics required) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Customers */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Customers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white mono-num">
              {totalCustomersCount}
            </span>
            <span className="text-xs text-slate-400">registered</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Computer Village & Nationwide buyers</span>
          </div>
        </div>

        {/* KPI 2: New Customers */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              New Customers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 mono-num">
              {newCustomersCount}
            </span>
            <span className="text-xs text-slate-400">first-time</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>1 purchase recorded</span>
          </div>
        </div>

        {/* KPI 3: Returning Customers */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Returning Customers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 mono-num">
              {returningCustomersCount}
            </span>
            <span className="text-xs text-slate-400">loyal buyers</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>2+ gadget purchases</span>
          </div>
        </div>

        {/* KPI 4: Customers with Outstanding Balance */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Outstanding Balances
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-400 mono-num">
              {formatNaira(totalCustomerOutstandingBalance)}
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-300/80 flex items-center justify-between">
            <span>{customersWithOutstandingCount} customers owe</span>
            <span className="font-semibold text-rose-400">Immediate recovery</span>
          </div>
        </div>
      </div>

      {/* Search, Filter Pills & Sort Bar */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/60 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers by name, phone (e.g. 0802), email, or address..."
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

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="balance-desc">Highest Outstanding Balance</option>
              <option value="spent-desc">Highest Total Spent</option>
              <option value="orders-desc">Most Orders Count</option>
              <option value="recent">Recently Added</option>
              <option value="name">Customer Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Customers ({counts.all})
          </button>

          <button
            onClick={() => setFilterType('outstanding')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              filterType === 'outstanding'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>With Balance Due ({counts.outstanding})</span>
          </button>

          <button
            onClick={() => setFilterType('returning')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              filterType === 'returning'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Repeat Buyers ({counts.returning})</span>
          </button>

          <button
            onClick={() => setFilterType('vip')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              filterType === 'vip'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            VIP Clients ({counts.vip})
          </button>

          <button
            onClick={() => setFilterType('corporate')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              filterType === 'corporate'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Corporate ({counts.corporate})
          </button>

          <button
            onClick={() => setFilterType('wholesale')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
              filterType === 'wholesale'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Wholesale ({counts.wholesale})
          </button>
        </div>
      </div>

      {/* Customer Cards Grid / List */}
      <div className="space-y-3">
        {filteredCustomers.map(({ customer, stats }) => {
          const initials = customer.fullName
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          const hasBalance = stats.totalOutstanding > 0;

          return (
            <div
              key={customer.id}
              className={`rounded-2xl border transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                hasBalance
                  ? 'border-rose-500/30 bg-[#0B1020] hover:border-rose-500/50'
                  : 'border-slate-800/80 bg-[#0B1226]/80 hover:border-slate-700'
              }`}
            >
              {/* Left Profile Identity */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div
                  onClick={() => setActiveDetailCustomer(customer)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white font-extrabold text-sm shadow-md cursor-pointer hover:scale-105 transition-transform"
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveDetailCustomer(customer)}
                      className="text-base font-bold text-white hover:text-cyan-400 transition-colors text-left truncate"
                    >
                      {customer.fullName}
                    </button>
                    {customer.tag && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTagBadge(customer.tag)}`}>
                        {customer.tag}
                      </span>
                    )}
                    {stats.isReturning && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                        {stats.totalOrdersCount} purchases
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-1 font-mono text-cyan-400 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </a>

                    {customer.email && (
                      <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-xs text-slate-400">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <span className="truncate">{customer.email}</span>
                      </span>
                    )}

                    {customer.city && (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{customer.city}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Financial Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-3 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Total Spent
                  </span>
                  <div className="text-sm font-bold text-white mono-num">
                    {formatNaira(stats.totalSpent)}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {stats.totalOrdersCount} {stats.totalOrdersCount === 1 ? 'order' : 'orders'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                    Amount Paid
                  </span>
                  <div className="text-sm font-bold text-emerald-400 mono-num">
                    {formatNaira(stats.totalPaid)}
                  </div>
                  <span className="text-[10px] text-slate-500">Cleared Inflow</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    hasBalance ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    Outstanding
                  </span>
                  <div className={`text-sm font-extrabold mono-num ${
                    hasBalance ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {hasBalance ? formatNaira(stats.totalOutstanding) : '₦0'}
                  </div>
                  <span className={`text-[10px] ${
                    hasBalance ? 'text-rose-300 font-medium' : 'text-emerald-400'
                  }`}>
                    {hasBalance ? `${stats.unpaidCount + stats.partialCount} unpaid` : 'All cleared'}
                  </span>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
                <button
                  onClick={() => setActiveDetailCustomer(customer)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 px-3.5 py-2 text-xs font-semibold transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Profile & History</span>
                </button>

                {hasBalance && (
                  <button
                    onClick={() => handlePayFirstOutstanding(customer, stats)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-semibold shadow-md shadow-emerald-600/30 transition-colors"
                    title="Record Payment"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Record Pay</span>
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCustomer(customer)}
                    className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Customer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setDeletingCustomer(customer)}
                    className="rounded-xl p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="rounded-2xl border border-slate-800/80 bg-[#0B1226]/60 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/50 text-slate-400 mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No customers found</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search criteria or resetting the filter pills.'
                : 'Start by adding your first customer to build your client records and track repeat purchases.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {(searchTerm || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400"
              >
                + Add Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
