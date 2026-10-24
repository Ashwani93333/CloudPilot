import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Compass,
  PieChart,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Settings as SettingsIcon,
  Server,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// Types
type NavScreen =
  | 'overview'
  | 'imports'
  | 'explorer'
  | 'budgets'
  | 'anomalies'
  | 'forecasts'
  | 'optimization'
  | 'settings';

type UserRole = 'ADMIN' | 'ENGINEER' | 'BUDGET_OWNER' | 'VIEWER';

interface BackendHealth {
  status: string;
  service: string;
  version: string;
  checkedAt: string;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavScreen>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [apiHealth, setApiHealth] = useState<BackendHealth | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(true);

  // Poll backend health endpoint
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch('/api/v1/health');
        if (res.ok) {
          const json = await res.json();
          setApiHealth({
            status: json.data?.status || 'UP',
            service: json.data?.service || 'cloudpilot-api',
            version: json.data?.version || '1.0.0',
            checkedAt: new Date().toLocaleTimeString(),
          });
        } else {
          setApiHealth(null);
        }
      } catch {
        // Backend not yet running locally or running independently
        setApiHealth(null);
      } finally {
        setIsHealthLoading(false);
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, []);

  // Synthetic Sample Data (Reconciled with sample_billing_valid.csv)
  const dailySpendData = [
    { date: '2026-10-01', ec2: 17.70, rds: 18.75, s3: 5.40, other: 1.85, total: 43.70 },
    { date: '2026-10-02', ec2: 17.70, rds: 18.75, s3: 5.42, other: 2.10, total: 43.97 },
    { date: '2026-10-03', ec2: 17.70, rds: 18.75, s3: 5.45, other: 0.95, total: 42.85 },
    { date: '2026-10-04', ec2: 14.50, rds: 18.75, s3: 5.48, other: 0.00, total: 38.73 },
    { date: '2026-10-05', ec2: 14.50, rds: 18.75, s3: 5.50, other: 0.00, total: 38.75 },
  ];

  const serviceBreakdown = [
    { name: 'AmazonRDS', cost: 93.75, color: '#38bdf8', pct: 45.1 },
    { name: 'AmazonEC2', cost: 82.10, color: '#818cf8', pct: 39.5 },
    { name: 'AmazonS3', cost: 27.25, color: '#34d399', pct: 13.1 },
    { name: 'AWSLambda', cost: 3.95, color: '#f472b6', pct: 1.9 },
    { name: 'CloudWatch', cost: 0.95, color: '#fbbf24', pct: 0.5 },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div>
          {/* Logo & Platform Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  CloudPilot
                </span>
                <span className="block text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Cost Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveScreen('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'overview'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview Dashboard</span>
            </button>

            <button
              onClick={() => setActiveScreen('imports')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'imports'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Billing Imports</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CSV
              </span>
            </button>

            <button
              onClick={() => setActiveScreen('explorer')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'explorer'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Cost Explorer</span>
            </button>

            <button
              onClick={() => setActiveScreen('budgets')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'budgets'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span>Budget Management</span>
            </button>

            <button
              onClick={() => setActiveScreen('anomalies')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'anomalies'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Anomaly Centre</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1
              </span>
            </button>

            <button
              onClick={() => setActiveScreen('forecasts')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'forecasts'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Forecast View</span>
            </button>

            <button
              onClick={() => setActiveScreen('optimization')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'optimization'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Recommendations</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Human
              </span>
            </button>

            <button
              onClick={() => setActiveScreen('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeScreen === 'settings'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer: Live Health & Role Switcher */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          {/* Live System Health Badge */}
          <div className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center space-x-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  apiHealth?.status === 'UP'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 font-medium">Spring API</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {isHealthLoading
                ? 'Probing...'
                : apiHealth
                ? `${apiHealth.status} (v${apiHealth.version})`
                : 'Standalone'}
            </span>
          </div>

          {/* Current Role Switcher for Testing Access Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-[11px] text-slate-400">Simulate Role:</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none focus:border-brand-500"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="ENGINEER">ENGINEER</option>
              <option value="BUDGET_OWNER">BUDGET OWNER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Top Header Bar */}
        <header className="h-16 flex-shrink-0 border-b border-slate-800 px-8 flex items-center justify-between backdrop-blur bg-slate-900/60 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white capitalize tracking-tight flex items-center space-x-2">
              <span>{activeScreen.replace('-', ' ')}</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Week 1 Skeleton &amp; Architecture
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              <span>Swagger UI</span>
            </a>
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-white">
                PK
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">Alex FinOps</p>
                <p className="text-[10px] text-slate-400">{currentRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Routing Body */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* SCREEN: OVERVIEW */}
          {activeScreen === 'overview' && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Oct 2026 Incurred Cost</span>
                    <span className="p-1 rounded bg-brand-500/10 text-brand-400">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">
                    $208.00
                  </div>
                  <div className="flex items-center text-[11px] text-emerald-400 mt-2 space-x-1">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    <span>-4.2% vs previous period</span>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Month-End Run-rate Forecast</span>
                    <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">
                    $1,289.60
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Baseline linear estimate (±4.1% MAPE)
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Active Monthly Budget</span>
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400">
                      <PieChart className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">
                    $1,500.00
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '13.8%' }} />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Unusual Cost Findings</span>
                    <span className="p-1 rounded bg-rose-500/10 text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-rose-400 font-mono">
                    1 Pending
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    EC2 deviation flagged on Oct 06
                  </div>
                </div>
              </div>

              {/* Middle Section: Daily Cost Trend & Service Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart (2 cols) */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">
                        Daily Spending Trend (Reconciled Sample Batch)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Multi-service stacked cost in USD across 5-day ingestion test window
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Total: $208.000000
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailySpendData}>
                        <defs>
                          <linearGradient id="colorRds" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorEc2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Area type="monotone" dataKey="rds" name="AmazonRDS" stroke="#38bdf8" fillOpacity={1} fill="url(#colorRds)" stackId="1" />
                        <Area type="monotone" dataKey="ec2" name="AmazonEC2" stroke="#818cf8" fillOpacity={1} fill="url(#colorEc2)" stackId="1" />
                        <Area type="monotone" dataKey="s3" name="AmazonS3" stroke="#34d399" fill="#34d399" stackId="1" />
                        <Area type="monotone" dataKey="other" name="Other Services" stroke="#f472b6" fill="#f472b6" stackId="1" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Service Breakdown (1 col) */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">
                      Top Cost Drivers
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Categorized by cloud service share
                    </p>

                    <div className="space-y-3">
                      {serviceBreakdown.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-medium">{item.name}</span>
                            <span className="font-mono text-slate-200">
                              ${item.cost.toFixed(2)} ({item.pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Currency: USD (Strictly Enforced)</span>
                    <button
                      onClick={() => setActiveScreen('explorer')}
                      className="text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Reference & Week 1 Deliverables Checklist */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Week 1 Implementation Deliverables Status</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Foundational architecture, schema ERD, synthetic billing benchmarks, and runnable full-stack skeleton
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Week 1 Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">Database ERD &amp; Schema Defined</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        PostgreSQL DDL with NUMERIC(19,6), Flyway migration (V1__init_schema.sql), and record dedup index.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">Synthetic Test Billing Datasets</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        4 test CSV files generated: valid ($208.00 total), malformed, overlapping, and spike injection.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">Modular Monolith Spring Boot 3.3.5</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Java 21 backend, Spring Security, Swagger UI, GlobalExceptionHandler, and /api/v1/health endpoints.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">React + Vite + TypeScript Frontend</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Tailwind CSS, Recharts analytics, 8 module screens, and Docker Compose orchestration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: BILLING IMPORTS */}
          {activeScreen === 'imports' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h2 className="text-base font-semibold text-white mb-1">
                  Billing CSV Ingestion Pipeline
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  Stream CSV files with SHA-256 fingerprint deduplication, row-level validation, and error reporting.
                </p>

                {/* Dropzone Skeleton */}
                <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-8 text-center transition cursor-pointer bg-slate-900/40">
                  <UploadCloud className="h-10 w-10 text-brand-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-200">
                    Click to select or drag and drop billing CSV
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports AWS CUR &amp; standard formats (max 50 MB)
                  </p>
                </div>

                {/* Synthetic Sample Quick-Loaders */}
                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Available Synthetic Test Fixtures:
                  </span>
                  <div className="flex space-x-2">
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                      sample_billing_valid.csv (21 rows)
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono">
                      sample_billing_malformed.csv (5 errors)
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">
                      sample_billing_overlapping.csv (dedup)
                    </span>
                  </div>
                </div>
              </div>

              {/* Import History Table */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-semibold text-white mb-4">Recent Ingestion Batches</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                        <th className="pb-3">Batch ID / Filename</th>
                        <th className="pb-3">Account</th>
                        <th className="pb-3">Fingerprint</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Rows (Accepted / Rejected)</th>
                        <th className="pb-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-3 font-sans text-slate-200 flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                          <span>sample_billing_valid.csv</span>
                        </td>
                        <td className="py-3 text-slate-300">111122223333</td>
                        <td className="py-3 text-slate-400 text-[11px]">8f2a9c...3b1d</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            COMPLETED
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">21 / 0 (100%)</td>
                        <td className="py-3 text-slate-400 font-sans text-[11px]">2026-10-24 18:30 UTC</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: COST EXPLORER */}
          {activeScreen === 'explorer' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs">
                    <label className="block text-slate-400 mb-1">Time Range</label>
                    <select className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none">
                      <option>Oct 01, 2026 – Oct 05, 2026</option>
                      <option>Last 30 Days</option>
                      <option>Current Quarter</option>
                    </select>
                  </div>
                  <div className="text-xs">
                    <label className="block text-slate-400 mb-1">Cloud Account</label>
                    <select className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none">
                      <option>111122223333 (Primary AWS)</option>
                    </select>
                  </div>
                  <div className="text-xs">
                    <label className="block text-slate-400 mb-1">Service Filter</label>
                    <select className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none">
                      <option>All Services (5)</option>
                      <option>AmazonEC2</option>
                      <option>AmazonRDS</option>
                      <option>AmazonS3</option>
                    </select>
                  </div>
                </div>

                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition">
                  <Download className="h-3.5 w-3.5 text-brand-400" />
                  <span>Export CSV Report</span>
                </button>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-semibold text-white mb-4">Detailed Itemized Cost Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-sans pb-2">
                        <th className="pb-3">Usage Date</th>
                        <th className="pb-3">Service</th>
                        <th className="pb-3">Region</th>
                        <th className="pb-3">Usage Type</th>
                        <th className="pb-3">Resource ID</th>
                        <th className="pb-3 text-right">Cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-2.5 text-slate-300">2026-10-01</td>
                        <td className="py-2.5 text-sky-400 font-sans">AmazonEC2</td>
                        <td className="py-2.5 text-slate-400">us-east-1</td>
                        <td className="py-2.5 text-slate-300">BoxUsage:t3.medium</td>
                        <td className="py-2.5 text-slate-400 text-[11px]">i-0a1b2c3d4e5f0001</td>
                        <td className="py-2.5 text-right font-bold text-white">$14.500000</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-300">2026-10-01</td>
                        <td className="py-2.5 text-indigo-400 font-sans">AmazonRDS</td>
                        <td className="py-2.5 text-slate-400">us-east-1</td>
                        <td className="py-2.5 text-slate-300">InstanceUsage:db.t3.medium</td>
                        <td className="py-2.5 text-slate-400 text-[11px]">rds-prod-primary</td>
                        <td className="py-2.5 text-right font-bold text-white">$18.750000</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-300">2026-10-01</td>
                        <td className="py-2.5 text-emerald-400 font-sans">AmazonS3</td>
                        <td className="py-2.5 text-slate-400">us-east-1</td>
                        <td className="py-2.5 text-slate-300">StandardStorage</td>
                        <td className="py-2.5 text-slate-400 text-[11px]">s3-company-datalake-prod</td>
                        <td className="py-2.5 text-right font-bold text-white">$5.400000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: BUDGETS */}
          {activeScreen === 'budgets' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Monthly Engineering Cloud Budget</h3>
                    <p className="text-xs text-slate-400">Threshold alerts configured with zero duplicate firing guarantee</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active (13.8% consumed)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Spent: $208.00 USD</span>
                    <span className="text-white font-bold">Limit: $1,500.00 USD</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full" style={{ width: '13.8%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Threshold 1: 50% ($750.00)</span>
                    <span>Threshold 2: 80% ($1,200.00)</span>
                    <span>Threshold 3: 100% ($1,500.00)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: ANOMALIES */}
          {activeScreen === 'anomalies' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-base font-semibold text-white mb-1">Explainable Cost Anomaly Centre</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Rolling 14-day median baseline with absolute and percentage deviation triggers.
                </p>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      <span>HIGH SEVERITY ANOMALY — AmazonEC2 Spike</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      +1175% Deviation
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Observed: $185.000000 | Baseline: $14.500000 | Absolute Delta: +$170.500000
                  </p>
                  <p className="text-xs text-slate-400">
                    Triggered on 2026-10-06 in account 111122223333 (us-east-1). Status: <strong>NEW</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: FORECASTS */}
          {activeScreen === 'forecasts' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-base font-semibold text-white mb-1">Baseline Month-End Projection</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Run-rate model: month_to_date + (month_to_date / days_elapsed) * days_remaining.
                </p>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-2xl font-mono font-bold text-cyan-400">$1,289.60 USD</div>
                  <p className="text-xs text-slate-400">
                    Assumptions: Average spend of $41.60/day across remaining 26 days of October 2026.
                    Labeled strictly as an estimate, not a guaranteed bill.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: RECOMMENDATIONS */}
          {activeScreen === 'optimization' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-base font-semibold text-white mb-1">Human-Reviewed Optimization Candidates</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Evidence-based utilization suggestions. CloudPilot is 100% read-only and never stops or terminates resources.
                </p>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">EC2 Instance Low CPU Utilization</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">i-0a1b2c3d4e5f0001 (t3.medium) — Avg CPU &lt; 3.2% over 14 days</p>
                    <p className="text-xs text-emerald-400 mt-2 font-mono">Estimated Savings: ~$14.50/month if resized</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    Needs Human Review
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SETTINGS */}
          {activeScreen === 'settings' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-base font-semibold text-white mb-1">System Configuration &amp; Cloud Accounts</h3>
                <p className="text-xs text-slate-400 mb-6">Manage connected cloud accounts and role-based permissions</p>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Registered Cloud Account:</span>
                    <span className="text-slate-200 font-mono">111122223333 (AWS Primary)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">AWS Adapter Mode:</span>
                    <span className="text-slate-200 font-mono">Mock / Read-Only SDK</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="text-slate-200 font-mono">PostgreSQL 16 (Flyway Managed)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
