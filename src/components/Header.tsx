import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Plus,
  Zap,
  Boxes,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira } from '../data/mockData';

import { NearStatusBadge } from './near/NearStatusBadge';

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const {
    settings,
    setIsNewSaleOpen,
    setIsAddProductOpen,
    lowStockProducts,
    debtors,
    setActiveSection,
    setActiveWhatsAppModalDebtor,
  } = useMerchant();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const overdueDebtors = debtors.filter((d) => d.daysOverdue > 0);
  const totalAlertsCount = lowStockProducts.length + overdueDebtors.length;

  const todayStr = new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-800/80 bg-[#070B16]/90 px-4 sm:px-8 backdrop-blur-md">
      {/* Left side: Hamburger & Store Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {settings.storeName}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              POS Active
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{todayStr}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-medium">Lagos GMT+1</span>
          </p>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center relative max-w-xs lg:max-w-md w-full mx-4">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, debtors, receipts..."
          className="w-full rounded-xl border border-slate-800 bg-[#0A0F20] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right side: Action buttons & Alerts */}
      <div className="flex items-center gap-3">
        {/* Add Product Button */}
        <button
          onClick={() => setIsAddProductOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#0E152E] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors"
        >
          <Boxes className="h-3.5 w-3.5 text-cyan-400" />
          <span>Add Stock</span>
        </button>

        {/* Record Fast Sale */}
        <button
          onClick={() => setIsNewSaleOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Fast Sale</span>
        </button>

        {/* NEAR Testnet Status Badge */}
        <NearStatusBadge />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative rounded-xl border border-slate-800 bg-[#0A0F20] p-2.5 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-[#0B1124] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-white">Merchant Action Alerts</h4>
                </div>
                <span className="text-[11px] font-semibold text-cyan-400">
                  {totalAlertsCount} need attention
                </span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {/* Low stock alerts */}
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Low Stock Alert</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-200 font-medium">{p.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Only <span className="font-bold text-rose-400">{p.stock} {p.unit}</span> left (Min {p.minStockAlert})
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveSection('inventory');
                      }}
                      className="shrink-0 rounded-lg bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/30"
                    >
                      Restock
                    </button>
                  </div>
                ))}

                {/* Overdue Debtors */}
                {overdueDebtors.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Overdue Customer Debt</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-200 font-medium">{d.customerName}</p>
                      <p className="text-[11px] text-slate-400">
                        Owes <span className="font-bold text-rose-400">{formatNaira(d.amountOwed)}</span> ({d.daysOverdue} days past due)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveWhatsAppModalDebtor(d);
                      }}
                      className="shrink-0 flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/30"
                    >
                      <PhoneCall className="h-3 w-3" />
                      Remind
                    </button>
                  </div>
                ))}

                {totalAlertsCount === 0 && (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-1" />
                    <p className="text-xs text-slate-300 font-medium">All systems green!</p>
                    <p className="text-[11px] text-slate-400">Stock is healthy and no overdue debts.</p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setActiveSection('payments');
                  }}
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  View All Outstanding Debtors &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
