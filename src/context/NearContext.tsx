import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface NearStatus {
  network: string;
  rpcUrl: string;
  chainId: string;
  latestBlockHeight: number;
  latestBlockHash: string;
  latestBlockTime: string;
  socialDbContract: string;
  configuredAccount: string;
  status: 'online' | 'disconnected' | 'error' | 'loading';
  error?: string;
}

export interface NearAccount {
  accountId: string;
  publicKey: string;
  balanceNear: string;
  storageUsageBytes: number;
  activeKeyVerified: boolean;
  accessKeyCount: number;
  network: string;
  explorerUrl: string;
}

export interface NearAuditRecord {
  auditId: string;
  periodDate: string;
  storeName: string;
  commitmentHash: string;
  metrics: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    inventoryValuation: number;
    outstandingReceivables: number;
    completedSalesCount?: number;
    activeDebtorsCount?: number;
  };
  timestamp: string;
  txHash: string;
  blockHash: string;
  blockHeight: number | string;
  nearBlocksUrl: string;
  status: 'confirmed' | 'failed';
  contractId: string;
}

export interface VerificationResult {
  success: boolean;
  verifiedOnChain: boolean;
  auditId: string;
  contractId: string;
  onChainData?: {
    auditId: string;
    commitmentHash: string;
    periodDate: string;
    store: string;
    timestamp: string;
    schema?: string;
    note?: string;
    metricsSummary?: any;
  };
  localRecord?: NearAuditRecord | null;
  cryptographicProofVerified?: boolean;
  storageType?: string;
  explorerUrl?: string;
  error?: string;
}

interface NearContextType {
  status: NearStatus | null;
  account: NearAccount | null;
  historicalAudits: NearAuditRecord[];
  isLoadingStatus: boolean;
  isLoadingAccount: boolean;
  isLoadingAudits: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  refreshAudits: () => Promise<void>;
  anchorAudit: (payload: {
    periodDate: string;
    storeName: string;
    metrics: any;
    note?: string;
  }) => Promise<{ success: boolean; isDuplicatePrevented?: boolean; audit?: NearAuditRecord; error?: string }>;
  verifyAudit: (auditId: string) => Promise<VerificationResult>;
  isAnchorModalOpen: boolean;
  setIsAnchorModalOpen: (open: boolean) => void;
  isVerificationDrawerOpen: boolean;
  setIsVerificationDrawerOpen: (open: boolean) => void;
  selectedAuditId: string | null;
  setSelectedAuditId: (id: string | null) => void;
  openVerificationForAudit: (auditId?: string) => void;
}

const NearContext = createContext<NearContextType | undefined>(undefined);

export const NearProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<NearStatus | null>({
    network: 'testnet',
    rpcUrl: 'https://rpc.testnet.near.org',
    chainId: 'testnet',
    latestBlockHeight: 0,
    latestBlockHash: '',
    latestBlockTime: '',
    socialDbContract: 'v1.social08.testnet',
    configuredAccount: 'rawls-hub.testnet',
    status: 'loading',
  });
  const [account, setAccount] = useState<NearAccount | null>(null);
  const [historicalAudits, setHistoricalAudits] = useState<NearAuditRecord[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state for modals & drawers
  const [isAnchorModalOpen, setIsAnchorModalOpen] = useState(false);
  const [isVerificationDrawerOpen, setIsVerificationDrawerOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/near/status');
      const data = await res.json();
      if (data.success) {
        setStatus({
          network: data.network || 'testnet',
          rpcUrl: data.rpcUrl || 'https://rpc.testnet.near.org',
          chainId: data.chainId || 'testnet',
          latestBlockHeight: data.latestBlockHeight || 0,
          latestBlockHash: data.latestBlockHash || '',
          latestBlockTime: data.latestBlockTime || '',
          socialDbContract: data.socialDbContract || 'v1.social08.testnet',
          configuredAccount: data.configuredAccount || 'rawls-hub.testnet',
          status: 'online',
        });
        setError(null);
      } else {
        setStatus((prev) => (prev ? { ...prev, status: 'error', error: data.error } : null));
        setError(data.error || 'Failed to fetch NEAR status');
      }
    } catch (err: any) {
      console.error('Failed to load NEAR status:', err);
      setStatus((prev) => (prev ? { ...prev, status: 'disconnected', error: err.message } : null));
      setError('Cannot connect to NEAR Testnet RPC');
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    setIsLoadingAccount(true);
    try {
      const res = await fetch('/api/near/account');
      const data = await res.json();
      if (data.success) {
        setAccount({
          accountId: data.accountId,
          publicKey: data.publicKey,
          balanceNear: data.balanceNear,
          storageUsageBytes: data.storageUsageBytes,
          activeKeyVerified: data.activeKeyVerified,
          accessKeyCount: data.accessKeyCount,
          network: data.network,
          explorerUrl: data.explorerUrl,
        });
      }
    } catch (err: any) {
      console.error('Failed to load NEAR account:', err);
    } finally {
      setIsLoadingAccount(false);
    }
  }, []);

  const refreshAudits = useCallback(async () => {
    setIsLoadingAudits(true);
    try {
      const res = await fetch('/api/near/audits');
      const data = await res.json();
      if (data.success && Array.isArray(data.audits)) {
        setHistoricalAudits(data.audits);
      }
    } catch (err: any) {
      console.error('Failed to load historical audits:', err);
    } finally {
      setIsLoadingAudits(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    refreshAccount();
    refreshAudits();

    // Poll RPC status gently every 60s
    const timer = setInterval(() => {
      refreshStatus();
    }, 60000);

    return () => clearInterval(timer);
  }, [refreshStatus, refreshAccount, refreshAudits]);

  const anchorAudit = async (payload: {
    periodDate: string;
    storeName: string;
    metrics: any;
    note?: string;
  }) => {
    try {
      const res = await fetch('/api/near/anchor-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        await refreshAudits();
        await refreshAccount();
        return {
          success: true,
          isDuplicatePrevented: !!data.isDuplicatePrevented,
          audit: data.audit,
        };
      } else {
        return {
          success: false,
          error: data.error || data.details || 'Failed to anchor audit on NEAR',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error broadcasting to NEAR',
      };
    }
  };

  const verifyAudit = async (auditId: string): Promise<VerificationResult> => {
    try {
      const res = await fetch(`/api/near/verify-audit/${encodeURIComponent(auditId)}`);
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        verifiedOnChain: false,
        auditId,
        contractId: 'v1.social08.testnet',
        error: err.message || 'Failed to verify audit on NEAR',
      };
    }
  };

  const openVerificationForAudit = (auditId?: string) => {
    if (auditId) {
      setSelectedAuditId(auditId);
    } else if (historicalAudits.length > 0) {
      setSelectedAuditId(historicalAudits[0].auditId);
    }
    setIsVerificationDrawerOpen(true);
  };

  return (
    <NearContext.Provider
      value={{
        status,
        account,
        historicalAudits,
        isLoadingStatus,
        isLoadingAccount,
        isLoadingAudits,
        error,
        refreshStatus,
        refreshAccount,
        refreshAudits,
        anchorAudit,
        verifyAudit,
        isAnchorModalOpen,
        setIsAnchorModalOpen,
        isVerificationDrawerOpen,
        setIsVerificationDrawerOpen,
        selectedAuditId,
        setSelectedAuditId,
        openVerificationForAudit,
      }}
    >
      {children}
    </NearContext.Provider>
  );
};

export const useNear = (): NearContextType => {
  const context = useContext(NearContext);
  if (!context) {
    throw new Error('useNear must be used within a NearProvider');
  }
  return context;
};
