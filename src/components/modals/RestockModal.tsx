import React, { useState, useEffect } from 'react';
import { X, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const RestockModal: React.FC = () => {
  const { activeRestockProduct, setActiveRestockProduct, restockProduct, restockInitialUnits } = useMerchant();
  const [addedUnits, setAddedUnits] = useState('10');

  useEffect(() => {
    if (activeRestockProduct) {
      setAddedUnits((restockInitialUnits && restockInitialUnits > 0 ? restockInitialUnits : 10).toString());
    }
  }, [activeRestockProduct, restockInitialUnits]);

  if (!activeRestockProduct) return null;

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(addedUnits, 10);
    if (isNaN(qty) || qty <= 0) return;

    restockProduct(activeRestockProduct.id, qty);
    setActiveRestockProduct(null);
  };

  const parsedQty = parseInt(addedUnits, 10) || 0;
  const estimatedCost = parsedQty * (activeRestockProduct.costPrice || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0B1124] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Restock Product</h3>
              <p className="text-[11px] text-slate-400">
                Log incoming batch from distributor into Rawls & Hub inventory.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveRestockProduct(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {restockInitialUnits > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-300">
            <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>
              Restock Planner recommendation: <strong>+{restockInitialUnits} units</strong> based on sales velocity and lead time buffer.
            </span>
          </div>
        )}

        <div className="mt-3 rounded-xl border border-slate-800 bg-[#070B16] p-3.5">
          <div className="text-sm font-bold text-white">{activeRestockProduct.name}</div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>SKU: {activeRestockProduct.sku}</span>
            <span>Cost Price: {formatNaira(activeRestockProduct.costPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-800">
            <span className="text-slate-400">Current Stock:</span>
            <span className="font-bold text-rose-400">
              {activeRestockProduct.stock} {activeRestockProduct.unit} (Alert at {activeRestockProduct.minStockAlert})
            </span>
          </div>
        </div>

        <form onSubmit={handleRestock} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Number of Units to Add
            </label>
            <input
              type="number"
              required
              min="1"
              value={addedUnits}
              onChange={(e) => setAddedUnits(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mono-num"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2">
            {[5, 10, 20, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setAddedUnits(num.toString())}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                +{num}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-xs">
            <span className="text-slate-400">Total Purchase Cost:</span>
            <span className="font-bold text-cyan-400 mono-num">
              {formatNaira(estimatedCost)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRestockProduct(null)}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-cyan-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm Restock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
