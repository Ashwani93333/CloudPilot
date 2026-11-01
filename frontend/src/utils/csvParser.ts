import { CostRecord, ImportErrorDetail } from '../types';

export interface ParseResult {
  fingerprint: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  totalCost: number;
  records: CostRecord[];
  errors: ImportErrorDetail[];
}

export async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeRecordKey(
  accountId: string,
  usageDate: string,
  service: string,
  region: string,
  usageType: string,
  resourceId?: string
): Promise<string> {
  const rawKey = `${accountId}|${usageDate}|${service}|${region}|${usageType}|${resourceId || ''}`;
  return computeSha256(rawKey);
}

export async function parseBillingCsv(content: string): Promise<ParseResult> {
  const fingerprint = await computeSha256(content);
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return {
      fingerprint,
      totalRows: 0,
      acceptedRows: 0,
      rejectedRows: 0,
      totalCost: 0,
      records: [],
      errors: [{ rowNumber: 1, column: 'file', message: 'File has no data rows', rawData: content }],
    };
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const requiredHeaders = ['usage_date', 'service', 'region', 'usage_type', 'currency', 'cost_amount'];
  const missingHeaders = requiredHeaders.filter((rh) => !headers.includes(rh));

  if (missingHeaders.length > 0) {
    return {
      fingerprint,
      totalRows: lines.length - 1,
      acceptedRows: 0,
      rejectedRows: lines.length - 1,
      totalCost: 0,
      records: [],
      errors: [
        {
          rowNumber: 1,
          column: 'headers',
          message: `Missing required columns: ${missingHeaders.join(', ')}`,
          rawData: lines[0],
        },
      ],
    };
  }

  const records: CostRecord[] = [];
  const errors: ImportErrorDetail[] = [];
  let totalCost = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(',').map((c) => c.trim());

    if (cols.length < headers.length) {
      errors.push({
        rowNumber: i + 1,
        column: 'row',
        message: `Column count mismatch (expected ${headers.length}, got ${cols.length})`,
        rawData: rawLine,
      });
      continue;
    }

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] || '';
    });

    const usageDate = rowObj['usage_date'];
    const service = rowObj['service'];
    const region = rowObj['region'];
    const usageType = rowObj['usage_type'];
    const currency = rowObj['currency'];
    const costAmountStr = rowObj['cost_amount'];
    const resourceId = rowObj['resource_id'] || undefined;
    const accountId = rowObj['account_id'] || '111122223333';

    // 1. Service validation
    if (!service || service.trim().length === 0) {
      errors.push({
        rowNumber: i + 1,
        column: 'service',
        message: 'Service identifier cannot be empty or null',
        rawData: rawLine,
      });
      continue;
    }

    // 2. Date validation (ISO-8601 YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(usageDate) || isNaN(Date.parse(usageDate))) {
      errors.push({
        rowNumber: i + 1,
        column: 'usage_date',
        message: `Invalid ISO-8601 date: '${usageDate}'`,
        rawData: rawLine,
      });
      continue;
    }

    // 3. Numeric & non-negative cost validation
    const costAmount = parseFloat(costAmountStr);
    if (isNaN(costAmount) || costAmount < 0) {
      errors.push({
        rowNumber: i + 1,
        column: 'cost_amount',
        message: `Cost must be non-negative numeric (got: '${costAmountStr}')`,
        rawData: rawLine,
      });
      continue;
    }

    // 4. Currency validation (Strict USD enforced)
    if (currency.toUpperCase() !== 'USD') {
      errors.push({
        rowNumber: i + 1,
        column: 'currency',
        message: `Unsupported currency '${currency}' (Strictly USD enforced)`,
        rawData: rawLine,
      });
      continue;
    }

    const sourceRecordKey = await computeRecordKey(accountId, usageDate, service, region, usageType, resourceId);

    totalCost += costAmount;
    records.push({
      id: `rec-${Date.now()}-${i}`,
      usageDate,
      service,
      region,
      usageType,
      currency,
      costAmount,
      resourceId,
      accountId,
      sourceRecordKey,
    });
  }

  return {
    fingerprint,
    totalRows: lines.length - 1,
    acceptedRows: records.length,
    rejectedRows: errors.length,
    totalCost: parseFloat(totalCost.toFixed(6)),
    records,
    errors,
  };
}

