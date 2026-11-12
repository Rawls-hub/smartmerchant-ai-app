import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira } from '../data/mockData';
import { ProductCategory, Product } from '../types';

export const InventoryView: React.FC = () => {
  const {
    products,
    lowStockAlertsCount,
    totalProductsInStock,
    totalUnitsInStock,
    totalInventoryValuation,
    setIsAddProductOpen,
    setActiveRestockProduct,
    deleteProduct,
    openRestockPlanner,
  } = useMerchant();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Smartphones & Tablets',
    'Laptops & Computers',
    'Gaming Consoles & Gear',
    'Audio & Speakers',
    'Accessories & Power',
    'Smart Wearables',
  ];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inventory & Stock Manager
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor real-time stock levels, reorder thresholds, supplier wholesale costs, and retail margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={openRestockPlanner}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-900/30 transition-all glow-cyan-sm"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>AI Restock Planner</span>
          </button>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
          <div className="text-xs text-slate-400 font-medium">Inventory Valuation (Retail)</div>
          <div className="text-2xl font-bold text-white mono-num mt-1">
            {formatNaira(totalInventoryValuation)}
          </div>
          <div className="text-xs text-cyan-400 mt-1">Total tied up capital</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
          <div className="text-xs text-slate-400 font-medium">Products in Stock</div>
          <div className="text-2xl font-bold text-white mono-num mt-1">
            {totalProductsInStock} <span className="text-sm font-normal text-slate-400">items</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Across 5 departments</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4">
          <div className="text-xs text-slate-400 font-medium">Total Physical Units</div>
          <div className="text-2xl font-bold text-cyan-400 mono-num mt-1">
            {totalUnitsInStock} <span className="text-sm font-normal text-slate-400">units</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Ready for counter sale</div>
        </div>

        <div
          onClick={openRestockPlanner}
          className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4 hover:border-amber-500/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-medium">Low-Stock Warnings</div>
            <span className="text-[10px] text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5">
              Restock Planner &rarr;
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mono-num mt-1 flex items-center gap-2">
            {lowStockAlertsCount}
            {lowStockAlertsCount > 0 && (
              <span className="text-xs rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 border border-amber-500/30">
                Action required
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">Below minimum threshold</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or SKU..."
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F22] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#070B16] text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Item & SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Selling Price</th>
                <th className="px-6 py-4 text-center">Profit Margin</th>
                <th className="px-6 py-4 text-center">Stock Level</th>
                <th className="px-6 py-4 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock <= prod.minStockAlert;
                const marginPercent = Math.round(
                  ((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100
                );

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Item */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{prod.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="mono-num">SKU: {prod.sku}</span>
                        <span>•</span>
                        <span>Unit: {prod.unit}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {prod.category}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="px-6 py-4 text-right whitespace-nowrap mono-num text-slate-400">
                      {formatNaira(prod.costPrice)}
                    </td>

                    {/* Selling */}
                    <td className="px-6 py-4 text-right whitespace-nowrap mono-num font-bold text-white">
                      {formatNaira(prod.sellingPrice)}
                    </td>

                    {/* Margin */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        <TrendingUp className="h-3 w-3" />
                        {marginPercent}%
                      </span>
                    </td>

                    {/* Stock Status */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isLow
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {prod.stock} {prod.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Min Alert: {prod.minStockAlert}
                        </span>
                      </div>
                    </td>

                    {/* Quick Restock / Actions */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveRestockProduct(prod)}
                          className="flex items-center gap-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restock</span>
                        </button>

                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
