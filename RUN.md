# CloudPilot — Execution & Run Guide (`RUN.md`)

This guide provides all the necessary commands, environment setup steps, and credentials required to build, run, and test CloudPilot locally or with Docker.

---

## 📋 1. Prerequisites

Ensure the following tools are installed on your machine:
- **Java:** JDK 21+ (Java 21 or Java 23)
- **Node.js:** v20+ and **npm** v10+
- **Database:** PostgreSQL 16+ (Local service or Docker container)
- **Docker & Docker Compose:** *(Optional, if running via containers)*

---

## ⚙️ 2. Environment Configuration

Copy the template [.env.example](.env.example) to `.env` in the root directory:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS (Bash)
cp .env.example .env
```

### Key Variables in `.env`
```env
# Application & Database
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_URL=jdbc:postgresql://localhost:5432/cloudpilot
DB_USER=cloudpilot_user
DB_PASSWORD=cloudpilot_secure_password_dev123!

# JWT Secret
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000

# AWS Mode ('mock' for local simulation without AWS keys, 'aws' for live Cost Explorer)
AWS_ADAPTER_MODE=mock
AWS_REGION=us-east-1

# Frontend API Endpoint
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🗄️ 3. Database Setup

CloudPilot requires a PostgreSQL database named `cloudpilot`.

### Option A: Local Native PostgreSQL
Connect to your local PostgreSQL instance (via `psql` or pgAdmin) and run:

```sql
CREATE USER cloudpilot_user WITH PASSWORD 'cloudpilot_secure_password_dev123!';
CREATE DATABASE cloudpilot OWNER cloudpilot_user;
GRANT ALL PRIVILEGES ON DATABASE cloudpilot TO cloudpilot_user;
```

> **Note:** Flyway migrations run automatically on backend startup and will create all tables, indexes, and initial seed data.

### Option B: PostgreSQL via Docker
If you prefer running just PostgreSQL in a container:

```bash
docker run -d \
  --name cloudpilot-postgres \
  -e POSTGRES_DB=cloudpilot \
  -e POSTGRES_USER=cloudpilot_user \
  -e POSTGRES_PASSWORD=cloudpilot_secure_password_dev123! \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## 🚀 4. Running Locally (Development Mode)

### Step 1: Start the Backend (Spring Boot)

Open a terminal in the `backend/` directory:

```bash
cd backend

# Windows (Command Prompt or PowerShell)
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

*The backend will boot on port `8080`.*

---

### Step 2: Start the Frontend (Vite + React)

Open another terminal in the `frontend/` directory:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```

*The frontend will run at `http://localhost:5173/`.*

---

## 🐳 5. Running the Entire Stack with Docker Compose

To build and run all 3 services (**PostgreSQL**, **Backend**, **Frontend**) in isolated containers:

```bash
# Build and start all services in the background
docker compose up --build -d

# View real-time logs
docker compose logs -f

# Stop and remove containers
docker compose down
```

---

## 🔑 6. Default Credentials & Logins

Once the database migrations execute, the following default credentials are automatically available:

### Platform Administrator (Web UI Login)
- **URL:** [http://localhost:5173](http://localhost:5173/)
- **Email:** `admin@cloudpilot.internal`
- **Password:** `Admin@12345!`
- **Role:** `ADMIN`

### Default Primary Cloud Account
- **Display Name:** `Primary Production AWS`
- **Account ID:** `111122223333`
- **Provider:** `AWS`

---

## 🌐 7. Key URLs & Endpoints

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Interactive Dashboard, Ingestion, Budgets, Reports |
| **Backend REST API** | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) | Core REST API Base Path |
| **Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | OpenAPI documentation & interactive testing |
| **Health Check** | [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) | Service health status |
| **Readiness Check** | [http://localhost:8080/api/v1/ready](http://localhost:8080/api/v1/ready) | DB readiness verification |

---

## 🧪 8. Running Tests

### Backend Unit & Integration Tests
```bash
cd backend

# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

### Frontend Vitest Tests
```bash
cd frontend
npm test
```

---

## 📂 9. Testing Billing Ingestion

Sample CSV files are provided in `sample-data/`:
- `sample-data/sample_billing_valid.csv` (Valid mock data for upload testing)

### Upload via Web UI:
1. Log in to [http://localhost:5173](http://localhost:5173/) with `admin@cloudpilot.internal` / `Admin@12345!`.
2. Navigate to the **Billing Imports** tab.
3. Select cloud account `Primary Production AWS` (`111122223333`).
4. Upload `sample-data/sample_billing_valid.csv`.
