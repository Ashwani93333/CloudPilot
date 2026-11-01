import { describe, it, expect } from 'vitest';
import { FIXTURE_VALID_CSV } from '../utils/csvParser';

describe('Synthetic Test Fixtures Integrity', () => {
  it('contains valid CSV headers including usage_date, service, currency, cost_amount', () => {
    const firstLine = FIXTURE_VALID_CSV.split('\n')[0];
    expect(firstLine).toContain('usage_date');
    expect(firstLine).toContain('service');
    expect(firstLine).toContain('region');
    expect(firstLine).toContain('usage_type');
    expect(firstLine).toContain('currency');
    expect(firstLine).toContain('cost_amount');
  });

  it('contains exactly 21 lines of usage records', () => {
    const lines = FIXTURE_VALID_CSV.trim().split('\n');
    expect(lines.length).toBe(22); // 1 header + 21 rows
  });
});

