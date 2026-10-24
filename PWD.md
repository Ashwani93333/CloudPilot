# Project Work Document (PWD) — CloudPilot

A practical build plan: decisions, tasks, and checklists per week. Tick boxes as you go.

## 1. Key Design Decisions (decide early, document in `docs/`)
| Topic | Decision |
|---|---|
| Architecture | Modular monolith; packages per module (`auth`, `ingestion`, `analytics`, `budgets`, `anomalies`, `forecasts`, `provider`) |
| Money | `NUMERIC(19,6)` in DB, `BigDecimal` in Java; never double/float |
| Time | Store `timestamptz` in UTC; keep source usage date and time zone if given |
| IDs | UUID for entities; BIGINT for high-volume `cost_records` |
| Dedup | SHA-256 file fingerprint + unique `source_record_key` (hash of account, date, service, region, usage type, resource) |
| Import processing | Stream CSV, batch size 1,000–5,000, one transaction per batch, status persisted so imports can resume/fail cleanly |
| Auth | Spring Security + JWT (or session); BCrypt; method-level role checks + account-scoped queries |
| Errors | Central `@ControllerAdvice`, one JSON error shape, no stack traces |
| Cost measure | Choose and document (e.g. unblended); store the measure name |
| Currency | Never sum mixed currencies; group or reject |

## 2. Algorithms

**Anomaly detection (rule-based)**
1. For each account + service, compute daily cost series.
2. Baseline = rolling median (or mean) of the previous N days (default 14–30).
3. Deviation % = (observed − baseline) / baseline; absolute deviation = observed − baseline.
4. Flag when both deviation % ≥ P and absolute ≥ A (configurable).
5. Severity from deviation bands (e.g. LOW/MEDIUM/HIGH).
6. Persist observed, baseline, deviation, period, severity, detected_at; status NEW → REVIEWED / FALSE_POSITIVE.
7. Evaluate on synthetic normal data + injected spikes; report precision/recall.

**Forecast (baseline)**
`forecast = month_to_date + (month_to_date / days_elapsed) × days_remaining`
Evaluate on completed months using MAE and MAPE; store `method`, `model_version`, `generated_at`; label as an estimate.

**Budget thresholds**
Evaluate after each successful import and on a schedule. `dedupe_key = budgetId + periodStart + thresholdPercent` with a UNIQUE constraint so repeat evaluations cannot create duplicates.

## 3. Weekly Plan

### Week 1 — Requirements & design
- [x] Review sample billing formats; create synthetic data
- [x] User stories + acceptance criteria
- [x] ERD, architecture diagram
- [x] Repo, branching strategy, Docker Compose skeleton (Postgres + backend + frontend)
- **Deliverable:** requirements, ERD, runnable skeleton

### Week 2 — Foundation
- [ ] Flyway baseline migration (users, cloud_accounts)
- [ ] Login, `/auth/me`, roles, password hashing
- [ ] DTO validation, global exception handler
- [ ] React app with protected routes and login page
- **Deliverable:** secure foundation

### Week 3 — Ingestion
- [ ] `POST /billing-imports` with size/type validation
- [ ] Streaming Commons CSV parser, column/date/number/currency validation
- [ ] Row-level error table; import states
- [ ] Imports UI with status and error download
- **Deliverable:** end-to-end CSV import

### Week 4 — Normalization & summaries
- [ ] Persist `cost_records` in batches
- [ ] Fingerprint + record-key dedup
- [ ] `/costs/summary`; reconcile against hand-calculated sample
- **Deliverable:** first dashboard + reconciliation evidence

### Week 5 — Analytics
- [ ] Trends, breakdown, top drivers, filters, pagination
- [ ] CSV export
- [ ] Add indexes after `EXPLAIN ANALYZE`
- **Deliverable:** cost explorer

### Week 6 — Budgets & alerts
- [ ] Budget CRUD, thresholds JSONB
- [ ] Evaluation job + post-import trigger
- [ ] Alert history with dedupe key
- **Deliverable:** budget workflow

### Week 7 — Anomalies
- [ ] Detection service, config, persistence
- [ ] Review endpoint + UI
- [ ] Synthetic tests with injected spikes
- **Deliverable:** anomaly centre

### Week 8 — Forecasting
- [ ] Baseline forecast + assumptions text
- [ ] Backtest MAE/MAPE, write `docs/forecast-evaluation.md`
- **Deliverable:** forecast view + report

### Week 9 — AWS integration
- [ ] `CostProvider` interface; AWS Cost Explorer impl (read-only IAM)
- [ ] Pagination, retry/backoff, freshness metadata
- [ ] Mock adapter fallback
- **Deliverable:** AWS sync or documented mock

### Week 10 — Utilization & recommendations
- [ ] Store/read metrics; map resource IDs carefully
- [ ] Conservative low-utilization rules with lookback + caveats
- [ ] Review decision endpoint + UI
- **Deliverable:** reviewable recommendations

### Week 11 — Quality & performance
- [ ] Integration tests (Testcontainers), authorization tests, edge cases
- [ ] Large-file test (record size, duration, memory, errors)
- [ ] CI pipeline, security review, query profiling
- **Deliverable:** release candidate + benchmark report

### Week 12 — Release & handover
- [ ] Deploy; run acceptance scenarios
- [ ] Fix critical defects
- [ ] README, API docs, Postman collection, ops guide, demo
- **Deliverable:** deployed MVP

## 4. Acceptance Checklist
- [ ] Valid CSV: status, counts, totals correct
- [ ] Malformed CSV: clear errors, no stack traces
- [ ] Same file re-uploaded: no double counting
- [ ] Overlapping file: no double counting
- [ ] Daily and service aggregates reconcile with independent calculation
- [ ] Budget thresholds fire once each
- [ ] Injected spike detected with baseline + deviation shown
- [ ] Forecast shows assumptions + historical error
- [ ] Cross-account access blocked by backend
- [ ] Large-file benchmark recorded
- [ ] Full test suite passes; clean `docker compose up` works

## 5. Testing Plan
| Level | Focus |
|---|---|
| Unit | Parser, validators, aggregation, thresholds, anomaly and forecast math |
| Integration | Repositories, migrations, import lifecycle, API authorization |
| Frontend | Forms, validation errors, loading/empty states, filters |
| E2E | Import → dashboard → budget alert → anomaly review |
| Performance | Large file import, aggregation queries |

## 6. Definition of Done (per feature)
Behavior implemented · inputs validated · permissions enforced · automated tests pass · API/UI documented · demonstrable in a repeatable environment.

## 7. Risk Log
| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| Format variance | Import failures | Column mapping, early sample review | — |
| Memory on large files | Crashes | Streaming + batches | — |
| Duplicate records | Wrong totals | Unique keys + tests | — |
| Scope creep (ML, multi-cloud) | Delays | Keep to non-goals | — |
| No AWS access | Blocked week 9 | Mock adapter | — |

## 8. Final Deliverables Checklist
- [ ] Repo with clean history
- [ ] Architecture + ER diagrams
- [ ] Migrations + synthetic data
- [ ] OpenAPI + Postman collection
- [ ] Tests + instructions
- [ ] Docker Compose + CI
- [ ] README with limitations
- [ ] Screenshots/demo
- [ ] Known issues + future work
- [ ] Technical presentation
