import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  Receipt,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';
import { PaymentMethod, PaymentStatus, Sale } from '../types';

export const SalesView: React.FC = () => {
  const {
    sales,
    totalSalesToday,
    totalPaymentsReceived,
    totalOutstandingPayments,
    setIsNewSaleOpen,
    setActiveReceipt,
    openPaymentModal,
  } = useMerchant();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod =
      selectedMethod === 'all' || sale.paymentMethod === selectedMethod;

    const currentStatus: PaymentStatus =
      sale.paymentStatus ||
      ((sale.outstandingBalance || 0) === 0
        ? 'paid'
        : (sale.amountPaid || 0) === 0
        ? 'unpaid'
        : 'partial');

    const matchesStatus =
      selectedStatus === 'all' || currentStatus === selectedStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'opay':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <Smartphone className="h-3 w-3" />
            OPay
          </span>
        );
      case 'moniepoint':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-blue-500/20">
            <CreditCard className="h-3 w-3" />
            Moniepoint POS
          </span>
        );
      case 'palmpay':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
            <Smartphone className="h-3 w-3" />
            PalmPay
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
            <Building className="h-3 w-3" />
            Bank Transfer
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Banknote className="h-3 w-3" />
            Cash
          </span>
        );
      case 'credit':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            Credit (Debt)
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{method}</span>;
    }
  };

  const getPaymentStatusBadge = (sale: Sale) => {
    const status: PaymentStatus =
      sale.paymentStatus ||
      ((sale.outstandingBalance || 0) === 0
        ? 'paid'
        : (sale.amountPaid || 0) === 0
        ? 'unpaid'
        : 'partial');

    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Paid in Full
          </span>
        );
      case 'partial':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Clock className="h-3 w-3" />
              Partially Paid
            </span>
            <span className="text-[11px] text-rose-400 font-medium">
              Bal: {formatNaira(sale.outstandingBalance || 0)}
            </span>
          </div>
        );
      case 'unpaid':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
              <AlertCircle className="h-3 w-3" />
              Unpaid (Credit)
            </span>
            <span className="text-[11px] text-rose-400 font-medium">
              Bal: {formatNaira(sale.outstandingBalance || sale.totalAmount)}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sales & POS Terminal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Record customer sales, track paid vs outstanding balances in Naira (₦), and collect installments.
          </p>
        </div>

        <button
          onClick={() => setIsNewSaleOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Sale (POS)</span>
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
          <span className="text-xs text-slate-400 font-medium uppercase">Gross Sales Value</span>
          <div className="text-2xl font-bold text-white mono-num mt-1">
            {formatNaira(totalSalesToday)}
          </div>
          <span className="text-xs text-slate-400">{sales.length} transactions recorded</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
          <span className="text-xs text-emerald-400 font-medium uppercase">Total Payments Collected</span>
          <div className="text-2xl font-bold text-emerald-400 mono-num mt-1">
            {formatNaira(totalPaymentsReceived)}
          </div>
          <span className="text-xs text-emerald-400/80 font-medium">Inflow verified in Naira</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
          <span className="text-xs text-rose-400 font-medium uppercase">Total Outstanding Balance</span>
          <div className="text-2xl font-bold text-rose-400 mono-num mt-1">
            {formatNaira(totalOutstandingPayments)}
          </div>
          <span className="text-xs text-slate-400">
            {sales.filter((s) => (s.outstandingBalance || 0) > 0).length} sales with pending balance
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, receipt # or item..."
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Payment Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Sales' },
              { id: 'paid', label: 'Paid in Full' },
              { id: 'partial', label: 'Partially Paid' },
              { id: 'unpaid', label: 'Unpaid / Credit' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium shrink-0 transition-colors ${
                  selectedStatus === st.id
                    ? st.id === 'paid'
                      ? 'bg-emerald-600 text-white'
                      : st.id === 'partial'
                      ? 'bg-amber-600 text-white'
                      : st.id === 'unpaid'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Payment Channel Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              Method:
            </span>
            {['all', 'moniepoint', 'opay', 'palmpay', 'bank_transfer', 'cash', 'credit'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`rounded-lg px-2 py-1 text-xs font-medium capitalize shrink-0 transition-colors ${
                  selectedMethod === m
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#070B16] text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Receipt #</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items Summary</th>
                <th className="px-5 py-4">Channel</th>
                <th className="px-5 py-4">Payment Status</th>
                <th className="px-5 py-4 text-right">Total (₦)</th>
                <th className="px-5 py-4 text-right">Paid / Balance</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.map((sale) => {
                const paid = sale.amountPaid !== undefined ? sale.amountPaid : (sale.paymentMethod === 'credit' ? 0 : sale.totalAmount);
                const balance = sale.outstandingBalance !== undefined ? sale.outstandingBalance : Math.max(0, sale.totalAmount - paid);

                return (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-semibold text-white mono-num">{sale.receiptNo}</span>
                      <div className="text-[11px] text-slate-400">{formatTimeAgo(sale.timestamp)}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{sale.customerName || 'Walk-in Customer'}</div>
                      <div className="text-xs text-slate-400">{sale.customerPhone || 'Counter Sale'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-xs truncate text-xs text-slate-300">
                        {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                      {sale.discount > 0 && (
                        <span className="text-[11px] text-emerald-400">
                          Discount: -{formatNaira(sale.discount)}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getMethodBadge(sale.paymentMethod)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(sale)}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="font-bold text-white mono-num text-sm sm:text-base">
                        {formatNaira(sale.totalAmount)}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap text-xs">
                      <div className="font-semibold text-emerald-400 mono-num">
                        Paid: {formatNaira(paid)}
                      </div>
                      {balance > 0 ? (
                        <div className="font-bold text-rose-400 mono-num">
                          Owed: {formatNaira(balance)}
                        </div>
                      ) : (
                        <div className="text-slate-400">Cleared</div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveReceipt(sale)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-cyan-300 transition-colors"
                          title="View Digital Receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>Receipt</span>
                        </button>

                        {balance > 0 && (
                          <button
                            onClick={() =>
                              openPaymentModal({
                                type: 'sale',
                                id: sale.id,
                                referenceNo: sale.receiptNo,
                                customerName: sale.customerName || 'Customer',
                                customerPhone: sale.customerPhone,
                                totalAmount: sale.totalAmount,
                                amountPaid: paid,
                                outstandingBalance: balance,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition-colors"
                            title="Record Additional Payment"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Record Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No transactions found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
