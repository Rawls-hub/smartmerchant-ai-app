import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useNear, NearAuditRecord } from '../../context/NearContext';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const AnchorAuditModal: React.FC = () => {
  const { isAnchorModalOpen, setIsAnchorModalOpen, anchorAudit, openVerificationForAudit, historicalAudits } = useNear();
  const { settings, getProfitabilitySummary, totalInventoryValuation, totalOutstandingPayments, sales, debtors } = useMerchant();

  const [step, setStep] = useState<'confirm' | 'broadcasting' | 'success'>('confirm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultAudit, setResultAudit] = useState<NearAuditRecord | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isAnchorModalOpen) return null;

  const currentMonth = 'October 2026';
  const periodDate = '2026-10-31';
  const profitSummary = getProfitabilitySummary('month');

  // Check if an audit for this period is already anchored
  const existingAudit = historicalAudits.find(
    (a) => a.periodDate === periodDate && a.storeName === settings.storeName
  );

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    setIsAnchorModalOpen(false);
    // Reset to confirm step after animation
    setTimeout(() => {
      setStep('confirm');
      setResultAudit(null);
      setIsDuplicate(false);
      setErrorMessage(null);
    }, 200);
  };

  const handleConfirmAnchor = async () => {
    setIsSubmitting(true);
    setStep('broadcasting');
    setErrorMessage(null);

    const metrics = {
      revenue: profitSummary.totalRevenue,
      cogs: profitSummary.cogs,
      grossProfit: profitSummary.grossProfit,
      operatingExpenses: profitSummary.operatingExpenses,
      netProfit: profitSummary.netProfit,
      inventoryValuation: totalInventoryValuation,
      outstandingReceivables: totalOutstandingPayments,
      completedSalesCount: sales.length,
      activeDebtorsCount: debtors.length,
    };

    const res = await anchorAudit({
      periodDate,
      storeName: settings.storeName,
      metrics,
      note: `SmartMerchant AI Verified Month-End Close - ${currentMonth}`,
    });

    setIsSubmitting(false);

    if (res.success && res.audit) {
      setResultAudit(res.audit);
      setIsDuplicate(!!res.isDuplicatePrevented);
      setStep('success');
    } else {
      setStep('confirm');
      setErrorMessage(res.error || 'Failed to broadcast transaction to NEAR Testnet.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0B1124] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#070B16]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Anchor Business Audit on NEAR Blockchain</span>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Testnet
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cryptographically seal tamper-evident monthly financial state on NEAR Social DB
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: CONFIRMATION */}
          {step === 'confirm' && (
            <>
              {existingAudit && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Audit Already Anchored for {currentMonth}</div>
                      <div className="text-slate-300 mt-0.5 text-[11px]">
                        Audit ID: <span className="font-mono text-cyan-300">{existingAudit.auditId}</span> (Block #{existingAudit.blockHeight})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleClose();
                      openVerificationForAudit(existingAudit.auditId);
                    }}
                    className="shrink-0 rounded-lg bg-cyan-500/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    View Proof &rarr;
                  </button>
                </div>
              )}

              {/* Business State to be Committed */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">Audit Period & Merchant Scope</span>
                  <span className="font-bold text-cyan-400">{settings.storeName} ({currentMonth})</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Total Revenue</div>
                    <div className="font-bold text-white mono-num mt-0.5">{formatNaira(profitSummary.totalRevenue)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Net Operating Profit</div>
                    <div className="font-bold text-emerald-400 mono-num mt-0.5">{formatNaira(profitSummary.netProfit)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Stock Valuation</div>
                    <div className="font-bold text-cyan-300 mono-num mt-0.5">{formatNaira(totalInventoryValuation)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Receivables (Debts)</div>
                    <div className="font-bold text-amber-300 mono-num mt-0.5">{formatNaira(totalOutstandingPayments)}</div>
                  </div>
                </div>
              </div>

              {/* Privacy & Cryptographic Integrity Guarantee */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Lock className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>Zero-Knowledge Privacy & Tamper-Evident Architecture</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                  <li>
                    <strong className="text-white">Strict Privacy:</strong> Zero financial numbers, customer identities, or debtor records are published on-chain.
                  </li>
                  <li>
                    <strong className="text-white">Cryptographic Commitment:</strong> The server computes a salted SHA-256 hash from canonical deterministic metrics. Only this commitment hash is broadcast to NEAR.
                  </li>
                  <li>
                    <strong className="text-white">Mutable Registry Transparency:</strong> NEAR Social DB (<code className="text-cyan-300">v1.social08.testnet</code>) operates as mutable key-value storage. Audit immutability is proven by matching the verifiable transaction hash and block height against the server's private salted record.
                  </li>
                  <li>
                    <strong className="text-white">Server-Side Signing:</strong> Signed using <code className="text-cyan-300">rawls-hub.testnet</code> ed25519 access key strictly on the backend. Private keys never leave server memory.
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAnchor}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Confirm & Anchor on NEAR Testnet</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 2: BROADCASTING */}
          {step === 'broadcasting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin" />
                <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-[#070B16] text-cyan-400 font-bold">
                  N
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Broadcasting to NEAR Testnet...</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Computing salted SHA-256 hash, signing transaction with <code className="text-cyan-300">rawls-hub.testnet</code>, and calling <code className="text-cyan-300">v1.social08.testnet.set</code>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && resultAudit && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  isDuplicate
                    ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-200'
                    : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                }`}
              >
                <CheckCircle2
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    isDuplicate ? 'text-cyan-400' : 'text-emerald-400'
                  }`}
                />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isDuplicate
                      ? 'Audit Already Sealed & Verified on NEAR'
                      : 'Audit Successfully Sealed on NEAR Testnet!'}
                  </h4>
                  <p className="text-xs mt-0.5 text-slate-300">
                    {isDuplicate
                      ? `Duplicate submission prevented: An audit commitment for ${periodDate} is already sealed in block #${resultAudit.blockHeight}.`
                      : `The deterministic audit commitment for ${periodDate} has been confirmed on NEAR Testnet.`}
                  </p>
                </div>
              </div>

              {/* On-Chain Evidence Details */}
              <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 space-y-3 text-xs">
                {/* Audit ID */}
                <div>
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Audit Unique Identifier</span>
                    <button
                      onClick={() => handleCopy(resultAudit.auditId, 'auditId')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                    >
                      {copiedField === 'auditId' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === 'auditId' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-white bg-slate-900/80 rounded-lg p-2 truncate">
                    {resultAudit.auditId}
                  </div>
                </div>

                {/* Commitment Hash */}
                <div>
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Salted SHA-256 Commitment Hash (On-Chain)</span>
                    <button
                      onClick={() => handleCopy(resultAudit.commitmentHash, 'hash')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                    >
                      {copiedField === 'hash' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === 'hash' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-emerald-400 bg-slate-900/80 rounded-lg p-2 break-all text-[11px]">
                    {resultAudit.commitmentHash}
                  </div>
                </div>

                {/* Transaction Hash & Block Height */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">Transaction Hash</div>
                    <div className="font-mono text-slate-200 truncate text-[11px]">
                      {resultAudit.txHash}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">Confirmed Block Height</div>
                    <div className="font-mono text-white font-bold">
                      #{resultAudit.blockHeight}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <a
                  href={resultAudit.nearBlocksUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Verify on NearBlocks</span>
                  <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Done
                  </button>

                  <button
                    onClick={() => {
                      handleClose();
                      openVerificationForAudit(resultAudit.auditId);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Inspect On-Chain Proof &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
