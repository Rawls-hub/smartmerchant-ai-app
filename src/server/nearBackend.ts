import type { Request, Response, Express } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Account, JsonRpcProvider, KeyPairSigner, KeyPair, actions, formatNearAmount } from 'near-api-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const LEDGER_FILE = path.join(ROOT_DIR, '.near-audit-ledger.json');
const CREDENTIALS_FILE = path.join(ROOT_DIR, '.near-credentials.json');

// Enforce NEAR Testnet for the hackathon integration (prevent hostile mainnet env var overrides)
const NETWORK_ID =
  process.env.NEAR_NETWORK && process.env.NEAR_NETWORK !== 'mainnet'
    ? process.env.NEAR_NETWORK
    : 'testnet';

const RPC_URL =
  process.env.NEAR_RPC_URL && !process.env.NEAR_RPC_URL.includes('mainnet')
    ? process.env.NEAR_RPC_URL
    : 'https://rpc.testnet.near.org';

const SOCIAL_DB_CONTRACT =
  process.env.NEAR_SOCIAL_DB_CONTRACT &&
  !process.env.NEAR_SOCIAL_DB_CONTRACT.startsWith('http') &&
  !process.env.NEAR_SOCIAL_DB_CONTRACT.includes('nearblocks')
    ? process.env.NEAR_SOCIAL_DB_CONTRACT
    : 'v1.social08.testnet';

interface StoredCredentials {
  accountId: string;
  publicKey: string;
  privateKey: string;
}

export interface AuditMetrics {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  inventoryValuation: number;
  outstandingReceivables: number;
  completedSalesCount?: number;
  activeDebtorsCount?: number;
}

export interface AuditRecord {
  auditId: string;
  periodDate: string;
  storeName: string;
  commitmentHash: string;
  salt: string;
  metrics: AuditMetrics;
  timestamp: string;
  txHash: string;
  blockHash: string;
  blockHeight: number | string;
  nearBlocksUrl: string;
  status: 'confirmed' | 'failed';
  contractId: string;
}

// Helper to get or load credentials safely (server-side only)
function loadCredentials(): StoredCredentials {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    if (data.accountId && data.privateKey) {
      return data;
    }
  }

  const envAccountId = process.env.NEAR_ACCOUNT_ID;
  const envPrivateKey = process.env.NEAR_PRIVATE_KEY;

  if (envAccountId && envPrivateKey && !envPrivateKey.includes('YOUR_PRIVATE_KEY')) {
    const kp = KeyPair.fromString(envPrivateKey as any);
    return {
      accountId: envAccountId,
      publicKey: process.env.NEAR_PUBLIC_KEY || kp.getPublicKey().toString(),
      privateKey: envPrivateKey,
    };
  }

  throw new Error('NEAR credentials not configured. Please check .near-credentials.json or environment variables.');
}

// Load or initialize the audit ledger
function loadLedger(): AuditRecord[] {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const data = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Could not read existing ledger, initializing fresh:', err);
  }
  return [];
}

// Save audit ledger safely
function saveLedger(ledger: AuditRecord[]) {
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist audit ledger to disk:', err);
  }
}

