# Product Requirements Document (PRD) — CloudPilot

**Version:** 1.0  **Status:** Draft  **Type:** MVP / Initial release

## 1. Purpose
Give engineering and finance teams a reliable way to understand cloud spend, detect unusual changes, manage budgets, estimate future spend, and review optimization opportunities, with accuracy, explainability, and security as the priorities.

## 2. Problem Statement
1. Cloud costs rise unexpectedly and teams cannot quickly see which service, region, or resource drove the change.
2. Budget owners need timely threshold alerts and a reasonable month-end estimate.
3. Optimization requires utilization evidence, not cost alone.
4. Billing imports must stay accurate despite malformed rows, overlapping files, and repeat uploads.

## 3. Goals and Non-Goals
**Goals**
- Accurate, reconcilable cost visibility.
- Explainable anomaly detection and forecasting.
- Safe, human-reviewed recommendations.
- Reproducible deployment and documented operations.

**Non-Goals (initial release)**
- Automatic stop/resize/delete of resources.
- Guaranteed savings or guaranteed bill forecasts.
- Advanced ML before a baseline and evaluation dataset exist.
- Multi-cloud support beyond a clean adapter boundary.

## 4. Personas
| Persona | Needs |
|---|---|
| Administrator | Manage users, accounts, imports, configuration |
| Cloud/Engineering | Investigate cost drivers, anomalies, utilization |
| Budget Owner | Set budgets, review forecasts, receive alerts |
| Read-only Viewer | View dashboards and reports only |

## 5. User Stories & Acceptance Criteria

**US-1 Login & roles** – As a user, I log in and see only what my role allows.
- AC: Backend rejects unauthorized calls with 401/403; passwords/secrets never returned.

**US-2 Import billing CSV** – As an engineer, I upload a CSV and see status.
- AC: Required columns/dates/numbers/currency validated; accepted/rejected counts shown; row-level errors downloadable; states RECEIVED → PROCESSING → COMPLETED / COMPLETED_WITH_ERRORS / FAILED.

**US-3 Safe re-import** – As an admin, re-uploading a file must not double count.
- AC: Same file rejected via fingerprint; overlapping rows deduplicated via source_record_key; totals unchanged.

**US-4 Explore costs** – As an engineer, I filter by date, account, service, region.
- AC: Totals match independently calculated results; previous-period comparison shown; cost measure documented; mixed currencies never silently summed.

**US-5 Budgets** – As a budget owner, I set a budget with thresholds.
- AC: Thresholds evaluated after imports and on schedule; one alert per threshold event; alert stores amount, threshold, time, delivery status.

**US-6 Anomalies** – As an engineer, I see unusual cost changes with reasons.
- AC: Each finding shows observed, baseline, deviation, severity, period, detection time; can be marked reviewed/false positive with a note; injected synthetic spikes are detected.

**US-7 Forecast** – As a budget owner, I see estimated month-end spend.
- AC: Shows assumptions, period, last-updated time, labeled as estimate; MAE/MAPE on historical periods published.

**US-8 Recommendations** – As an engineer, I review low-utilization candidates.
- AC: Evidence, lookback period, caveats shown; savings only when defensible; decision recorded; no automated actions.

**US-9 Export & ops** – As a user, I export filtered cost reports; as an operator, I check health.
- AC: CSV export respects filters and permissions; /health and /ready work.

## 6. Functional Requirements (summary)
| ID | Requirement |
|---|---|
| FR-1 | Login, current-user endpoint, four roles, backend enforcement |
| FR-2 | CSV upload, validation, preview, import states, bounded batches, row errors |
| FR-3 | Dedup via file fingerprint and stable record key |
| FR-4 | Cost summary, trends, breakdown, top drivers, detail tables |
| FR-5 | Budgets with configurable thresholds, dedupe, in-app history, optional email |
| FR-6 | Rule-based anomaly detection with review workflow |
| FR-7 | Baseline forecast with evaluation |
| FR-8 | Read-only AWS adapter (or mock) |
| FR-9 | Utilization reports and human-reviewed recommendations |
| FR-10 | CSV export, import history, health/readiness, structured logs |

## 7. Non-Functional Requirements
- **Accuracy:** NUMERIC for money; UTC timestamps; explicit currency handling.
- **Performance:** bounded-memory imports; indexed queries; max page size; benchmarks documented.
- **Security:** Spring Security, object-level authorization, no secrets in repo, least-privilege read-only AWS, no stack traces in responses.
- **Reliability:** transactional batches, recoverable import state, idempotent retries.
- **Maintainability:** thin controllers, DTOs, testable services, Flyway migrations.
- **Operability:** Docker Compose setup, CI, documented backup/restore.

## 8. Screens
Overview dashboard · Billing imports · Cost explorer · Budget management · Anomaly centre · Forecast view · Resource optimization · Settings.

## 9. Success Metrics
- 100% reconciliation of sample aggregates against independent calculations.
- 0 duplicate-counting incidents in re-upload tests.
- Anomaly detection catches injected spikes with documented precision/recall on synthetic data.
- Forecast MAPE reported against historical periods.
- Clean `docker compose up` start; full test suite green in CI.

## 10. Assumptions & Dependencies
- Synthetic or sanitized billing samples available.
- AWS access optional; fallback is a documented mock adapter.
- SMTP optional.

## 11. Risks
| Risk | Mitigation |
|---|---|
| Inconsistent billing formats | Review samples in week 1; column-mapping layer |
| Overlapping files double count | Fingerprint + unique source_record_key |
| Large files exhaust memory | Streaming parse + batch persistence |
| Resource IDs don't match metrics | Careful correlation; caveats in UI |
| No AWS access | Mock adapter |
| Alert noise from anomalies | Absolute + percentage thresholds, review feedback |

## 12. Release Plan
12-week plan: foundation → ingestion → analytics → budgets → anomalies → forecasting → AWS → recommendations → quality → release (see PWD.md).

## 13. Open Questions
- Which billing format(s) first (AWS CUR, custom CSV)?
- Which cost measure is the default (unblended vs amortized)?
- Is XLSX import required?
- Multi-currency: reject, segregate, or convert?
- Should users be scoped to specific cloud accounts?
