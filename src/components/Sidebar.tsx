import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  ShoppingBag,
  CreditCard,
  Users,
  Receipt,
  Sparkles,
  Bot,
  Zap,
  Store,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useMerchant, NavSection } from '../context/MerchantContext';
import { formatNaira } from '../data/mockData';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    activeSection,
    setActiveSection,
    lowStockAlertsCount,
    debtors,
    orders,
    customers,
    customersWithOutstandingCount,
    totalExpensesToday,
    totalSalesToday,
    settings,
    setIsNewSaleOpen,
    aiTab,
    setAiTab,
  } = useMerchant();

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const overdueDebtorsCount = debtors.filter((d) => d.daysOverdue > 0).length;

  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'sales',
      label: 'Sales & POS',
      icon: TrendingUp,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockAlertsCount > 0 ? `${lowStockAlertsCount} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: customersWithOutstandingCount > 0 ? `${customersWithOutstandingCount} Due` : customers.length > 0 ? customers.length : undefined,
      badgeColor: customersWithOutstandingCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700/60 text-slate-300',
    },
    {
      id: 'payments',
      label: 'Payments & Debts',
      icon: CreditCard,
      badge: overdueDebtorsCount > 0 ? `${overdueDebtorsCount} Due` : debtors.length > 0 ? debtors.length : undefined,
      badgeColor: overdueDebtorsCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-700/60 text-slate-300',
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt,
      badge: totalExpensesToday > 0 ? formatNaira(totalExpensesToday) : undefined,
      badgeColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono text-[10px]',
    },
    {
      id: 'ai',
      label: 'AI Business Insights',
      icon: Sparkles,
      badge: 'Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse',
    },
    {
      id: 'ask_ai',
      label: 'Ask AI',
      icon: Bot,
      badge: 'Chat',
      badgeColor: 'bg-blue-500/20 text-cyan-300 border border-blue-400/30',
    },
  ];

  const handleNavClick = (section: NavSection) => {
    if (section === 'ask_ai') {
      setActiveSection('ask_ai');
      setAiTab('copilot');
    } else if (section === 'ai') {
      setActiveSection('ai');
      if (aiTab === 'copilot') {
        setAiTab('copilot_dashboard');
      }
    } else {
      setActiveSection(section);
    }
    onCloseMobile();
  };

  const progressPercent = Math.min(100, Math.round((totalSalesToday / settings.dailySalesTarget) * 100));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex-col justify-between border-r border-slate-800/80 bg-[#070B16] text-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 flex' : '-translate-x-full lg:flex hidden'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
                <Store className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-[#070B16]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-bold tracking-tight text-white">SmartMerchant</h1>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-blue-400/30">
                    AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="inline-block text-[11px]">🇳🇬</span>
                  <span>Fintech Business Copilot</span>
                </div>
              </div>
            </div>

            {/* Quick Fast Sale button */}
            <button
              onClick={() => {
                setIsNewSaleOpen(true);
                onCloseMobile();
              }}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 transition-all active:scale-[0.98]"
            >
              <Zap className="h-4 w-4" />
              <span>Record Fast Sale (POS)</span>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.id === 'ask_ai'
                  ? activeSection === 'ask_ai' || (activeSection === 'ai' && aiTab === 'copilot')
                  : item.id === 'ai'
                  ? activeSection === 'ai' && aiTab !== 'copilot'
                  : activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-white border-l-4 border-blue-500 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Daily Goal & Store Profile Card at bottom */}
          <div className="p-4 border-t border-slate-800/80 bg-[#0A0F20]/60">
            {/* Sales Target Widget */}
            <div className="mb-4 rounded-xl border border-slate-800/80 bg-[#0B1226] p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Today&apos;s Target</span>
                <span className="font-semibold text-cyan-400">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="mono-num text-slate-300">{formatNaira(totalSalesToday)}</span>
                <span className="text-slate-400">Goal: {formatNaira(settings.dailySalesTarget)}</span>
              </div>
            </div>

            {/* Merchant Identity snippet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-950/70 border border-blue-500/30 text-blue-400 font-bold text-xs">
                  RH
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white">
                    {settings.storeName}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Lagos, Computer Village</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
