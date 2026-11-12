import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Edit2,
  Calendar,
  Receipt,
  Building,
  CreditCard,
  DollarSign,
  AlertCircle,
  Tag,
  FileText,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { ExpenseCategory, PaymentMethod } from '../../types';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Stock purchases',
  'Transportation and logistics',
  'Rent',
  'Electricity and utilities',
  'Salaries and wages',
  'Marketing and advertising',
  'Repairs and maintenance',
  'Internet and subscriptions',
  'Miscellaneous expenses',
];

export const ExpenseModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    editingExpense,
    setEditingExpense,
    addExpense,
    updateExpense,
  } = useMerchant();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity and utilities');
  const defaultDate = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(defaultDate);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('opay');
  const [recipientVendor, setRecipientVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date.slice(0, 10));
      setPaymentMethod(editingExpense.paymentMethod);
      setRecipientVendor(editingExpense.recipientVendor || '');
      setNotes(editingExpense.notes || '');
      setReceiptRef(editingExpense.receiptRef || '');
      setErrorMessage(null);
    } else {
      setDescription('');
      setAmount('');
      setCategory('Electricity and utilities');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('opay');
      setRecipientVendor('');
      setNotes('');
      setReceiptRef('');
      setErrorMessage(null);
    }
  }, [editingExpense, isExpenseModalOpen]);

  if (!isExpenseModalOpen && !editingExpense) return null;

  const handleClose = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than ₦0.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please provide an expense description.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        description: description.trim(),
        amount: parsedAmount,
        category,
        date: date || '2026-10-31',
        paymentMethod,
        recipientVendor: recipientVendor.trim() || undefined,
        notes: notes.trim() || undefined,
        receiptRef: receiptRef.trim() || undefined,
      });
    } else {
      addExpense({
        description: description.trim(),
        amount: parsedAmount,
        category,
        date: date || '2026-10-31',
        paymentMethod,
        recipientVendor: recipientVendor.trim() || undefined,
        notes: notes.trim() || undefined,
        receiptRef: receiptRef.trim() || undefined,
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 sm:p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              {editingExpense ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h2>
              <p className="text-xs text-slate-400">
                Log operational expenses, stock restocks, utilities, and vendor payouts in Naira (₦).
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. EKEDC Commercial Prepaid Token / Lister Diesel 100L"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Amount (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₦
                </span>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 85000"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2.5 pl-8 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none mono-num font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Expense Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2.5 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {cat === 'Stock purchases' ? '(Capital Outlay on Inventory)' : ''}
                </option>
              ))}
            </select>
            {category === 'Stock purchases' ? (
              <p className="mt-1 text-[11px] text-cyan-400">
                💡 Note: Stock purchases are categorized as inventory asset investments. They are isolated from operating expenses so your business net profit is calculated accurately without double-counting inventory.
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Operating expense deducted from Gross Profit to determine Net Operating Profit.
              </p>
            )}
          </div>

          {/* Payment Method & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Payment Channel *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="opay">OPay Transfer</option>
                <option value="moniepoint">Moniepoint POS / Transfer</option>
                <option value="palmpay">PalmPay</option>
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="cash">Cash Counter</option>
                <option value="credit">Store Credit / Pay Later</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Vendor / Payee Name
              </label>
              <input
                type="text"
                value={recipientVendor}
                onChange={(e) => setRecipientVendor(e.target.value)}
                placeholder="e.g. EKEDC / TotalEnergies / GIG"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt / Invoice Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Receipt / Invoice / Token Ref (Optional)
            </label>
            <input
              type="text"
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="e.g. INV-2026-9812 or Meter Token #4829-1092"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none mono-num"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Internal Notes / Justification
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Urgent generator servicing during weekend sales rush"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
