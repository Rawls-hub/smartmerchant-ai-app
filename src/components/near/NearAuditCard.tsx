import React from 'react';
import {
  ShieldCheck,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  Check,
  Copy,
} from 'lucide-react';
import { useNear } from '../../context/NearContext';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const NearAuditCard: React.FC = () => {
  const {
    historicalAudits,
    setIsAnchorModalOpen,
    openVerificationForAudit,
    account,
    status,
  } = useNear();

  const { settings, getProfitabilitySummary, totalInventoryValuation, totalOutstandingPayments } = useMerchant();

  const currentMonth = 'October 2026';
  const periodDate = '2026-10-31';
  const profitSummary = getProfitabilitySummary('month');

  // Find if an audit for this period is already anchored
  const latestAudit = historicalAudits.find(
    (a) => a.periodDate === periodDate && a.storeName === settings.storeName
  ) || historicalAudits[0];

  const isAnchored = !!latestAudit;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0B1226] p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                NEAR Blockchain Business Audit Anchor
              </h3>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Testnet Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Decentralized cryptographic seal for {settings.storeName} financial integrity & investor trust
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => openVerificationForAudit(latestAudit?.auditId)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#0E152E] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Verify Proof ({historicalAudits.length})</span>
          </button>

          <button
            onClick={() => setIsAnchorModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAnchored ? 'Anchor Month-End Audit' : 'Anchor Audit on NEAR'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Status & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1 & 2: Audit State & Evidence */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#070B16] p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>Current Audit Status: {currentMonth}</span>
              </span>
              {isAnchored ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Sealed on Block #{latestAudit.blockHeight}</span>
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                  <span>Pending On-Chain Anchor</span>
                </span>
              )}
            </div>

            {/* Financial Metrics Ready / Committed */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gross Revenue</div>
                <div className="font-bold text-white mono-num text-xs mt-0.5">
                  {formatNaira(profitSummary.totalRevenue)}
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Net Profit</div>
                <div className="font-bold text-emerald-400 mono-num text-xs mt-0.5">
                  {formatNaira(profitSummary.netProfit)}
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Stock Valuation</div>
                <div className="font-bold text-cyan-300 mono-num text-xs mt-0.5">
                  {formatNaira(totalInventoryValuation)}
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Receivables</div>
                <div className="font-bold text-amber-300 mono-num text-xs mt-0.5">
                  {formatNaira(totalOutstandingPayments)}
                </div>
              </div>
            </div>

            {/* Cryptographic Evidence Line (if anchored) */}
            {isAnchored && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>On-Chain SHA-256 Commitment Hash:</span>
                  <button
                    onClick={() => openVerificationForAudit(latestAudit.auditId)}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
                  >
                    Inspect in Drawer &rarr;
                  </button>
                </div>
                <div className="font-mono text-emerald-400 bg-slate-900/80 rounded-lg p-2 break-all text-[11px]">
                  {latestAudit.commitmentHash}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Explorer Action Link */}
          {latestAudit && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 text-[11px]">
                Tx: <span className="font-mono text-slate-300">{latestAudit.txHash.slice(0, 16)}...</span>
              </span>
              <a
                href={latestAudit.nearBlocksUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
              >
                <span>Verify on NearBlocks Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Column 3: Privacy & Protocol Trust Card */}
        <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 flex flex-col justify-between space-y-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>Zero-Knowledge Privacy Rules</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>No customer identities, debtor names, or bank details are published on-chain.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deterministic salted SHA-256 hash guarantees mathematical proof without exposing actual naira figures.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Stored in standard NEAR Social DB registry (<code className="text-cyan-300 font-mono">v1.social08.testnet</code>).</span>
              </li>
            </ul>
          </div>

          {/* Social DB Mutable Storage Note */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-200">
            <strong className="text-white block mb-0.5">Mutable Registry Architecture:</strong>
            NEAR Social DB is a mutable key-value state store. Immutability is verified by matching the signed transaction receipt against the server's private salted record.
          </div>
        </div>
      </div>
    </div>
  );
};
