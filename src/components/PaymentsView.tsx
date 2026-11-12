import React, { useState } from 'react';
import {
  CreditCard,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Building,
  Smartphone,
  ShieldCheck,
  Search,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Receipt,
  ShoppingBag,
  ExternalLink,
  Banknote,
  Users,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';
import { Debtor, BankPaymentRecord, PaymentMethod, PaymentTransactionRecord } from '../types';

export const PaymentsView: React.FC = () => {
  const {
    sales,
    orders,
    debtors,
    customers,
    paymentTransactions,
    totalPaymentsReceived,
    totalOutstandingPayments,
    bankPayments,
    recordDebtPayment,
    addDebtor,
    verifyBankPayment,
    setActiveWhatsAppModalDebtor,
    openPaymentModal,
    setActiveDetailCustomer,
    setActiveSection,
    settings,
  } = useMerchant();

  const [activeTab, setActiveTab] = useState<'receivables' | 'transactions' | 'bank_verifier'>('receivables');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [isAddDebtorModalOpen, setIsAddDebtorModalOpen] = useState(false);

  // New debtor form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [itemsDesc, setItemsDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const overdueDebtors = debtors.filter((d) => d.daysOverdue > 0);
  const overdueTotal = overdueDebtors.reduce((acc, d) => acc + d.amountOwed, 0);

  // Compile unified list of outstanding receivables from sales and orders
  const salesReceivables = sales
    .filter((s) => (s.outstandingBalance || 0) > 0)
    .map((s) => ({
      id: s.id,
      type: 'sale' as const,
      referenceNo: s.receiptNo,
      customerName: s.customerName || 'Walk-in Customer',
      customerPhone: s.customerPhone,
      itemDescription: s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
      totalAmount: s.totalAmount,
      amountPaid: s.amountPaid || 0,
      outstandingBalance: s.outstandingBalance,
      timestamp: s.timestamp,
    }));

  const ordersReceivables = orders
    .filter((o) => (o.outstandingBalance || 0) > 0)
    .map((o) => ({
      id: o.id,
      type: 'order' as const,
      referenceNo: o.orderNo,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      itemDescription: o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
      totalAmount: o.totalAmount,
      amountPaid: o.amountPaid || 0,
      outstandingBalance: o.outstandingBalance,
      timestamp: o.createdAt,
    }));

  const standaloneDebtorsReceivables = debtors
    .filter((d) => !d.saleId && d.amountOwed > 0)
    .map((d) => ({
      id: d.id,
      type: 'debt' as const,
      referenceNo: `DEBT-${d.id.replace('debt-', '').slice(-4).toUpperCase()}`,
      customerName: d.customerName,
      customerPhone: d.phone,
      itemDescription: d.itemDescription,
      totalAmount: d.initialAmount || d.amountOwed,
      amountPaid: Math.max(0, (d.initialAmount || d.amountOwed) - d.amountOwed),
      outstandingBalance: d.amountOwed,
      timestamp: d.dueDate ? `${d.dueDate}T09:00:00` : new Date().toISOString(),
    }));

  const allReceivables = [...salesReceivables, ...ordersReceivables, ...standaloneDebtorsReceivables];

  const filteredReceivables = allReceivables.filter((r) =>
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = paymentTransactions.filter((tx) => {
    const matchesSearch =
      tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.targetReferenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod =
      selectedMethod === 'all' || tx.paymentMethod === selectedMethod;

    return matchesSearch && matchesMethod;
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
            Credit
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{method}</span>;
    }
  };

  const getWhatsAppReminderUrl = (rec: {
    customerName: string;
    customerPhone?: string;
    referenceNo: string;
    outstandingBalance: number;
    itemDescription: string;
  }) => {
    const cleanPhone = (rec.customerPhone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${rec.customerName}! 🛍️ This is a polite balance reminder from ${settings.storeName}.\n\nReference: ${rec.referenceNo}\nItems: ${rec.itemDescription}\nPending Balance: ${formatNaira(rec.outstandingBalance)}\n\nKindly make payment to our official account:\nBank: ${settings.bankDetails.bankName}\nAccount: ${settings.bankDetails.accountNumber}\nName: ${settings.bankDetails.accountName}\n\nThank you for choosing ${settings.storeName}!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const handleCreateDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num) return;

    addDebtor({
      customerName: name,
      phone,
      amountOwed: num,
      initialAmount: num,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      daysOverdue: 0,
      itemDescription: itemsDesc,
      notes,
    });

    setIsAddDebtorModalOpen(false);
    setName('');
    setPhone('');
    setAmount('');
    setItemsDesc('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payments & Receivables Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track payments received, manage outstanding balances, record installments, and verify bank transfers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection('customers')}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
          >
            <Users className="h-4 w-4 text-cyan-400" />
            <span>Customers CRM</span>
          </button>
          <button
            onClick={() => setIsAddDebtorModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Credit Record</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold uppercase">
              Total Payments Received
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mono-num mt-2">
            {formatNaira(totalPaymentsReceived)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {paymentTransactions.length} verified payment entries
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-semibold uppercase">
              Total Outstanding Receivables
            </span>
            <CreditCard className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 mono-num mt-2">
            {formatNaira(totalOutstandingPayments)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {allReceivables.length} sales and orders awaiting balance
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-semibold uppercase">
              Urgent Overdue Balance
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mono-num mt-2">
            {formatNaira(overdueTotal)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {overdueDebtors.length} customers past agreed settlement date
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('receivables')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'receivables'
              ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Outstanding Receivables ({allReceivables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'transactions'
              ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Payment Inflow Ledger ({paymentTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bank_verifier')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'bank_verifier'
              ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Bank Transfer Verifier</span>
        </button>
      </div>

      {/* TAB 1: OUTSTANDING RECEIVABLES */}
      {activeTab === 'receivables' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search debtor name, reference or item..."
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 self-end sm:self-auto">
              Showing {filteredReceivables.length} pending balances
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#070B16] text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Items / Note</th>
                    <th className="px-5 py-4 text-right">Total Bill (₦)</th>
                    <th className="px-5 py-4 text-right">Paid (₦)</th>
                    <th className="px-5 py-4 text-right">Balance Due (₦)</th>
                    <th className="px-5 py-4 text-center">Collection Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredReceivables.map((rec) => (
                    <tr key={`${rec.type}-${rec.id}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-cyan-400 mono-num">
                          {rec.referenceNo}
                        </span>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {rec.type} • {formatTimeAgo(rec.timestamp)}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {(() => {
                          const matched = customers.find((c) => {
                            if (rec.customerPhone && c.phone) {
                              const p1 = rec.customerPhone.replace(/[^0-9]/g, '');
                              const p2 = c.phone.replace(/[^0-9]/g, '');
                              if (p1.endsWith(p2.slice(-8)) || p2.endsWith(p1.slice(-8))) return true;
                            }
                            return c.fullName.toLowerCase() === rec.customerName.toLowerCase();
                          });

                          return matched ? (
                            <button
                              type="button"
                              onClick={() => setActiveDetailCustomer(matched)}
                              className="text-left group cursor-pointer"
                              title="View Customer Profile & Full Purchase Ledger"
                            >
                              <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                <span>{rec.customerName}</span>
                                <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 opacity-70" />
                              </div>
                              <div className="text-xs text-slate-400 mono-num">
                                {rec.customerPhone || 'Counter sale'}
                              </div>
                            </button>
                          ) : (
                            <div>
                              <div className="font-medium text-white">{rec.customerName}</div>
                              <div className="text-xs text-slate-400 mono-num">
                                {rec.customerPhone || 'Counter sale'}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-xs truncate text-xs text-slate-300">
                          {rec.itemDescription}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap mono-num text-white">
                        {formatNaira(rec.totalAmount)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap mono-num text-emerald-400 font-medium">
                        {formatNaira(rec.amountPaid)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap mono-num font-bold text-rose-400">
                        {formatNaira(rec.outstandingBalance)}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              openPaymentModal({
                                type: rec.type,
                                id: rec.id,
                                referenceNo: rec.referenceNo,
                                customerName: rec.customerName,
                                customerPhone: rec.customerPhone,
                                totalAmount: rec.totalAmount,
                                amountPaid: rec.amountPaid,
                                outstandingBalance: rec.outstandingBalance,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 transition-colors"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Record Pay</span>
                          </button>

                          {rec.customerPhone && (
                            <a
                              href={getWhatsAppReminderUrl(rec)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors"
                              title="Send WhatsApp Reminder"
                            >
                              <PhoneCall className="h-3 w-3 text-emerald-400" />
                              <span>Remind</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReceivables.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                🎉 No outstanding receivables found! All customer accounts are fully settled.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT INFLOW LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transaction ref, customer or receipt..."
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="h-3 w-3" />
                Channel:
              </span>
              {['all', 'moniepoint', 'opay', 'palmpay', 'bank_transfer', 'cash'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize shrink-0 transition-colors ${
                    selectedMethod === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#070B16] text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Linked Transaction</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Payment Channel</th>
                    <th className="px-5 py-4 text-right">Amount Received (₦)</th>
                    <th className="px-5 py-4">Date / Time</th>
                    <th className="px-5 py-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-white mono-num">{tx.reference}</span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/20 text-xs font-medium mono-num">
                          {tx.targetType === 'sale' ? 'Sale' : tx.targetType === 'order' ? 'Order' : 'Debt'} #{tx.targetReferenceNo}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{tx.customerName}</div>
                        {tx.customerPhone && (
                          <div className="text-xs text-slate-400">{tx.customerPhone}</div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getMethodBadge(tx.paymentMethod)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="font-extrabold text-emerald-400 mono-num text-base">
                          {formatNaira(tx.amount)}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatTimeAgo(tx.timestamp)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-300 max-w-xs truncate">
                        {tx.note || 'Settlement logged'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                No payment entries found matching your criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BANK TRANSFER & POS VERIFIER */}
      {activeTab === 'bank_verifier' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-500/30 bg-[#0A1226] p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Real-time Anti-Fake Alert Verification Terminal
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Protect Rawls & Hub from fake SMS alerts and unauthorized transfer reversals. Verify incoming Moniepoint POS swipes, OPay instant transfers, and GTBank NIP credits with verified transaction references.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#070B16] text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Bank / Channel</th>
                    <th className="px-5 py-4">Sender Narration</th>
                    <th className="px-5 py-4">Transaction Reference</th>
                    <th className="px-5 py-4 text-right">Amount (₦)</th>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4 text-center">Security Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bankPayments.map((bp) => (
                    <tr key={bp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{bp.bankName}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{bp.senderName}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{bp.narration}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap mono-num text-xs text-cyan-300">
                        {bp.reference}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap mono-num font-bold text-emerald-400">
                        {formatNaira(bp.amount)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatTimeAgo(bp.timestamp)}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {bp.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Inflow
                          </span>
                        ) : (
                          <button
                            onClick={() => verifyBankPayment(bp.id)}
                            className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold transition-colors"
                          >
                            Verify Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Debtor Modal */}
      {isAddDebtorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B1124] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Record Credit Customer (Debtor)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a customer who bought tech gadgets on store credit or installment terms.
            </p>

            <form onSubmit={handleCreateDebtor} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alhaji Musa Garba"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Phone / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 802 345 6789"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount Owed (₦)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 520000"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mono-num"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={itemsDesc}
                  onChange={(e) => setItemsDesc(e.target.value)}
                  placeholder="e.g. MacBook Air M2 13.6-inch Balance"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Agreed Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Deposited ₦1.1m, promised remaining after shoot"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddDebtorModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-500 hover:to-cyan-400"
                >
                  Save Debtor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
