import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';
import { PaymentMethod } from '../../types';

export const RecordPaymentModal: React.FC = () => {
  const {
    activePaymentTarget,
    closePaymentModal,
    recordSalePayment,
    recordOrderPayment,
    recordDebtPayment,
  } = useMerchant();

  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('moniepoint');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (activePaymentTarget) {
      // Default amount to full outstanding balance
      setAmountStr(activePaymentTarget.outstandingBalance.toString());
      setReference(`PAY-${Date.now().toString().slice(-6)}`);
      setNote('');
      setValidationError(null);
      setPaymentMethod('moniepoint');
    }
  }, [activePaymentTarget]);

  if (!activePaymentTarget) return null;

  const currentBalance = activePaymentTarget.outstandingBalance;
  const payAmount = parseFloat(amountStr) || 0;
  const remainingBalance = Math.max(0, currentBalance - payAmount);
  const isOverpaying = payAmount > currentBalance;
  const isFullyPaid = payAmount >= currentBalance && payAmount > 0;

  const handlePreset = (fraction: number) => {
    const val = Math.round(currentBalance * fraction);
    setAmountStr(val.toString());
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      setValidationError('Please enter an amount greater than ₦0.');
      return;
    }
    if (isOverpaying) {
      setValidationError(`Amount exceeds the outstanding balance (${formatNaira(currentBalance)}).`);
      return;
    }

    if (activePaymentTarget.type === 'sale') {
      recordSalePayment(
        activePaymentTarget.id,
        payAmount,
        paymentMethod,
        note || `Customer installment of ${formatNaira(payAmount)}`,
        reference
      );
    } else if (activePaymentTarget.type === 'order') {
      recordOrderPayment(
        activePaymentTarget.id,
        payAmount,
        paymentMethod,
        note || `Customer installment of ${formatNaira(payAmount)}`,
        reference
      );
    } else {
      recordDebtPayment(
        activePaymentTarget.id,
        payAmount
      );
    }

    closePaymentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A0F22] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-cyan-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Record Customer Payment</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-cyan-400 font-semibold mono-num">
                  {activePaymentTarget.type === 'sale' ? 'Sale' : activePaymentTarget.type === 'order' ? 'Order' : 'Debt'} #{activePaymentTarget.referenceNo}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  {activePaymentTarget.customerName}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Financial Summary Card */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-[#070B16] p-3.5 grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Bill</span>
            <div className="text-sm sm:text-base font-bold text-white mono-num mt-0.5">
              {formatNaira(activePaymentTarget.totalAmount)}
            </div>
          </div>
          <div className="border-x border-slate-800/80 px-2">
            <span className="text-[11px] text-emerald-400 uppercase font-semibold">Already Paid</span>
            <div className="text-sm sm:text-base font-bold text-emerald-400 mono-num mt-0.5">
              {formatNaira(activePaymentTarget.amountPaid)}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-rose-400 uppercase font-semibold">Balance Due</span>
            <div className="text-sm sm:text-base font-extrabold text-rose-400 mono-num mt-0.5">
              {formatNaira(currentBalance)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount Input with Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Amount to Collect Now (₦)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePreset(1)}
                  className="rounded-md bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 transition-colors"
                >
                  Pay Full Balance
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(0.5)}
                  className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-300 transition-colors"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(0.25)}
                  className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-300 transition-colors"
                >
                  25%
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ₦
              </span>
              <input
                type="number"
                min="1"
                max={currentBalance}
                required
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setValidationError(null);
                }}
                className={`w-full rounded-xl border bg-[#070B16] py-2.5 pl-9 pr-4 text-base font-bold mono-num text-white focus:outline-none ${
                  isOverpaying
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-800 focus:border-blue-500'
                }`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Dynamic Balance Calculator Strip */}
          <div
            className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
              isFullyPaid
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : isOverpaying
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                : 'border-slate-800 bg-[#070B16] text-slate-300'
            }`}
          >
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px]">
                {isFullyPaid
                  ? 'Payment Status Update'
                  : 'Remaining Balance After Payment'}
              </span>
              <span className="font-bold text-sm mono-num">
                {isOverpaying
                  ? 'Exceeds balance'
                  : isFullyPaid
                  ? 'Cleared in Full (₦0.00)'
                  : formatNaira(remainingBalance)}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                  isFullyPaid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isFullyPaid ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Status: PAID
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3 w-3" />
                    Status: PARTIALLY PAID
                  </>
                )}
              </span>
            </div>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Channel
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'moniepoint', label: 'Moniepoint', icon: CreditCard },
                { id: 'opay', label: 'OPay', icon: Smartphone },
                { id: 'palmpay', label: 'PalmPay', icon: Smartphone },
                { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
                { id: 'cash', label: 'Cash', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/20 text-cyan-300 shadow-sm shadow-blue-500/20'
                        : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Reference #
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. MNP-POS-8921"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-xs mono-num text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. 2nd installment paid at store"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closePaymentModal}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payAmount <= 0 || isOverpaying}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record & Update Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
