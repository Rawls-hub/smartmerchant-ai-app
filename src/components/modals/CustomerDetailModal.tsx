import React, { useState } from 'react';
import {
  X,
  CreditCard,
  PhoneCall,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Building,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../../data/mockData';
import { PaymentMethod, PaymentStatus, CustomerPurchaseItem } from '../../types';

export const CustomerDetailModal: React.FC = () => {
  const {
    activeDetailCustomer,
    setActiveDetailCustomer,
    getCustomerStats,
    openPaymentModal,
    setEditingCustomer,
    setDeletingCustomer,
    setActiveReceipt,
    sales,
    settings,
  } = useMerchant();

  const [activeTab, setActiveTab] = useState<'purchases' | 'payments' | 'info'>('purchases');

  if (!activeDetailCustomer) return null;

  const stats = getCustomerStats(activeDetailCustomer);

  const getTagBadge = (tag?: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
      case 'Corporate':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'Wholesale':
        return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            PAID
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            PARTIAL
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" />
            UNPAID
          </span>
        );
    }
  };

  const getChannelBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'opay':
        return 'OPay Transfer';
      case 'moniepoint':
        return 'Moniepoint POS';
      case 'palmpay':
        return 'PalmPay Transfer';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      case 'credit':
        return 'Store Credit';
      default:
        return method;
    }
  };

  const getWhatsAppStatementUrl = () => {
    const cleanPhone = (activeDetailCustomer.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${activeDetailCustomer.fullName}! 🛍️ This is your customer account summary from ${settings.storeName}.\n\n` +
      `Total Purchases: ${stats.totalOrdersCount} orders\n` +
      `Total Spent: ${formatNaira(stats.totalSpent)}\n` +
      `Total Paid: ${formatNaira(stats.totalPaid)}\n` +
      `Outstanding Balance: ${formatNaira(stats.totalOutstanding)}\n\n` +
      (stats.totalOutstanding > 0
        ? `Kindly make transfer to:\nBank: ${settings.bankDetails.bankName}\nAcc: ${settings.bankDetails.accountNumber}\nName: ${settings.bankDetails.accountName}\n\n`
        : '') +
      `Thank you for your patronage with ${settings.storeName}!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const handlePayFirstOutstanding = () => {
    const targetItem = stats.purchases.find((p) => p.outstandingBalance > 0);
    if (targetItem) {
      openPaymentModal({
        type: targetItem.type,
        id: targetItem.id,
        referenceNo: targetItem.referenceNo,
        customerName: activeDetailCustomer.fullName,
        customerPhone: activeDetailCustomer.phone,
        totalAmount: targetItem.totalAmount,
        amountPaid: targetItem.amountPaid,
        outstandingBalance: targetItem.outstandingBalance,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
        {/* Header Profile Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-extrabold text-base shadow-lg shadow-blue-500/25">
              {activeDetailCustomer.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeDetailCustomer.fullName}
                </h2>
                {activeDetailCustomer.tag && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getTagBadge(activeDetailCustomer.tag)}`}>
                    {activeDetailCustomer.tag}
                  </span>
                )}
                {stats.isReturning && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                    Repeat Customer ({stats.totalOrdersCount} purchases)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="mono-num text-cyan-400">{activeDetailCustomer.phone}</span>
                {activeDetailCustomer.email && (
                  <>
                    <span>•</span>
                    <span className="truncate">{activeDetailCustomer.email}</span>
                  </>
                )}
                {activeDetailCustomer.city && (
                  <>
                    <span>•</span>
                    <span>{activeDetailCustomer.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                setEditingCustomer(activeDetailCustomer);
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                setDeletingCustomer(activeDetailCustomer);
              }}
              className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 p-2 text-xs font-semibold text-rose-400 border border-rose-500/20 transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setActiveDetailCustomer(null)}
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3 text-center">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Spent</span>
            <div className="text-base sm:text-lg font-bold text-white mono-num mt-1">
              {formatNaira(stats.totalSpent)}
            </div>
            <span className="text-[10px] text-slate-400">Lifetime turnover</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3 text-center">
            <span className="text-[11px] text-emerald-400 font-semibold uppercase">Amount Paid</span>
            <div className="text-base sm:text-lg font-bold text-emerald-400 mono-num mt-1">
              {formatNaira(stats.totalPaid)}
            </div>
            <span className="text-[10px] text-emerald-400/80">Inflow cleared</span>
          </div>

          <div className={`rounded-xl border p-3 text-center transition-colors ${
            stats.totalOutstanding > 0
              ? 'border-rose-500/40 bg-rose-500/10'
              : 'border-slate-800 bg-[#070B16]'
          }`}>
            <span className={`text-[11px] font-semibold uppercase ${
              stats.totalOutstanding > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              Outstanding
            </span>
            <div className={`text-base sm:text-lg font-extrabold mono-num mt-1 ${
              stats.totalOutstanding > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {formatNaira(stats.totalOutstanding)}
            </div>
            <span className={`text-[10px] ${
              stats.totalOutstanding > 0 ? 'text-rose-300 font-medium' : 'text-slate-400'
            }`}>
              {stats.totalOutstanding > 0 ? 'Balance due' : 'All cleared'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3 text-center">
            <span className="text-[11px] text-cyan-400 font-semibold uppercase">Total Orders</span>
            <div className="text-base sm:text-lg font-bold text-white mono-num mt-1">
              {stats.totalOrdersCount}
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.unpaidCount > 0 ? `${stats.unpaidCount} unpaid` : 'All processed'}
            </span>
          </div>
        </div>

        {/* Quick Action Bar if balance is owed */}
        {stats.totalOutstanding > 0 && (
          <div className="mt-3.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                <strong>{activeDetailCustomer.fullName}</strong> has an outstanding balance of{' '}
                <strong className="text-rose-400 mono-num">{formatNaira(stats.totalOutstanding)}</strong>.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePayFirstOutstanding}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record Payment</span>
              </button>

              <a
                href={getWhatsAppStatementUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-slate-700 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp Statement</span>
              </a>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 mt-4 pb-2">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'purchases'
                ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Purchases & Orders ({stats.purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Payment History ({stats.payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Delivery & Profile Info</span>
          </button>
        </div>

        {/* TAB 1: PURCHASES & ORDERS */}
        {activeTab === 'purchases' && (
          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
            {stats.purchases.map((p) => {
              const fullSale = sales.find((s) => s.id === p.id);
              return (
                <div
                  key={`${p.type}-${p.id}`}
                  className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400 mono-num text-xs">
                        {p.type === 'sale' ? 'Sale' : 'Order'} #{p.referenceNo}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {formatTimeAgo(p.date)}
                      </span>
                      {getPaymentBadge(p.paymentStatus)}
                    </div>
                    <div className="text-xs text-slate-200 font-medium">
                      {p.itemDescription}
                    </div>
                    {p.notes && (
                      <div className="text-[11px] text-slate-400 italic">
                        Note: {p.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-right text-xs">
                      <div className="font-bold text-white mono-num text-sm">
                        {formatNaira(p.totalAmount)}
                      </div>
                      <div className="text-emerald-400 mono-num">
                        Paid: {formatNaira(p.amountPaid)}
                      </div>
                      {p.outstandingBalance > 0 && (
                        <div className="text-rose-400 font-bold mono-num">
                          Bal: {formatNaira(p.outstandingBalance)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {fullSale && (
                        <button
                          onClick={() => {
                            setActiveReceipt(fullSale);
                          }}
                          className="rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold"
                          title="View Digital Receipt"
                        >
                          Receipt
                        </button>
                      )}

                      {p.outstandingBalance > 0 && (
                        <button
                          onClick={() =>
                            openPaymentModal({
                              type: p.type,
                              id: p.id,
                              referenceNo: p.referenceNo,
                              customerName: activeDetailCustomer.fullName,
                              customerPhone: activeDetailCustomer.phone,
                              totalAmount: p.totalAmount,
                              amountPaid: p.amountPaid,
                              outstandingBalance: p.outstandingBalance,
                            })
                          }
                          className="rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold"
                          title="Record Payment"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {stats.purchases.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No purchases recorded for this customer yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAYMENT AUDIT TRAIL */}
        {activeTab === 'payments' && (
          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
            {stats.payments.map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl border border-slate-800/80 bg-[#070B16] p-3 hover:border-slate-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white mono-num text-xs">
                      {tx.reference}
                    </span>
                    <span className="text-[11px] text-cyan-400">
                      for {tx.targetType} #{tx.targetReferenceNo}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Channel: <strong className="text-slate-300">{getChannelBadge(tx.paymentMethod)}</strong> • {formatTimeAgo(tx.timestamp)}
                  </div>
                  {tx.note && (
                    <div className="text-[11px] text-slate-400 italic mt-0.5">
                      {tx.note}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-emerald-400 mono-num text-sm sm:text-base">
                    +{formatNaira(tx.amount)}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-medium">Cleared</span>
                </div>
              </div>
            ))}

            {stats.payments.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No payment transactions recorded for this customer yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DELIVERY & INFO */}
        {activeTab === 'info' && (
          <div className="mt-3 flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
            <div className="rounded-xl border border-slate-800/80 bg-[#070B16] p-4 space-y-3">
              <h3 className="font-bold text-white text-sm">Customer Profile & Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Phone / WhatsApp:</span>
                  <span className="font-mono text-cyan-400 font-semibold">{activeDetailCustomer.phone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address:</span>
                  <span>{activeDetailCustomer.email || 'None on file'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Delivery Street Address:</span>
                  <span>{activeDetailCustomer.address || 'In-store / Computer Village counter'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">City / Region:</span>
                  <span>{activeDetailCustomer.city || 'Lagos'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Customer Classification:</span>
                  <span className="font-semibold text-white">{activeDetailCustomer.tag || 'Regular'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Member Since:</span>
                  <span>{new Date(activeDetailCustomer.createdAt).toLocaleDateString('en-NG')}</span>
                </div>
              </div>

              {activeDetailCustomer.notes && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Merchant Notes:</span>
                  <p className="mt-0.5 text-slate-300 italic">{activeDetailCustomer.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Close Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setActiveDetailCustomer(null)}
            className="rounded-xl px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
