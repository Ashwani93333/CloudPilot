# CloudPilot Entity-Relationship Diagram (ERD) & Database Schema

## 1. Relational ER Diagram

```mermaid
erDiagram
    users ||--o{ user_cloud_accounts : "assigned"
    cloud_accounts ||--o{ user_cloud_accounts : "permits"
    cloud_accounts ||--o{ billing_imports : "receives"
    cloud_accounts ||--o{ cost_records : "incurs"
    billing_imports ||--o{ cost_records : "populates"
    billing_imports ||--o{ billing_import_errors : "records"
    cloud_accounts ||--o{ budgets : "defines"
    budgets ||--o{ budget_alerts : "triggers"
    cloud_accounts ||--o{ cost_anomalies : "flags"
    cloud_accounts ||--o{ cost_forecasts : "generates"
    cloud_accounts ||--o{ resource_metrics : "captures"
    cloud_accounts ||--o{ optimization_recommendations : "surfaces"

    users {
        uuid id PK
        varchar(150) full_name
        varchar(255) email UK
        varchar(255) password_hash
        varchar(50) role
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    cloud_accounts {
        uuid id PK
        varchar(50) provider
        varchar(100) display_name
        varchar(100) external_account_id UK
        varchar(50) connection_status
        timestamptz created_at
        timestamptz updated_at
    }

    user_cloud_accounts {
        uuid user_id FK
        uuid cloud_account_id FK
        timestamptz granted_at
    }

    billing_imports {
        uuid id PK
        uuid cloud_account_id FK
        varchar(255) filename
        varchar(64) file_fingerprint UK
        varchar(50) status
        integer total_rows
        integer accepted_rows
        integer rejected_rows
        text error_summary
        timestamptz started_at
        timestamptz completed_at
    }

    billing_import_errors {
        bigserial id PK
        uuid import_id FK
        integer row_number
        varchar(100) column_name
        varchar(255) error_message
        text raw_row_data
        timestamptz created_at
    }

    cost_records {
        bigserial id PK
        uuid import_id FK
        uuid cloud_account_id FK
        date usage_date
        varchar(100) service
        varchar(50) region
        varchar(150) usage_type
        varchar(3) currency
        numeric(19_6) cost_amount
        varchar(255) resource_id
        varchar(64) source_record_key
        timestamptz created_at
    }

    budgets {
        uuid id PK
        uuid cloud_account_id FK
        varchar(150) name
        varchar(50) period_type
        date period_start
        date period_end
        numeric(19_6) budget_amount
        varchar(3) currency
        jsonb thresholds
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    budget_alerts {
        uuid id PK
        uuid budget_id FK
        integer threshold_percent
        numeric(19_6) observed_amount
        varchar(50) delivery_status
        varchar(255) dedupe_key UK
        timestamptz triggered_at
    }

    cost_anomalies {
        uuid id PK
        uuid cloud_account_id FK
        varchar(100) service
        date period_start
        date period_end
        numeric(19_6) observed_amount
        numeric(19_6) baseline_amount
        numeric(8_2) deviation_percent
        varchar(50) severity
        varchar(50) status
        text review_note
        timestamptz detected_at
        timestamptz reviewed_at
    }

    cost_forecasts {
        uuid id PK
        uuid cloud_account_id FK
        date period_start
        date period_end
        numeric(19_6) predicted_amount
        varchar(3) currency
        varchar(100) method
        varchar(50) model_version
        timestamptz generated_at
    }

    resource_metrics {
        bigserial id PK
        uuid cloud_account_id FK
        varchar(255) resource_id
        varchar(100) metric_name
        numeric(19_4) metric_value
        varchar(50) unit
        varchar(50) source
        timestamptz metric_timestamp
    }

    optimization_recommendations {
        uuid id PK
        uuid cloud_account_id FK
        varchar(255) resource_id
        varchar(100) recommendation_type
        numeric(19_6) estimated_savings
        varchar(3) currency
        jsonb evidence
        varchar(50) status
        text review_notes
        timestamptz created_at
        timestamptz reviewed_at
    }
```

## 2. Table Specifications & Indexes

### `users`
- Primary Key: `id` (UUID)
- Unique: `email`
- Index: `idx_users_email` ON (`email`)
- Enums / Values: `role` IN (`ADMIN`, `ENGINEER`, `BUDGET_OWNER`, `VIEWER`)

### `cloud_accounts`
- Primary Key: `id` (UUID)
- Unique: `external_account_id`
- Index: `idx_cloud_accounts_provider` ON (`provider`, `connection_status`)

### `billing_imports`
- Primary Key: `id` (UUID)
- Foreign Key: `cloud_account_id` REFERENCES `cloud_accounts(id)`
- Unique: `file_fingerprint` (Prevents duplicate physical file re-uploads)
- Index: `idx_imports_account_status` ON (`cloud_account_id`, `status`)

### `cost_records`
- Primary Key: `id` (BIGINT GENERATED ALWAYS AS IDENTITY)
- Foreign Key: `import_id` REFERENCES `billing_imports(id)` ON DELETE CASCADE
- Foreign Key: `cloud_account_id` REFERENCES `cloud_accounts(id)`
- Unique: `idx_cost_records_dedup` ON (`cloud_account_id`, `source_record_key`)
- Index: `idx_cost_records_date_service` ON (`cloud_account_id`, `usage_date`, `service`)
- Index: `idx_cost_records_import` ON (`import_id`)

### `budgets`
- Primary Key: `id` (UUID)
- Foreign Key: `cloud_account_id` REFERENCES `cloud_accounts(id)`
- Index: `idx_budgets_account_active` ON (`cloud_account_id`, `is_active`)

### `budget_alerts`
- Primary Key: `id` (UUID)
- Foreign Key: `budget_id` REFERENCES `budgets(id)`
- Unique: `dedupe_key` (Format: `{budgetId}:{periodStart}:{thresholdPercent}`)
  *Guarantees zero duplicate alerts for identical threshold breaches in the same billing cycle.*

### `cost_anomalies`
- Primary Key: `id` (UUID)
- Foreign Key: `cloud_account_id` REFERENCES `cloud_accounts(id)`
- Index: `idx_anomalies_account_detected` ON (`cloud_account_id`, `detected_at`, `status`)
