# CloudPilot Synthetic Billing Samples & Reconciliation Reference

This directory contains synthetic billing CSV files engineered according to the **CloudPilot Project Specification & System Design (v1.0)**.

## 1. Schema Definition

| Column | Type | Required | Description |
|---|---|---|---|
| `usage_date` | Date (`YYYY-MM-DD`) | Yes | ISO-8601 date of cloud usage |
| `service` | String (100) | Yes | Cloud service name (e.g. `AmazonEC2`, `AmazonRDS`) |
| `region` | String (50) | Yes | Cloud region identifier (e.g. `us-east-1`) |
| `usage_type` | String (150) | Yes | Usage type or operational metric category |
| `currency` | String (3) | Yes | ISO-4217 3-letter currency code (e.g. `USD`) |
| `cost_amount` | Numeric (19,6) | Yes | Cost incurred; non-negative; stored as BigDecimal |
| `resource_id` | String (255) | Optional | Provider resource identifier or ARN |
| `account_id` | String (50) | Optional | Cloud account / AWS account identifier |

## 2. Deduplication Strategy
1. **File-Level:** SHA-256 hash calculated over binary content. If a file with an identical hash already exists in `billing_imports`, ingestion terminates early with duplicate file warning.
2. **Record-Level (`source_record_key`):**
   `SHA256(account_id + "|" + usage_date + "|" + service + "|" + region + "|" + usage_type + "|" + (resource_id ?? ""))`
   Backed by database `UNIQUE(cloud_account_id, source_record_key)` index to guarantee idempotent imports and eliminate double-counting on overlapping files.

## 3. Dataset Catalog & Reconciliation Benchmarks

### File 1: `sample_billing_valid.csv`
- **Total Rows:** 21 data rows
- **Date Range:** `2026-10-01` to `2026-10-05`
- **Currency:** `USD`
- **Total Incurred Cost:** `$208.000000`

#### Service Breakdown (Expected Reconciled Figures):
| Service | Rows | Total Cost (USD) | Share (%) |
|---|---|---|---|
| `AmazonRDS` | 5 | $93.750000 | 45.07% |
| `AmazonEC2` | 8 | $82.100000 | 39.47% |
| `AmazonS3` | 5 | $27.250000 | 13.10% |
| `AWSLambda` | 2 | $3.950000 | 1.90% |
| `AmazonCloudWatch` | 1 | $0.950000 | 0.46% |
| **Total** | **21** | **$208.000000** | **100.00%** |

#### Daily Breakdown (Expected Reconciled Figures):
| Date | Total Cost (USD) |
|---|---|
| `2026-10-01` | $43.700000 |
| `2026-10-02` | $43.970000 |
| `2026-10-03` | $42.850000 |
| `2026-10-04` | $38.730000 |
| `2026-10-05` | $38.750000 |
| **Total** | **$208.000000** |

---

### File 2: `sample_billing_malformed.csv`
Used to verify CSV row-level error collection, state transitions (`COMPLETED_WITH_ERRORS`), and rejection of malformed records without server crashes:
- Row 2: Invalid date format (`INVALID_DATE`)
- Row 3: Missing service name
- Row 4: Negative cost amount (`-99.400000`)
- Row 5: Invalid currency (`NOT_A_CURRENCY`)
- Row 6: Non-numeric cost (`NOT_A_NUMBER`)
- Expected: 2 valid rows accepted, 5 rows rejected into `billing_import_errors`.

---

### File 3: `sample_billing_overlapping.csv`
Used for Week 4 & Week 10 dedup validation:
- Contains 2 rows identical in `source_record_key` to rows in `sample_billing_valid.csv`.
- Contains 3 new rows for `2026-10-06`.
- Expected: On upload after `sample_billing_valid.csv`, existing keys are skipped/idempotent and only the 3 new rows are inserted ($38.850000), resulting in cumulative grand total of $246.850000 with 0 duplicate counting.

---

### File 4: `sample_billing_spike.csv`
Used for Week 7 Anomaly Detection:
- Baseline days 1–5 have EC2 costs of $14.50.
- Day 6 (`2026-10-06`) injects $185.00 (+1175% deviation).
- Expected: Flags High Severity anomaly with baseline ~$14.50 and absolute deviation +$170.50.
