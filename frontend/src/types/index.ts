export type NavScreen =
  | 'overview'
  | 'imports'
  | 'explorer'
  | 'budgets'
  | 'anomalies'
  | 'forecasts'
  | 'optimization'
  | 'settings';

export type UserRole = 'ADMIN' | 'ENGINEER' | 'BUDGET_OWNER' | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarInitials: string;
}

export interface CloudAccount {
  id: string;
  externalAccountId: string;
  displayName: string;
  provider: 'AWS';
  connectionStatus: 'ACTIVE' | 'SYNCING' | 'DISCONNECTED';
  defaultRegion: string;
  totalCost: number;
  recordsCount: number;
}

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  checkedAt: string;
}

export interface CostRecord {
  id: string;
  usageDate: string;
  service: string;
  region: string;
  usageType: string;
  currency: string;
  costAmount: number;
  resourceId?: string;
  accountId: string;
  sourceRecordKey?: string;
}

export interface ServiceShare {
  name: string;
  shortName: string;
  cost: number;
  pct: number;
  color: string;
  category: string;
}

export interface ImportErrorDetail {
  rowNumber: number;
  column: string;
  message: string;
  rawData: string;
}

export interface IngestionBatch {
  id: string;
  filename: string;
  accountId: string;
  fingerprint: string;
  status: 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED' | 'PROCESSING';
  acceptedRows: number;
  rejectedRows: number;
  timestamp: string;
  totalCost: number;
  errors?: ImportErrorDetail[];
}

export interface BudgetThreshold {
  percentage: number;
  amount: number;
  triggered: boolean;
  triggeredAt?: string;
}

export interface BudgetConfig {
  id: string;
  name: string;
  limit: number;
  spent: number;
  currency: string;
  period: string;
  account: string;
  thresholds: BudgetThreshold[];
}

export interface BudgetAlertEvent {
  id: string;
  budgetId: string;
  budgetName: string;
  thresholdPercent: number;
  amount: number;
  triggeredAt: string;
  dedupeKey: string;
  status: 'DISPATCHED' | 'ACKNOWLEDGED';
}

export interface AnomalyFinding {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  service: string;
  account: string;
  region: string;
  usageDate: string;
  observedCost: number;
  baselineCost: number;
  deltaCost: number;
  deviationPct: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';
  explanation: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface OptimizationCandidate {
  id: string;
  resourceId: string;
  service: string;
  recommendationType: string;
  currentType: string;
  recommendedType: string;
  estimatedMonthlySavings: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  metricReason: string;
  lookbackDays: number;
  status: 'PENDING' | 'APPROVED' | 'DISMISSED' | 'DEFERRED';
  reviewNotes?: string;
  reviewedAt?: string;
  popular?: boolean;
}
