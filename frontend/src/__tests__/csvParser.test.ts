import { describe, it, expect } from 'vitest';
import {
  parseBillingCsv,
  FIXTURE_VALID_CSV,
  FIXTURE_MALFORMED_CSV,
  computeSha256
} from '../utils/csvParser';

describe('CSV Parser & Ingestion Pipeline', () => {
  it('computes consistent SHA-256 file fingerprints', async () => {
    const hash1 = await computeSha256('sample test content');
    const hash2 = await computeSha256('sample test content');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('reconciles sample_billing_valid.csv to exactly $208.00 and 21 records', async () => {
    const result = await parseBillingCsv(FIXTURE_VALID_CSV);
    expect(result.totalRows).toBe(21);
    expect(result.acceptedRows).toBe(21);
    expect(result.rejectedRows).toBe(0);
    expect(result.totalCost).toBe(208.0);
    expect(result.errors).toHaveLength(0);
  });

  it('detects errors and captures row-level messages on malformed csv', async () => {
    const result = await parseBillingCsv(FIXTURE_MALFORMED_CSV);
    expect(result.acceptedRows).toBe(2);
    expect(result.rejectedRows).toBe(5);
    expect(result.errors.length).toBe(5);
  });
});