// Deterministic canonical JSON stringification
function canonicalizeObject(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeObject).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalizeObject(obj[k])}`);
  return '{' + pairs.join(',') + '}';
}

// Compute salted SHA-256 cryptographic commitment hash
export function generateAuditCommitmentHash(
  storeName: string,
  periodDate: string,
  metrics: AuditMetrics,
  salt: string
): string {
  const canonicalPayload = canonicalizeObject({
    periodDate,
    storeName,
    salt,
    revenue: Math.round(metrics.revenue),
    cogs: Math.round(metrics.cogs),
    grossProfit: Math.round(metrics.grossProfit),
    operatingExpenses: Math.round(metrics.operatingExpenses),
    netProfit: Math.round(metrics.netProfit),
    inventoryValuation: Math.round(metrics.inventoryValuation),
    outstandingReceivables: Math.round(metrics.outstandingReceivables),
  });

  return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
}

export function mountNearBackendRoutes(app: Express) {
  const provider = new JsonRpcProvider({ url: RPC_URL });

  // 1. GET /api/near/status - Live NEAR Testnet RPC status
  app.get('/api/near/status', async (_req: Request, res: Response) => {
    try {
      const statusRes: any = await provider.viewNodeStatus();
      let creds: StoredCredentials | null = null;
      try {
        creds = loadCredentials();
      } catch {
        // credentials optional for general status
      }

      res.json({
        success: true,
        network: NETWORK_ID,
        rpcUrl: RPC_URL,
        chainId: statusRes.chain_id,
        latestBlockHeight: statusRes.sync_info?.latest_block_height || 0,
        latestBlockHash: statusRes.sync_info?.latest_block_hash || '',
        latestBlockTime: statusRes.sync_info?.latest_block_time || '',
        socialDbContract: SOCIAL_DB_CONTRACT,
        configuredAccount: creds?.accountId || 'rawls-hub.testnet',
        status: 'online',
      });
    } catch (err: any) {
      console.error('NEAR status check failed:', err);
      res.status(500).json({
        success: false,
        error: 'Unable to reach NEAR Testnet RPC endpoint',
        details: err.message,
      });
    }
  });

  // 2. GET /api/near/account - Account verification endpoint
  app.get('/api/near/account', async (_req: Request, res: Response) => {
    try {
      const creds = loadCredentials();
      const signer = KeyPairSigner.fromSecretKey(creds.privateKey as any);
      const account = new Account(creds.accountId, provider, signer);

      // Verify active access keys on-chain
      const accessKeyList = await account.getAccessKeyList();
      const activeKeys = accessKeyList?.keys || [];
      const isKeyActive = activeKeys.some((k: any) => k.public_key === creds.publicKey);

      // Fetch on-chain state (balance, storage usage)
      const state: any = await account.getState();
      const balanceNear = state?.balance?.total
        ? formatNearAmount(state.balance.total.toString(), 4)
        : '0';

      res.json({
        success: true,
        accountId: creds.accountId,
        publicKey: creds.publicKey,
        balanceNear: `${balanceNear} NEAR`,
        storageUsageBytes: state?.storageUsage || 0,
        activeKeyVerified: isKeyActive,
        accessKeyCount: activeKeys.length,
        network: NETWORK_ID,
        explorerUrl: `https://testnet.nearblocks.io/address/${creds.accountId}`,
      });
    } catch (err: any) {
      console.error('NEAR account verification failed:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to verify NEAR account on-chain',
        details: err.message,
      });
    }
  });

  // 3. POST /api/near/anchor-audit - Execute signed Social DB transaction
  app.post('/api/near/anchor-audit', async (req: Request, res: Response) => {
    try {
      const { periodDate, metrics, storeName, note } = req.body;

      if (!periodDate || !metrics) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: periodDate and metrics are mandatory.',
        });
      }

      const effectiveStoreName = storeName || 'Rawls & Hub';
      const cleanMetrics: AuditMetrics = {
        revenue: Number(metrics.revenue) || 0,
        cogs: Number(metrics.cogs) || 0,
        grossProfit: Number(metrics.grossProfit) || 0,
        operatingExpenses: Number(metrics.operatingExpenses) || 0,
        netProfit: Number(metrics.netProfit) || 0,
        inventoryValuation: Number(metrics.inventoryValuation) || 0,
        outstandingReceivables: Number(metrics.outstandingReceivables) || 0,
        completedSalesCount: Number(metrics.completedSalesCount) || 0,
        activeDebtorsCount: Number(metrics.activeDebtorsCount) || 0,
      };

      // Durable Duplicate-Submission Prevention
      const ledger = loadLedger();
      const existingRecord = ledger.find(
        (r) =>
          r.periodDate === periodDate &&
          r.storeName === effectiveStoreName &&
          r.status === 'confirmed' &&
          Math.abs(r.metrics.revenue - cleanMetrics.revenue) < 1 &&
          Math.abs(r.metrics.netProfit - cleanMetrics.netProfit) < 1
      );

      // Helper to sanitize server audit record before sending to frontend (strip private salt)
      const sanitizeForClient = (record: AuditRecord) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { salt, ...safeRecord } = record;
        return safeRecord;
      };

      if (existingRecord) {
        return res.json({
          success: true,
          isDuplicatePrevented: true,
          message: `Audit for ${periodDate} is already sealed and verified on NEAR Testnet.`,
          audit: sanitizeForClient(existingRecord),
        });
      }

      // Generate random salt and cryptographic commitment
      const salt = crypto.randomBytes(32).toString('hex');
      const commitmentHash = generateAuditCommitmentHash(effectiveStoreName, periodDate, cleanMetrics, salt);
      const auditId = `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const timestamp = new Date().toISOString();

      // Load credentials & verify signer
      const creds = loadCredentials();
      const signer = KeyPairSigner.fromSecretKey(creds.privateKey as any);
      const account = new Account(creds.accountId, provider, signer);

      // Verify signing key matches active on-chain access key before broadcasting
      const keyList = await account.getAccessKeyList();
      const hasActiveKey = (keyList?.keys || []).some((k: any) => k.public_key === creds.publicKey);
      if (!hasActiveKey) {
        throw new Error(`Signing key (${creds.publicKey}) is not an active access key on account ${creds.accountId}.`);
      }

      // Prepare Privacy-Preserving Social DB leaf payload:
      // ZERO revenue, profit, debts, customer data, or verification salt are published on-chain.
      // Strictly stores the cryptographic commitment hash and non-sensitive metadata.
      const onChainRecordString = JSON.stringify({
        auditId,
        commitmentHash,
        periodDate,
        store: effectiveStoreName,
        schema: 'smartmerchant.near/audit-commitment.v1',
        timestamp,
        note: note || 'Rawls & Hub Cryptographic Audit Commitment',
      });

      const socialDbData = {
        [creds.accountId]: {
          smartmerchant_audits: {
            [auditId]: onChainRecordString,
          },
        },
      };

      // Broadcast signed transaction
      const txOutcome = await account.signAndSendTransaction({
        receiverId: SOCIAL_DB_CONTRACT,
        actions: [
          actions.functionCall(
            'set',
            { data: socialDbData },
            30000000000000n, // 30 TGas
            50000000000000000000000n // 0.05 NEAR storage deposit
          ),
        ],
        waitUntil: 'FINAL',
      });

      const txHash = txOutcome.transaction.hash;
      const blockHash = txOutcome.transaction_outcome.block_hash;

      // Query block for confirmed block height
      let blockHeight: number | string = 'Confirmed';
      try {
        const blockInfo: any = await provider.viewBlock({ blockId: blockHash });
        if (blockInfo?.header?.height) {
          blockHeight = blockInfo.header.height;
        }
      } catch (err) {
        console.warn('Could not fetch block height for hash:', blockHash, err);
      }

      const nearBlocksUrl = `https://testnet.nearblocks.io/txns/${txHash}`;

      const newAuditRecord: AuditRecord = {
        auditId,
        periodDate,
        storeName: effectiveStoreName,
        commitmentHash,
        salt, // kept strictly server-side in ledger file
        metrics: cleanMetrics,
        timestamp,
        txHash,
        blockHash,
        blockHeight,
        nearBlocksUrl,
        status: 'confirmed',
        contractId: SOCIAL_DB_CONTRACT,
      };

      // Persist to local ledger
      ledger.unshift(newAuditRecord);
      saveLedger(ledger);

      res.json({
        success: true,
        audit: sanitizeForClient(newAuditRecord),
      });
    } catch (err: any) {
      console.error('Audit anchoring failed on NEAR:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to broadcast audit transaction to NEAR Testnet',
        details: err.message,
      });
    }
  });

  // 4. GET /api/near/verify-audit/:auditId - Independent on-chain retrieval & verification
  app.get('/api/near/verify-audit/:auditId', async (req: Request, res: Response) => {
    try {
      const { auditId } = req.params;
      const creds = loadCredentials();
      const signer = KeyPairSigner.fromSecretKey(creds.privateKey as any);
      const account = new Account(creds.accountId, provider, signer);

      const ledger = loadLedger();
      const localRecord = ledger.find((r) => r.auditId === auditId);

      // Query Social DB get function directly via account.callFunction
      const onChainResult: any = await account.callFunction({
        contractId: SOCIAL_DB_CONTRACT,
        methodName: 'get',
        args: {
          keys: [`${creds.accountId}/smartmerchant_audits/${auditId}`],
        },
      });

      const onChainRecordStr = onChainResult?.[creds.accountId]?.smartmerchant_audits?.[auditId];

      if (!onChainRecordStr) {
        return res.status(404).json({
          success: false,
          verifiedOnChain: false,
          error: `Audit commitment ${auditId} was not found on Social DB contract (${SOCIAL_DB_CONTRACT}) for ${creds.accountId}.`,
        });
      }

      const onChainParsed = typeof onChainRecordStr === 'string' ? JSON.parse(onChainRecordStr) : onChainRecordStr;

      // Cryptographic verification against server-side deterministic record and secret salt
      let hashMatches = false;
      if (localRecord) {
        const recomputedHash = generateAuditCommitmentHash(
          localRecord.storeName,
          localRecord.periodDate,
          localRecord.metrics,
          localRecord.salt
        );
        hashMatches = recomputedHash === onChainParsed.commitmentHash;
      }

      // Safe local record without secret salt
      let safeLocalRecord: any = null;
      if (localRecord) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { salt, ...rest } = localRecord;
        safeLocalRecord = rest;
      }

      res.json({
        success: true,
        verifiedOnChain: true,
        auditId,
        contractId: SOCIAL_DB_CONTRACT,
        onChainData: onChainParsed,
        localRecord: safeLocalRecord,
        cryptographicProofVerified: hashMatches,
        storageType: 'Mutable Social DB Key-Value Store with Tamper-Evident SHA-256 Commitment Hash',
        explorerUrl: localRecord ? localRecord.nearBlocksUrl : `https://testnet.nearblocks.io/address/${creds.accountId}`,
      });
    } catch (err: any) {
      console.error('Audit verification query failed:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to query and verify audit on NEAR blockchain',
        details: err.message,
      });
    }
  });

  // 5. GET /api/near/audits - List all historical on-chain audits (salt sanitized)
  app.get('/api/near/audits', async (_req: Request, res: Response) => {
    try {
      const ledger = loadLedger();
      const sanitized = ledger.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { salt, ...safe } = r;
        return safe;
      });

      res.json({
        success: true,
        count: sanitized.length,
        audits: sanitized,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
