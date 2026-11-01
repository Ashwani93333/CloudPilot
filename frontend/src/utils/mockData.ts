import {
  UserProfile,
  CloudAccount,
  CostRecord,
  IngestionBatch,
  BudgetConfig,
  BudgetAlertEvent,
  AnomalyFinding,
  OptimizationCandidate
} from '../types';

export const MOCK_USERS: Record<string, UserProfile> = {
  ADMIN: {
    id: 'user-001',
    name: 'Alex FinOps',
    email: 'admin@cloudpilot.internal',
    role: 'ADMIN',
    title: 'Principal FinOps Architect',
    avatarInitials: 'AF',
  },
  ENGINEER: {
    id: 'user-002',
    name: 'Sarah DevOps',
    email: 'engineer@cloudpilot.internal',
    role: 'ENGINEER',
    title: 'Staff SRE & Infrastructure Engineer',
    avatarInitials: 'SD',
  },
  BUDGET_OWNER: {
    id: 'user-003',
    name: 'Elena Finance',
    email: 'budget@cloudpilot.internal',
    role: 'BUDGET_OWNER',
    title: 'Director of Cloud Financial Management',
    avatarInitials: 'EF',
  },
  VIEWER: {
    id: 'user-004',
    name: 'Marcus Auditor',
    email: 'viewer@cloudpilot.internal',
    role: 'VIEWER',
    title: 'Compliance & Security Auditor',
    avatarInitials: 'MA',
  },
};

export const MOCK_ACCOUNTS: CloudAccount[] = [
  {
    id: 'acc-prod',
    externalAccountId: '111122223333',
    displayName: 'Primary Production AWS',
    provider: 'AWS',
    connectionStatus: 'ACTIVE',
    defaultRegion: 'us-east-1',
    totalCost: 208.0,
    recordsCount: 21,
  },
  {
    id: 'acc-stg',
    externalAccountId: '222233334444',
    displayName: 'Staging & Sandbox AWS',
    provider: 'AWS',
    connectionStatus: 'ACTIVE',
    defaultRegion: 'us-west-2',
    totalCost: 84.2,
    recordsCount: 12,
  },
];

