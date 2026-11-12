import React, { useState } from 'react';
import { X, Boxes, Plus } from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { ProductCategory } from '../../types';

export const AddProductModal: React.FC = () => {
  const { isAddProductOpen, setIsAddProductOpen, addProduct } = useMerchant();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Smartphones & Tablets');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('5');
  const [minStockAlert, setMinStockAlert] = useState('3');
  const [unit, setUnit] = useState('units');
  const [supplier, setSupplier] = useState('');

  if (!isAddProductOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(costPrice) || 0;
    const sell = parseFloat(sellingPrice) || 0;
    const qty = parseInt(stock, 10) || 0;
    const alertLevel = parseInt(minStockAlert, 10) || 5;

    addProduct({
      name,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      costPrice: cost,
      sellingPrice: sell,
      stock: qty,
      minStockAlert: alertLevel,
      unit,
      supplier,
    });

    setIsAddProductOpen(false);
    setName('');
    setSku('');
    setCostPrice('');
    setSellingPrice('');
    setStock('10');
    setMinStockAlert('5');
    setSupplier('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B1124] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Product to Inventory</h3>
              <p className="text-[11px] text-slate-400">
                Register a new stock item with cost and selling price in Naira (₦).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddProductOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Product Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. iPhone 16 Pro Max (256GB)"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Smartphones & Tablets">Smartphones & Tablets</option>
                <option value="Laptops & Computers">Laptops & Computers</option>
                <option value="Gaming Consoles & Gear">Gaming Consoles & Gear</option>
                <option value="Audio & Speakers">Audio & Speakers</option>
                <option value="Accessories & Power">Accessories & Power</option>
                <option value="Smart Wearables">Smart Wearables</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                SKU / Barcode (Optional)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. IPH-16PM-256"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cost Price (₦)
              </label>
              <input
                type="number"
                required
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="e.g. 5200"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Selling Price (₦)
              </label>
              <input
                type="number"
                required
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="e.g. 6500"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mono-num"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Units
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Unit Type
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cartons, tins..."
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Min Alert Level
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supplier / Wholesale Source (Optional)
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Trade Fair Central Wholesalers"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-cyan-400"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
