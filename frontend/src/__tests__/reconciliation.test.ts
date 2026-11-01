import { describe, it, expect } from 'vitest';
import { INITIAL_COST_RECORDS, INITIAL_BUDGETS, INITIAL_ANOMALIES, INITIAL_OPTIMIZATION_CANDIDATES } from '../utils/mockData';

describe('PRD Reconciliation & Ground-Truth Verification', () => {
  it('primary account 111122223333 has exactly 21 records summing to $208.000000', () => {
    const prodRecords = INITIAL_COST_RECORDS.filter((r) => r.accountId === '111122223333');
    expect(prodRecords.length).toBe(21);

    const totalSpend = prodRecords.reduce((acc, curr) => acc + curr.costAmount, 0);
    expect(totalSpend).toBeCloseTo(208.0, 6);
  });

  it('service cost breakdown strictly matches specification figures', () => {
    const prodRecords = INITIAL_COST_RECORDS.filter((r) => r.accountId === '111122223333');
    const serviceMap = prodRecords.reduce((acc, r) => {
      acc[r.service] = (acc[r.service] || 0) + r.costAmount;
      return acc;
    }, {} as Record<string, number>);

    // Reconciled against sample-data/README.md and PRD
    expect(serviceMap['AmazonRDS']).toBeCloseTo(93.75, 4);
    expect(serviceMap['AmazonEC2']).toBeCloseTo(82.10, 4);
    expect(serviceMap['AmazonS3']).toBeCloseTo(27.25, 4);
    expect(serviceMap['AWSLambda']).toBeCloseTo(3.95, 4);
    expect(serviceMap['AmazonCloudWatch']).toBeCloseTo(0.95, 4);
  });

  it('daily spend breakdown matches sample-data benchmarks', () => {
    const prodRecords = INITIAL_COST_RECORDS.filter((r) => r.accountId === '111122223333');
    const dateMap = prodRecords.reduce((acc, r) => {
      acc[r.usageDate] = (acc[r.usageDate] || 0) + r.costAmount;
      return acc;
    }, {} as Record<string, number>);

    expect(dateMap['2026-10-01']).toBeCloseTo(43.70, 4);
    expect(dateMap['2026-10-02']).toBeCloseTo(43.97, 4);
    expect(dateMap['2026-10-03']).toBeCloseTo(42.85, 4);
    expect(dateMap['2026-10-04']).toBeCloseTo(38.73, 4);
    expect(dateMap['2026-10-05']).toBeCloseTo(38.75, 4);
  });

  it('active budget has $1500 limit and thresholds configured', () => {
    const prodBudget = INITIAL_BUDGETS.find((b) => b.account === '111122223333');
    expect(prodBudget).toBeDefined();
    expect(prodBudget?.limit).toBe(1500.0);
    expect(prodBudget?.thresholds).toHaveLength(3);
    expect(prodBudget?.thresholds.map((t) => t.percentage)).toEqual([50, 80, 100]);
  });

  it('contains the high severity EC2 anomaly with +1175% deviation', () => {
    const ec2Spike = INITIAL_ANOMALIES.find((a) => a.id === 'anom-001');
    expect(ec2Spike).toBeDefined();
    expect(ec2Spike?.observedCost).toBe(185.0);
    expect(ec2Spike?.baselineCost).toBe(14.5);
    expect(ec2Spike?.deltaCost).toBe(170.5);
    expect(ec2Spike?.deviationPct).toBe(1175);
    expect(ec2Spike?.severity).toBe('HIGH');
  });

  it('contains non-destructive optimization candidates with lookback evidence', () => {
    expect(INITIAL_OPTIMIZATION_CANDIDATES.length).toBeGreaterThanOrEqual(4);
    const ec2Rightsize = INITIAL_OPTIMIZATION_CANDIDATES.find((c) => c.resourceId === 'i-0a1b2c3d4e5f0001');
    expect(ec2Rightsize).toBeDefined();
    expect(ec2Rightsize?.estimatedMonthlySavings).toBe(14.5);
    expect(ec2Rightsize?.popular).toBe(true);
  });
});

