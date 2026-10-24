# CloudPilot

**Cloud Resource Cost Intelligence & Optimization Platform**

CloudPilot ingests cloud billing data, explains spending trends, detects unusual cost changes, manages budgets, estimates month-end spend, and surfaces evidence-based optimization candidates for human review.

> **Safety principle:** CloudPilot is read-only with respect to cloud infrastructure. It never stops, resizes, or deletes resources. Forecasts and savings figures are estimates, not guaranteed bills.

---

## Features

- **Authentication & RBAC** – Administrator, Cloud/Engineering, Budget Owner, Read-only Viewer (enforced in the backend).
- **Billing CSV ingestion** – validation, preview, bounded-memory batch processing, row-level errors, import history, duplicate-safe re-uploads.
- **Cost analytics** – totals, previous-period comparison, daily/monthly trends, breakdown by service/region/account/usage type/resource, top cost drivers, CSV export.
- **Budgets & alerts** – period budgets with configurable thresholds (e.g. 50/80/100%), deduplicated alert events, in-app history, optional email.
- **Anomaly detection** – explainable rule-based baseline (rolling average/median + absolute and percentage thresholds), review workflow.
- **Forecasting** – baseline month-end forecast with documented assumptions and MAE/MAPE evaluation.
- **AWS integration** – read-only Cost Explorer adapter (or documented mock adapter).
- **Utilization & recommendations** – conservative, evidence-backed candidates with caveats; human review only.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA/Hibernate |
| Database | PostgreSQL, Flyway migrations |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |
| Parsing | Apache Commons CSV (Apache POI if XLSX added) |
| Testing | JUnit 5, Mockito, Testcontainers, Vitest |
| DevOps | Docker Compose, GitHub Actions |
| Cloud | AWS SDK for Java (Cost Explorer, CloudWatch optional) |

## Architecture

A **modular monolith**:

```
React + TypeScript (Dashboard · Imports · Budgets · Reports)
            │
Spring Boot REST API (Security · Validation · DTOs)
            │
Modules: ingestion | analytics | budgets | anomalies | forecasts | provider-aws
            │
PostgreSQL            Background jobs (batches, aggregation, alerts, sync)
```

Provider-specific code lives behind an adapter interface so the core domain stays cloud-agnostic.

## Prerequisites

- Java 21
- Node.js 20+ and npm
- Docker and Docker Compose
- (Optional) AWS credentials with read-only Cost Explorer/CloudWatch permissions

## Quick Start

```bash
git clone <your-repo-url> cloudpilot
cd cloudpilot
cp .env.example .env        # fill in values; never commit .env
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: `/api/v1/health` · Readiness: `/api/v1/ready`

## Configuration

| Variable | Description |
|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Token signing secret (strong random value) |
| `MAX_UPLOAD_MB` | Maximum billing file size |
| `IMPORT_BATCH_SIZE` | Rows per persistence batch |
| `AWS_REGION`, `AWS_PROFILE` | Optional AWS integration |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` | Optional email alerts |

## Billing CSV Format

Required columns (adjust to your sample format): `usage_date`, `service`, `region`, `usage_type`, `currency`, `cost_amount`. Optional: `resource_id`, `account_id`.

**Deduplication:** (1) a SHA-256 file fingerprint rejects exact duplicate files; (2) a stable `source_record_key` (hash of account + date + service + region + usage type + resource) with a unique constraint prevents double counting in overlapping files.

## Running Tests

```bash
cd backend && ./mvnw test            # unit + integration (Testcontainers needs Docker)
cd frontend && npm test              # Vitest
```

## API Overview

Base path `/api/v1`: `auth`, `cloud-accounts`, `billing-imports`, `costs/*`, `budgets`, `alerts`, `anomalies`, `forecasts`, `resources/utilization`, `recommendations`, `reports/costs/export`, `health`, `ready`. Full schemas in Swagger/OpenAPI.

## Project Structure (suggested)

```
cloudpilot/
├── backend/src/main/java/.../{auth,ingestion,analytics,budgets,anomalies,forecasts,provider,common}
├── backend/src/main/resources/db/migration
├── frontend/src/{pages,components,api,hooks}
├── docs/{architecture.md,erd.png,benchmarks.md,forecast-evaluation.md}
├── sample-data/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Security Notes

- Passwords hashed (BCrypt); no secrets in source control.
- Object-level authorization on every endpoint.
- Consistent error format; no stack traces exposed.
- Use synthetic or sanitized billing data in development.

## Known Limitations

- Forecasts are baseline estimates, not guaranteed bills.
- Not all billing records map to a metric resource.
- Single cloud provider (AWS) in the initial release.
- Anomaly detection is rule-based; no ML.

## Roadmap

Additional providers · advanced forecasting · tuned anomaly models · scheduled incremental sync · tag-based chargeback · more notification channels.

## License

Add your license here (e.g. MIT).