export const INITIAL_COST_RECORDS: CostRecord[] = [
  // Primary Account (111122223333) - Exactly 21 reconciled rows = $208.000000
  { id: 'rec-01', usageDate: '2026-10-01', service: 'AmazonEC2', region: 'us-east-1', usageType: 'BoxUsage:t3.medium', currency: 'USD', costAmount: 14.50, resourceId: 'i-0a1b2c3d4e5f0001', accountId: '111122223333', sourceRecordKey: 'k-01' },
  { id: 'rec-02', usageDate: '2026-10-01', service: 'AmazonEC2', region: 'us-east-1', usageType: 'EBS:VolumeUsage.gp3', currency: 'USD', costAmount: 3.20, resourceId: 'vol-0123456789abcdef0', accountId: '111122223333', sourceRecordKey: 'k-02' },
  { id: 'rec-03', usageDate: '2026-10-01', service: 'AmazonRDS', region: 'us-east-1', usageType: 'InstanceUsage:db.t3.medium', currency: 'USD', costAmount: 18.75, resourceId: 'rds-prod-primary', accountId: '111122223333', sourceRecordKey: 'k-03' },
  { id: 'rec-04', usageDate: '2026-10-01', service: 'AmazonS3', region: 'us-east-1', usageType: 'StandardStorage', currency: 'USD', costAmount: 5.40, resourceId: 's3-company-datalake-prod', accountId: '111122223333', sourceRecordKey: 'k-04' },
  { id: 'rec-05', usageDate: '2026-10-01', service: 'AWSLambda', region: 'us-east-1', usageType: 'Lambda-GB-Second', currency: 'USD', costAmount: 1.85, resourceId: 'arn:aws:lambda:us-east-1:111122223333:function:billing-sync', accountId: '111122223333', sourceRecordKey: 'k-05' },
  { id: 'rec-06', usageDate: '2026-10-02', service: 'AmazonEC2', region: 'us-east-1', usageType: 'BoxUsage:t3.medium', currency: 'USD', costAmount: 14.50, resourceId: 'i-0a1b2c3d4e5f0001', accountId: '111122223333', sourceRecordKey: 'k-06' },
  { id: 'rec-07', usageDate: '2026-10-02', service: 'AmazonEC2', region: 'us-east-1', usageType: 'EBS:VolumeUsage.gp3', currency: 'USD', costAmount: 3.20, resourceId: 'vol-0123456789abcdef0', accountId: '111122223333', sourceRecordKey: 'k-07' },
  { id: 'rec-08', usageDate: '2026-10-02', service: 'AmazonRDS', region: 'us-east-1', usageType: 'InstanceUsage:db.t3.medium', currency: 'USD', costAmount: 18.75, resourceId: 'rds-prod-primary', accountId: '111122223333', sourceRecordKey: 'k-08' },
  { id: 'rec-09', usageDate: '2026-10-02', service: 'AmazonS3', region: 'us-east-1', usageType: 'StandardStorage', currency: 'USD', costAmount: 5.42, resourceId: 's3-company-datalake-prod', accountId: '111122223333', sourceRecordKey: 'k-09' },
  { id: 'rec-10', usageDate: '2026-10-02', service: 'AWSLambda', region: 'us-east-1', usageType: 'Lambda-GB-Second', currency: 'USD', costAmount: 2.10, resourceId: 'arn:aws:lambda:us-east-1:111122223333:function:billing-sync', accountId: '111122223333', sourceRecordKey: 'k-10' },
  { id: 'rec-11', usageDate: '2026-10-03', service: 'AmazonEC2', region: 'us-east-1', usageType: 'BoxUsage:t3.medium', currency: 'USD', costAmount: 14.50, resourceId: 'i-0a1b2c3d4e5f0001', accountId: '111122223333', sourceRecordKey: 'k-11' },
  { id: 'rec-12', usageDate: '2026-10-03', service: 'AmazonEC2', region: 'us-east-1', usageType: 'EBS:VolumeUsage.gp3', currency: 'USD', costAmount: 3.20, resourceId: 'vol-0123456789abcdef0', accountId: '111122223333', sourceRecordKey: 'k-12' },
  { id: 'rec-13', usageDate: '2026-10-03', service: 'AmazonRDS', region: 'us-east-1', usageType: 'InstanceUsage:db.t3.medium', currency: 'USD', costAmount: 18.75, resourceId: 'rds-prod-primary', accountId: '111122223333', sourceRecordKey: 'k-13' },
  { id: 'rec-14', usageDate: '2026-10-03', service: 'AmazonS3', region: 'us-east-1', usageType: 'StandardStorage', currency: 'USD', costAmount: 5.45, resourceId: 's3-company-datalake-prod', accountId: '111122223333', sourceRecordKey: 'k-14' },
  { id: 'rec-15', usageDate: '2026-10-03', service: 'AmazonCloudWatch', region: 'us-east-1', usageType: 'MetricStorage', currency: 'USD', costAmount: 0.95, resourceId: 'cw-metrics-prod', accountId: '111122223333', sourceRecordKey: 'k-15' },
  { id: 'rec-16', usageDate: '2026-10-04', service: 'AmazonEC2', region: 'us-east-1', usageType: 'BoxUsage:t3.medium', currency: 'USD', costAmount: 14.50, resourceId: 'i-0a1b2c3d4e5f0001', accountId: '111122223333', sourceRecordKey: 'k-16' },
  { id: 'rec-17', usageDate: '2026-10-04', service: 'AmazonRDS', region: 'us-east-1', usageType: 'InstanceUsage:db.t3.medium', currency: 'USD', costAmount: 18.75, resourceId: 'rds-prod-primary', accountId: '111122223333', sourceRecordKey: 'k-17' },
  { id: 'rec-18', usageDate: '2026-10-04', service: 'AmazonS3', region: 'us-east-1', usageType: 'StandardStorage', currency: 'USD', costAmount: 5.48, resourceId: 's3-company-datalake-prod', accountId: '111122223333', sourceRecordKey: 'k-18' },
  { id: 'rec-19', usageDate: '2026-10-05', service: 'AmazonEC2', region: 'us-east-1', usageType: 'BoxUsage:t3.medium', currency: 'USD', costAmount: 14.50, resourceId: 'i-0a1b2c3d4e5f0001', accountId: '111122223333', sourceRecordKey: 'k-19' },
  { id: 'rec-20', usageDate: '2026-10-05', service: 'AmazonRDS', region: 'us-east-1', usageType: 'InstanceUsage:db.t3.medium', currency: 'USD', costAmount: 18.75, resourceId: 'rds-prod-primary', accountId: '111122223333', sourceRecordKey: 'k-20' },
  { id: 'rec-21', usageDate: '2026-10-05', service: 'AmazonS3', region: 'us-east-1', usageType: 'StandardStorage', currency: 'USD', costAmount: 5.50, resourceId: 's3-company-datalake-prod', accountId: '111122223333', sourceRecordKey: 'k-21' },

  // Staging Account (222233334444)
  { id: 'stg-01', usageDate: '2026-10-01', service: 'AmazonEC2', region: 'us-west-2', usageType: 'BoxUsage:t3.small', currency: 'USD', costAmount: 7.25, resourceId: 'i-stg-001', accountId: '222233334444', sourceRecordKey: 'ks-01' },
  { id: 'stg-02', usageDate: '2026-10-01', service: 'AmazonRDS', region: 'us-west-2', usageType: 'InstanceUsage:db.t3.small', currency: 'USD', costAmount: 9.40, resourceId: 'rds-stg-001', accountId: '222233334444', sourceRecordKey: 'ks-02' },
  { id: 'stg-03', usageDate: '2026-10-02', service: 'AmazonEC2', region: 'us-west-2', usageType: 'BoxUsage:t3.small', currency: 'USD', costAmount: 7.25, resourceId: 'i-stg-001', accountId: '222233334444', sourceRecordKey: 'ks-03' },
  { id: 'stg-04', usageDate: '2026-10-03', service: 'AmazonEC2', region: 'us-west-2', usageType: 'BoxUsage:t3.small', currency: 'USD', costAmount: 7.25, resourceId: 'i-stg-001', accountId: '222233334444', sourceRecordKey: 'ks-04' },
];

