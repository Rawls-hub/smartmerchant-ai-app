import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const DeleteCustomerConfirmModal: React.FC = () => {
  const { deletingCustomer, setDeletingCustomer, deleteCustomer, getCustomerStats } = useMerchant();

  if (!deletingCustomer) return null;

  const stats = getCustomerStats(deletingCustomer);

  const handleConfirm = () => {
    deleteCustomer(deletingCustomer.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0A0F22] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Delete Customer Profile?</h3>
          </div>
          <button
            onClick={() => setDeletingCustomer(null)}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-300">
            Are you sure you want to remove <strong className="text-white">{deletingCustomer.fullName}</strong> from your customer records?
          </p>

          {stats.totalOutstanding > 0 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 space-y-1">
              <strong className="block text-rose-400 font-semibold">
                ⚠️ Warning: Customer has an outstanding balance!
              </strong>
              <span>
                This customer currently owes <strong>{formatNaira(stats.totalOutstanding)}</strong> across {stats.unpaidCount + stats.partialCount} unpaid or partial transactions.
              </span>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Phone:</span>
              <span className="text-slate-200 font-mono">{deletingCustomer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Past Purchases:</span>
              <span className="text-slate-200">{stats.totalOrdersCount} orders</span>
            </div>
            <div className="flex justify-between">
              <span>Total Spent:</span>
              <span className="text-slate-200 font-mono">{formatNaira(stats.totalSpent)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setDeletingCustomer(null)}
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
