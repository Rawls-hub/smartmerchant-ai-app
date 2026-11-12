import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Layers,
  Calendar,
  Lock,
  CheckCircle2,
  Database,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { useNear, VerificationResult } from '../../context/NearContext';
import { formatNaira } from '../../data/mockData';

export const AuditVerificationDrawer: React.FC = () => {
  const {
    isVerificationDrawerOpen,
    setIsVerificationDrawerOpen,
    selectedAuditId,
    setSelectedAuditId,
    historicalAudits,
    verifyAudit,
  } = useNear();

  const [searchId, setSearchId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAuditId) {
      setSearchId(selectedAuditId);
      performVerification(selectedAuditId);
    } else if (historicalAudits.length > 0 && isVerificationDrawerOpen && !searchId) {
      const defaultId = historicalAudits[0].auditId;
      setSearchId(defaultId);
      performVerification(defaultId);
    }
  }, [selectedAuditId, isVerificationDrawerOpen, historicalAudits]);

  const performVerification = async (id: string) => {
    if (!id.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await verifyAudit(id.trim());
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({
        success: false,
        verifiedOnChain: false,
        auditId: id,
        contractId: 'v1.social08.testnet',
        error: err.message || 'Verification call failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isVerificationDrawerOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSelectHistorical = (id: string) => {
    setSearchId(id);
    setSelectedAuditId(id);
    performVerification(id);
  };

  const isVerified = verificationResult?.verifiedOnChain && verificationResult?.cryptographicProofVerified;
  const isUnavailable = !verificationResult?.verifiedOnChain;
  const isTampered = verificationResult?.verifiedOnChain && !verificationResult?.cryptographicProofVerified;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-[#0B1124] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#070B16]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">On-Chain Audit Verification</h3>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  NEAR Testnet
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct RPC proof verification from <code className="text-cyan-300">v1.social08.testnet</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVerificationDrawerOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audit Selector & Search */}
        <div className="p-4 border-b border-slate-800/80 bg-[#090E20] space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performVerification(searchId);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter or paste Audit ID (e.g. audit_179439...)"
                className="w-full rounded-xl border border-slate-800 bg-[#060913] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || !searchId.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition-all shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Verify</span>
            </button>
          </form>

          {/* Quick Select from Historical Audits */}
          {historicalAudits.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Historical Store Audits ({historicalAudits.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {historicalAudits.map((a) => (
                  <button
                    key={a.auditId}
                    type="button"
                    onClick={() => handleSelectHistorical(a.auditId)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                      searchId === a.auditId
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{a.periodDate}</span>
                    <span className="text-[10px] text-slate-400">#{a.blockHeight}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-200">
          {/* Loading State */}
          {isVerifying && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin" />
              <div className="text-sm font-semibold text-white">Querying NEAR Testnet RPC...</div>
              <p className="text-xs text-slate-400">
                Calling <code className="text-cyan-300">v1.social08.testnet.get</code> for key:{' '}
                <span className="font-mono text-[11px] text-slate-300">rawls-hub.testnet/smartmerchant_audits/{searchId}</span>
              </p>
            </div>
          )}

          {/* Result States */}
          {!isVerifying && verificationResult && (
            <>
              {/* STATE 1: VERIFIED (Emerald) */}
              {isVerified && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Cryptographic Proof Confirmed
                        </span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          100% Valid
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        Verified On-Chain on NEAR Testnet
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        The salted SHA-256 commitment hash anchored in Social DB matches the deterministic store records perfectly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 2: TAMPERED / HASH MISMATCH (Amber / Red) */}
              {isTampered && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-rose-300">Hash Mismatch Detected</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        The record was found on Social DB, but the commitment hash does NOT match the local store audit.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 3: UNAVAILABLE / NOT FOUND (Slate / Amber) */}
              {isUnavailable && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-amber-300">Audit Record Unavailable On-Chain</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        {verificationResult.error || `No record found under rawls-hub.testnet/smartmerchant_audits/${searchId}.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EVIDENCE SECTION: ON-CHAIN PUBLIC DATA */}
              {verificationResult.onChainData && (
                <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-cyan-400" />
                      <span>On-Chain Social DB Record (Public Metadata)</span>
                    </span>
                    <span className="font-mono text-[11px] text-cyan-300">
                      {verificationResult.contractId}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-0.5">Anchored Commitment Hash</div>
                      <div className="font-mono text-emerald-400 bg-slate-900/80 rounded-lg p-2 break-all text-[11px] flex items-center justify-between gap-2">
                        <span>{verificationResult.onChainData.commitmentHash}</span>
                        <button
                          onClick={() => handleCopy(verificationResult.onChainData!.commitmentHash, 'hash')}
                          className="text-slate-400 hover:text-white shrink-0"
                          title="Copy hash"
                        >
                          {copiedField === 'hash' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] text-slate-400">Audit ID</div>
                        <div className="font-mono text-white text-[11px] truncate">
                          {verificationResult.onChainData.auditId}
                        </div>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] text-slate-400">Period Date</div>
                        <div className="font-bold text-white text-[11px]">
                          {verificationResult.onChainData.periodDate}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] text-slate-400">Merchant Entity</div>
                        <div className="font-semibold text-slate-200 text-[11px] truncate">
                          {verificationResult.onChainData.store || 'Rawls & Hub'}
                        </div>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] text-slate-400">On-Chain Timestamp</div>
                        <div className="font-mono text-slate-300 text-[11px] truncate">
                          {verificationResult.onChainData.timestamp?.slice(0, 19).replace('T', ' ')} UTC
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VERIFIED LOCAL STORE RECORD */}
              {verificationResult.localRecord && (
                <div className="rounded-xl border border-slate-800 bg-[#070B16] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Verified Merchant Financial Metrics (Private Ledger)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Hash-Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Gross Revenue</div>
                      <div className="font-bold text-white mono-num text-xs mt-0.5">
                        {formatNaira(verificationResult.localRecord.metrics.revenue)}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Net Profit</div>
                      <div className="font-bold text-emerald-400 mono-num text-xs mt-0.5">
                        {formatNaira(verificationResult.localRecord.metrics.netProfit)}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Inventory Valuation</div>
                      <div className="font-bold text-cyan-300 mono-num text-xs mt-0.5">
                        {formatNaira(verificationResult.localRecord.metrics.inventoryValuation)}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Receivables</div>
                      <div className="font-bold text-amber-300 mono-num text-xs mt-0.5">
                        {formatNaira(verificationResult.localRecord.metrics.outstandingReceivables)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Block Height: <strong className="text-white">#{verificationResult.localRecord.blockHeight}</strong></span>
                    <span>Status: <strong className="text-emerald-400 uppercase">{verificationResult.localRecord.status}</strong></span>
                  </div>
                </div>
              )}

              {/* MUTABLE STORAGE ARCHITECTURE CALLOUT */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/15 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <Database className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>NEAR Social DB Mutable Key-Value Notice</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  NEAR Social DB (<code className="text-amber-200">v1.social08.testnet</code>) functions as a mutable key-value state tree. Audit records are protected against tampering because any modified payload would invalidate the signed transaction receipt and fail deterministic SHA-256 hash comparison.
                </p>
              </div>

              {/* EXPLORER ACTIONS */}
              {verificationResult.localRecord?.nearBlocksUrl && (
                <div className="pt-2">
                  <a
                    href={verificationResult.localRecord.nearBlocksUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all"
                  >
                    <span>View Confirmed Transaction on NearBlocks</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </>
          )}

          {!isVerifying && !verificationResult && (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Search className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">Select an audit to verify</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Choose a historical audit from above or enter any Audit ID to query live NEAR Social DB state.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