export const INITIAL_BATCHES: IngestionBatch[] = [
  {
    id: 'batch-001',
    filename: 'sample_billing_valid.csv',
    accountId: '111122223333',
    fingerprint: '8f2a9c4e1b7d5a0c3b8e4f1a9d2c6e...',
    status: 'COMPLETED',
    acceptedRows: 21,
    rejectedRows: 0,
    timestamp: '2026-10-24 18:30 UTC',
    totalCost: 208.0,
  },
];

export const INITIAL_BUDGETS: BudgetConfig[] = [
  {
    id: 'bgt-eng-001',
    name: 'Production Engineering Cloud Budget',
    limit: 1500.0,
    spent: 208.0,
    currency: 'USD',
    period: 'OCTOBER 2026',
    account: '111122223333',
    thresholds: [
      { percentage: 50, amount: 750.0, triggered: false },
      { percentage: 80, amount: 1200.0, triggered: false },
      { percentage: 100, amount: 1500.0, triggered: false },
    ],
  },
  {
    id: 'bgt-stg-002',
    name: 'Staging & Sandbox Experiments Budget',
    limit: 500.0,
    spent: 84.2,
    currency: 'USD',
    period: 'OCTOBER 2026',
    account: '222233334444',
    thresholds: [
      { percentage: 50, amount: 250.0, triggered: false },
      { percentage: 80, amount: 400.0, triggered: false },
      { percentage: 100, amount: 500.0, triggered: false },
    ],
  },
];

