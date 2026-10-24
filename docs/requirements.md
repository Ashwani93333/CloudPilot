# CloudPilot System Requirements & Acceptance Criteria

## 1. Product Summary
CloudPilot is a FinOps and cloud cost intelligence platform providing engineering and finance leadership with real-time cost visibility, multi-dimensional trend analytics, deduplicated budget alerts, statistical anomaly detection, run-rate spend forecasts, and human-reviewed optimization candidates.

## 2. Personas & Authorization Matrix

| Persona | Role Code | Permissions |
|---|---|---|
| **Administrator** | `ADMIN` | Full system access: user management, cloud account configuration, ingestion triggers, global settings |
| **Cloud / Engineering** | `ENGINEER` | Cost driver analysis, anomaly triage & review, utilization metrics inspection, recommendations review |
| **Budget Owner** | `BUDGET_OWNER` | Budget definition, threshold configurations, forecast analysis, alert subscription management |
| **Read-Only Viewer** | `VIEWER` | Read-only access to dashboards, summaries, reports, and forecasts |

## 3. User Stories & Acceptance Criteria

### US-1: Authentication & Role Enforcement
- **As a** platform user
- **I want to** authenticate with email and password and receive a secure JWT token
- **So that** only authorized users can access sensitive cloud financial data.
- **Acceptance Criteria:**
  - Passwords hashed with BCrypt (strength 12+).
  - Unauthenticated requests return `401 Unauthorized` with standard error response.
  - Insufficient role requests return `403 Forbidden`.
  - Passwords or hash digests never emitted in API responses or logs.

### US-2: Resilient Billing Data Ingestion
- **As a** DevOps engineer
- **I want to** upload a cloud billing CSV file and monitor its ingestion status
- **So that** costs are cataloged accurately and invalid rows are isolated without crashing the service.
- **Acceptance Criteria:**
  - Supported states: `RECEIVED`, `PROCESSING`, `COMPLETED`, `COMPLETED_WITH_ERRORS`, `FAILED`.
  - Bounded memory streaming parser processes files up to 50MB in chunks of 2,000 records.
  - Malformed rows recorded into `billing_import_errors` with row number, column name, and specific error reason.

### US-3: Duplicate-Safe Re-import
- **As an** administrator
- **I want to** re-upload billing files or overlapping daily reports without double-counting
- **So that** cost totals remain 100% accurate.
- **Acceptance Criteria:**
  - Exact file duplicate rejected immediately using SHA-256 fingerprint check.
  - Overlapping line items deduplicated via `source_record_key` unique constraint.
  - Cost totals after re-import equal the expected net total with 0 duplication.

### US-4: Multi-Dimensional Cost Analytics
- **As an** engineering manager
- **I want to** explore spending filtered by date, service, region, account, and usage type
- **So that** I can identify the largest contributors to cost growth.
- **Acceptance Criteria:**
  - Aggregations match hand-calculated sample figures to 6 decimal places.
  - Month-over-month and day-over-day percentage comparisons displayed.
  - Currency conversion or mixing prevented; single-currency totals enforced.

### US-5: Deduplicated Budget Threshold Alerts
- **As a** budget owner
- **I want to** set monthly spending budgets with threshold notifications (e.g. 50%, 80%, 100%)
- **So that** teams are alerted before exceeding allocated cloud spend.
- **Acceptance Criteria:**
  - Unique dedupe key `budgetId:periodStart:thresholdPercent` ensures each threshold fires at most once per period.
  - In-app notification log captures trigger amount, exact timestamp, and delivery status.

### US-6: Statistical Cost Anomaly Detection
- **As a** FinOps analyst
- **I want to** detect sudden spending spikes using a rolling historical baseline
- **So that** runaway cloud resources are discovered immediately.
- **Acceptance Criteria:**
  - Computes rolling median/mean over previous 14–30 days per account and service.
  - Requires both minimum percentage (e.g., +25%) and minimum absolute spend delta (e.g., +$10.00) to trigger.
  - Injected synthetic spikes detected with 100% recall.
  - Workflow allows marking findings as `REVIEWED` or `FALSE_POSITIVE` with human review notes.

### US-7: Month-End Spend Forecasting
- **As a** finance director
- **I want to** see an estimated month-end bill projection based on current run-rates
- **So that** we can allocate budget reserves accurately.
- **Acceptance Criteria:**
  - Baseline projection: `month_to_date + (month_to_date / days_elapsed) * days_remaining`.
  - Display explicit assumptions, forecast method, and model version.
  - Labeled prominently as an estimate, never a guaranteed bill.
  - Historical backtests evaluate and display MAE and MAPE.

### US-8: Non-Intrusive Human-Reviewed Optimization
- **As a** cloud architect
- **I want to** review low-utilization resources with evidence metrics and estimated savings
- **So that** our team can optimize architecture safely.
- **Acceptance Criteria:**
  - CloudPilot never executes automated terminations, resizes, or shutdowns.
  - Recommendations display lookback period, minimum CPU/IO evidence, and operational caveats.
  - Human review decision (`ACCEPTED`, `REJECTED`, `DEFERRED`) recorded with audit timestamp.
