-- ==============================================================================
-- CloudPilot Database Baseline Schema Migration (V1__init_schema.sql)
-- Follows strict monetary precision (NUMERIC 19,6) and deduplication keys
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'ENGINEER', 'BUDGET_OWNER', 'VIEWER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Cloud Accounts Table
CREATE TABLE IF NOT EXISTS cloud_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL DEFAULT 'AWS',
    display_name VARCHAR(100) NOT NULL,
    external_account_id VARCHAR(100) NOT NULL UNIQUE,
    connection_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cloud_accounts_provider ON cloud_accounts(provider, connection_status);

-- 3. User Cloud Accounts Mapping
CREATE TABLE IF NOT EXISTS user_cloud_accounts (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, cloud_account_id)
);

-- 4. Billing Imports Lifecycle Table
CREATE TABLE IF NOT EXISTS billing_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_fingerprint VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('RECEIVED', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED')),
    total_rows INT DEFAULT 0,
    accepted_rows INT DEFAULT 0,
    rejected_rows INT DEFAULT 0,
    error_summary TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_billing_imports_account_status ON billing_imports(cloud_account_id, status);

-- 5. Billing Import Errors (Row-Level Validation Logs)
CREATE TABLE IF NOT EXISTS billing_import_errors (
    id BIGSERIAL PRIMARY KEY,
    import_id UUID NOT NULL REFERENCES billing_imports(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    column_name VARCHAR(100),
    error_message VARCHAR(255) NOT NULL,
    raw_row_data TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_errors_import_id ON billing_import_errors(import_id);

-- 6. Normalized Cost Records (High Volume)
CREATE TABLE IF NOT EXISTS cost_records (
    id BIGSERIAL PRIMARY KEY,
    import_id UUID NOT NULL REFERENCES billing_imports(id) ON DELETE CASCADE,
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    service VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    usage_type VARCHAR(150) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    cost_amount NUMERIC(19, 6) NOT NULL,
    resource_id VARCHAR(255),
    source_record_key VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cost_record_dedup UNIQUE (cloud_account_id, source_record_key)
);

CREATE INDEX IF NOT EXISTS idx_cost_records_date_service ON cost_records(cloud_account_id, usage_date, service);
CREATE INDEX IF NOT EXISTS idx_cost_records_import ON cost_records(import_id);

-- 7. Budgets Configuration
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    period_type VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    budget_amount NUMERIC(19, 6) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    thresholds JSONB NOT NULL DEFAULT '[50, 80, 100]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_budgets_account_active ON budgets(cloud_account_id, is_active);

-- 8. Deduplicated Budget Alerts
CREATE TABLE IF NOT EXISTS budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    threshold_percent INT NOT NULL,
    observed_amount NUMERIC(19, 6) NOT NULL,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    dedupe_key VARCHAR(255) NOT NULL UNIQUE,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Cost Anomalies
CREATE TABLE IF NOT EXISTS cost_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    service VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    observed_amount NUMERIC(19, 6) NOT NULL,
    baseline_amount NUMERIC(19, 6) NOT NULL,
    deviation_percent NUMERIC(8, 2) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'REVIEWED', 'FALSE_POSITIVE')),
    review_note TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_anomalies_account_detected ON cost_anomalies(cloud_account_id, detected_at, status);

-- 10. Cost Forecasts
CREATE TABLE IF NOT EXISTS cost_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    predicted_amount NUMERIC(19, 6) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    method VARCHAR(100) NOT NULL DEFAULT 'RUN_RATE_LINEAR',
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Resource Utilization Metrics
CREATE TABLE IF NOT EXISTS resource_metrics (
    id BIGSERIAL PRIMARY KEY,
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(19, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'CLOUDWATCH',
    metric_timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_metrics_resource_time ON resource_metrics(resource_id, metric_timestamp);

-- 12. Human-Reviewed Optimization Recommendations
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(100) NOT NULL,
    estimated_savings NUMERIC(19, 6),
    currency VARCHAR(3) DEFAULT 'USD',
    evidence JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'ACCEPTED', 'REJECTED', 'DEFERRED')),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

-- Seed Initial Default Admin User (Password: Admin@12345! - BCrypt hash)
INSERT INTO users (id, full_name, email, password_hash, role, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Platform Administrator',
    'admin@cloudpilot.internal',
    '$2a$12$R9478PVRv8MhVw.eP86o9egzB.2Qj9jL3Msh8rYgR5g5lYgL7Pj6K',
    'ADMIN',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Seed Default Primary AWS Cloud Account
INSERT INTO cloud_accounts (id, provider, display_name, external_account_id, connection_status)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'AWS',
    'Primary Production AWS',
    '111122223333',
    'ACTIVE'
) ON CONFLICT (external_account_id) DO NOTHING;

-- Map Admin to Cloud Account
INSERT INTO user_cloud_accounts (user_id, cloud_account_id)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;