// 4 Built-in Synthetic Fixtures from sample-data/
export const FIXTURE_VALID_CSV = `usage_date,service,region,usage_type,currency,cost_amount,resource_id,account_id
2026-10-01,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-01,AmazonEC2,us-east-1,EBS:VolumeUsage.gp3,USD,3.200000,vol-0123456789abcdef0,111122223333
2026-10-01,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-01,AmazonS3,us-east-1,StandardStorage,USD,5.400000,s3-company-datalake-prod,111122223333
2026-10-01,AWSLambda,us-east-1,Lambda-GB-Second,USD,1.850000,arn:aws:lambda:us-east-1:111122223333:function:billing-sync,111122223333
2026-10-02,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-02,AmazonEC2,us-east-1,EBS:VolumeUsage.gp3,USD,3.200000,vol-0123456789abcdef0,111122223333
2026-10-02,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-02,AmazonS3,us-east-1,StandardStorage,USD,5.420000,s3-company-datalake-prod,111122223333
2026-10-02,AWSLambda,us-east-1,Lambda-GB-Second,USD,2.100000,arn:aws:lambda:us-east-1:111122223333:function:billing-sync,111122223333
2026-10-03,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-03,AmazonEC2,us-east-1,EBS:VolumeUsage.gp3,USD,3.200000,vol-0123456789abcdef0,111122223333
2026-10-03,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-03,AmazonS3,us-east-1,StandardStorage,USD,5.450000,s3-company-datalake-prod,111122223333
2026-10-03,AmazonCloudWatch,us-east-1,MetricStorage,USD,0.950000,cw-metrics-prod,111122223333
2026-10-04,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-04,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-04,AmazonS3,us-east-1,StandardStorage,USD,5.480000,s3-company-datalake-prod,111122223333
2026-10-05,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-05,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-05,AmazonS3,us-east-1,StandardStorage,USD,5.500000,s3-company-datalake-prod,111122223333`;

export const FIXTURE_MALFORMED_CSV = `usage_date,service,region,usage_type,currency,cost_amount,resource_id,account_id
2026-10-01,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
INVALID_DATE,AmazonEC2,us-east-1,EBS:VolumeUsage.gp3,USD,3.200000,vol-0123456789abcdef0,111122223333
2026-10-01,,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-01,AmazonS3,us-east-1,StandardStorage,USD,-99.400000,s3-company-datalake-prod,111122223333
2026-10-01,AWSLambda,us-east-1,Lambda-GB-Second,NOT_A_CURRENCY,1.850000,arn:aws:lambda:us-east-1:111122223333:function:billing-sync,111122223333
2026-10-02,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,NOT_A_NUMBER,i-0a1b2c3d4e5f0001,111122223333
2026-10-02,AmazonEC2,us-east-1,EBS:VolumeUsage.gp3,USD,3.200000,vol-0123456789abcdef0,111122223333`;

export const FIXTURE_OVERLAPPING_CSV = `usage_date,service,region,usage_type,currency,cost_amount,resource_id,account_id
2026-10-01,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-01,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-06,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-06,AmazonRDS,us-east-1,InstanceUsage:db.t3.medium,USD,18.750000,rds-prod-primary,111122223333
2026-10-06,AmazonS3,us-east-1,StandardStorage,USD,5.600000,s3-company-datalake-prod,111122223333`;

export const FIXTURE_SPIKE_CSV = `usage_date,service,region,usage_type,currency,cost_amount,resource_id,account_id
2026-10-01,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-02,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-03,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-04,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-05,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333
2026-10-06,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,185.000000,i-0a1b2c3d4e5f0001,111122223333
2026-10-07,AmazonEC2,us-east-1,BoxUsage:t3.medium,USD,14.500000,i-0a1b2c3d4e5f0001,111122223333`;
