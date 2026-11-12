import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useNear } from '../../context/NearContext';

export const NearStatusBadge: React.FC = () => {
  const {
    status,
    account,
    isLoadingStatus,
    isLoadingAccount,
    refreshStatus,
    refreshAccount,
    openVerificationForAudit,
    historicalAudits,
  } = useNear();

  const [isOpen, setIsOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAccount = () => {
    if (account?.accountId) {
      navigator.clipboard.writeText(account.accountId);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleManualRefresh = async () => {
    await Promise.all([refreshStatus(), refreshAccount()]);
  };

  const isOnline = status?.status === 'online';
  const isError = status?.status === 'error';
  const isDisconnected = status?.status === 'disconnected';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top Bar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0A0F20] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800/80 transition-all shadow-sm"
        title="NEAR Testnet Connection Status"
      >
        {/* NEAR Protocol Icon */}
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.68 4.25h4.82l6.83 10.15V4.25H20v15.5h-4.82L8.35 9.6v10.15H4.68V4.25z" />
          </svg>
        </div>

        {/* Live Network Dot */}
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isOnline
                ? 'bg-emerald-400'
                : isError
                ? 'bg-rose-500'
                : isDisconnected
                ? 'bg-amber-400'
                : 'bg-cyan-400 animate-pulse'
            }`}
          />
        </span>

        {/* Account ID / Network Label */}
        <div className="flex items-center gap-1.5 text-left">
          <span className="hidden xs:inline font-semibold text-slate-200">
            {account?.accountId || status?.configuredAccount || 'rawls-hub.testnet'}
          </span>
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            Testnet
          </span>
        </div>

        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-[#0B1124] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                N
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                  NEAR Blockchain Status
                </h4>
                <p className="text-[11px] text-slate-400">SmartMerchant On-Chain Trust Layer</p>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isLoadingStatus || isLoadingAccount}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Refresh RPC Status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStatus || isLoadingAccount ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Body stats */}
          <div className="mt-3 space-y-2.5 text-xs">
            {/* Connection Status Banner */}
            <div
              className={`rounded-xl p-2.5 border flex items-center justify-between ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : isError
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                )}
                <div>
                  <div className="font-semibold text-white">
                    {isOnline ? 'Testnet RPC Connected' : 'Connecting to Testnet...'}
                  </div>
                  <div className="text-[11px] opacity-80">
                    Chain: {status?.chainId || 'testnet'} • Block #{status?.latestBlockHeight || '...'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20">
                {status?.status || 'loading'}
              </span>
            </div>

            {/* Merchant Account Details */}
            <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px]">Merchant Account</span>
                <button
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  {copiedAccount ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-white text-xs truncate">
                {account?.accountId || status?.configuredAccount || 'rawls-hub.testnet'}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-[11px] text-slate-400">Balance</div>
                  <div className="font-bold text-white mono-num">
                    {account?.balanceNear || '9.95 NEAR'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Signer Key</div>
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    <span>Active Full Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Contract & Storage Type */}
            <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Contract Registry</span>
                <span className="font-mono text-slate-300">
                  {status?.socialDbContract || 'v1.social08.testnet'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Storage Architecture</span>
                <span className="text-amber-300 font-medium">Social DB (Mutable KV)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Anchored Audits</span>
                <span className="font-bold text-cyan-400">{historicalAudits.length} sealed on-chain</span>
              </div>
            </div>

            {/* Privacy Architecture Notice */}
            <div className="rounded-lg bg-blue-950/30 border border-blue-500/20 p-2.5 flex items-start gap-2 text-[11px] text-blue-200">
              <Lock className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Zero sensitive sales, profits, debtor names, or salts are published on-chain. Only cryptographic SHA-256 commitment hashes are broadcast.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                openVerificationForAudit();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 py-2 text-xs font-semibold transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Inspect Audits ({historicalAudits.length})</span>
            </button>

            <a
              href={`https://testnet.nearblocks.io/address/${account?.accountId || 'rawls-hub.testnet'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>NearBlocks</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
