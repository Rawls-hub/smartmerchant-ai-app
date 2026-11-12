import React from 'react';
import { AlertTriangle, Trash2, X, Receipt } from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const DeleteExpenseConfirmModal: React.FC = () => {
  const { deletingExpense, setDeletingExpense, deleteExpense } = useMerchant();

  if (!deletingExpense) return null;

  const handleConfirm = () => {
    deleteExpense(deletingExpense.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0A0F22] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Delete Expense Entry?</h3>
          </div>
          <button
            onClick={() => setDeletingExpense(null)}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-300">
            Are you sure you want to permanently delete this expense record from your ledger?
          </p>

          <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white text-sm">
              {deletingExpense.description}
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="font-bold text-rose-400 mono-num text-sm">
                {formatNaira(deletingExpense.amount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-slate-200">{deletingExpense.category}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-slate-200">{deletingExpense.date}</span>
            </div>

            {deletingExpense.recipientVendor && (
              <div className="flex justify-between">
                <span className="text-slate-400">Vendor:</span>
                <span className="text-slate-200">{deletingExpense.recipientVendor}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            This will adjust your operating expenses and business net profit figures immediately.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setDeletingExpense(null)}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