export const INITIAL_ALERTS: BudgetAlertEvent[] = [
  {
    id: 'alt-001',
    budgetId: 'bgt-eng-001',
    budgetName: 'Production Engineering Cloud Budget',
    thresholdPercent: 50,
    amount: 750.0,
    triggeredAt: '2026-10-24 18:30 UTC',
    dedupeKey: 'bgt-eng-001:2026-10-01:50',
    status: 'DISPATCHED',
  },
];

export const INITIAL_ANOMALIES: AnomalyFinding[] = [
  {
    id: 'anom-001',
    severity: 'HIGH',
    service: 'AmazonEC2',
    account: '111122223333',
    region: 'us-east-1',
    usageDate: '2026-10-06',
    observedCost: 185.0,
    baselineCost: 14.5,
    deltaCost: 170.5,
    deviationPct: 1175,
    status: 'NEW',
    explanation:
      'Observed spend ($185.00) exceeded 14-day rolling median baseline ($14.50) by +1175% (+ $170.50 delta). Triggered on BoxUsage:t3.medium in account 111122223333.',
  },
  {
    id: 'anom-002',
    severity: 'MEDIUM',
    service: 'AmazonRDS',
    account: '111122223333',
    region: 'us-east-1',
    usageDate: '2026-10-04',
    observedCost: 28.5,
    baselineCost: 18.75,
    deltaCost: 9.75,
    deviationPct: 52,
    status: 'ACKNOWLEDGED',
    explanation:
      'InstanceUsage:db.t3.medium experienced temporary read replica connection burst (+52% deviation).',
    reviewNotes: 'Verified with data team — manual ETL backfill run on Oct 04.',
    reviewedBy: 'Sarah DevOps',
    reviewedAt: '2026-10-25 09:15 UTC',
  },
];

export const INITIAL_OPTIMIZATION_CANDIDATES: OptimizationCandidate[] = [
  {
    id: 'opt-001',
    resourceId: 'i-0a1b2c3d4e5f0001',
    service: 'AmazonEC2',
    recommendationType: 'EC2 Instance Rightsizing',
    currentType: 't3.medium (2 vCPU, 4 GiB RAM)',
    recommendedType: 't3.small (2 vCPU, 2 GiB RAM)',
    estimatedMonthlySavings: 14.5,
    confidence: 'HIGH',
    metricReason: 'Average CPU utilization < 3.2% and P99 memory < 38% consistently over past 14 days.',
    lookbackDays: 14,
    status: 'PENDING',
    popular: true,
  },
  {
    id: 'opt-002',
    resourceId: 'rds-prod-primary',
    service: 'AmazonRDS',
    recommendationType: 'RDS Instance Rightsizing',
    currentType: 'db.t3.medium (2 vCPU, 4 GiB RAM)',
    recommendedType: 'db.t3.small (2 vCPU, 2 GiB RAM)',
    estimatedMonthlySavings: 9.3,
    confidence: 'MEDIUM',
    metricReason: 'Database connections average < 8 concurrent; CPU headroom exceeds 72% across 30 days.',
    lookbackDays: 30,
    status: 'PENDING',
  },
  {
    id: 'opt-003',
    resourceId: 'vol-0123456789abcdef0',
    service: 'AmazonEC2',
    recommendationType: 'Unattached EBS Volume Cleanup',
    currentType: 'gp3 (100 GiB, 3000 IOPS)',
    recommendedType: 'Snapshot & Delete Detached Volume',
    estimatedMonthlySavings: 3.2,
    confidence: 'HIGH',
    metricReason: 'EBS volume in state "available" (detached from EC2 instance) for 18 consecutive days.',
    lookbackDays: 18,
    status: 'PENDING',
  },
  {
    id: 'opt-004',
    resourceId: 's3-company-datalake-prod',
    service: 'AmazonS3',
    recommendationType: 'S3 Infrequent Access Lifecycle Policy',
    currentType: 'S3 Standard Tier',
    recommendedType: 'Transition to S3 Standard-IA (30 days)',
    estimatedMonthlySavings: 1.8,
    confidence: 'HIGH',
    metricReason: 'Over 85% of objects in prefix /raw-logs/ have not been accessed in > 45 days.',
    lookbackDays: 45,
    status: 'PENDING',
  },
];

