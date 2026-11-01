import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { BudgetConfig, BudgetAlertEvent, UserRole } from '../types';

interface BudgetsScreenProps {
  budgets: BudgetConfig[];
  alerts: BudgetAlertEvent[];
  onAddBudget: (b: BudgetConfig) => void;
  onUpdateBudgetLimit: (id: string, newLimit: number) => void;
  currentRole: UserRole;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets,
  alerts,
  onAddBudget,
  onUpdateBudgetLimit,
  currentRole,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editLimitInput, setEditLimitInput] = useState('');

  // Form fields
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetAccount, setBudgetAccount] = useState('111122223333');
  const [threshold1, setThreshold1] = useState('50');
  const [threshold2, setThreshold2] = useState('80');
  const [threshold3, setThreshold3] = useState('100');

  const canManageBudgets = currentRole === 'ADMIN' || currentRole === 'BUDGET_OWNER';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageBudgets) {
      alert('Only Budget Owners and Administrators can configure budget policies.');
      return;
    }

    const limitNum = parseFloat(budgetLimit) || 1000;
    const newBudget: BudgetConfig = {
      id: `bgt-${Date.now().toString().slice(-4)}`,
      name: budgetName || 'Cloud Infrastructure Budget',
      limit: limitNum,
      spent: 208.0,
      currency: 'USD',
      period: 'OCTOBER 2026',
      account: budgetAccount,
      thresholds: [
        { percentage: parseFloat(threshold1), amount: limitNum * (parseFloat(threshold1) / 100), triggered: 208 >= limitNum * (parseFloat(threshold1) / 100) },
        { percentage: parseFloat(threshold2), amount: limitNum * (parseFloat(threshold2) / 100), triggered: 208 >= limitNum * (parseFloat(threshold2) / 100) },
        { percentage: parseFloat(threshold3), amount: limitNum * (parseFloat(threshold3) / 100), triggered: 208 >= limitNum * (parseFloat(threshold3) / 100) },
      ],
    };

    onAddBudget(newBudget);
    setShowModal(false);
    setBudgetName('');
    setBudgetLimit('');
  };

  const handleEditLimit = (id: string) => {
    if (!canManageBudgets) {
      alert('Only Budget Owners and Administrators can edit budget limits.');
      return;
    }
    const val = parseFloat(editLimitInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudgetLimit(id, val);
      setEditingBudgetId(null);
      setEditLimitInput('');
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
            Budget Governance &amp; Thresholds.
          </h1>
          <p className="text-base font-light text-text-muted mt-2 max-w-3xl">
            Configure multi-tier spending threshold ladders with deduplicated in-app alert events
            and zero-duplicate firing guarantees.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!canManageBudgets) {
              alert('Permission Denied: Only Budget Owners and Admins can create budget policies.');
              return;
            }
            setShowModal(true);
          }}
          className={`button-primary self-start sm:self-auto flex items-center space-x-2 ${
            !canManageBudgets ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Policy</span>
        </button>
      </div>

      {/* Role Notice if not Budget Owner or Admin */}
      {!canManageBudgets && (
        <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline flex items-center space-x-3 text-xs text-text-muted">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are operating in <strong>{currentRole}</strong> mode. Budget creation and modification require <strong>BUDGET_OWNER</strong> or <strong>ADMIN</strong> role.
          </span>
        </div>
      )}

      {/* Budgets List */}
      <div className="space-y-6">
        {budgets.map((b) => {
          const pct = Math.min(100, (b.spent / b.limit) * 100);
          const isOverBudget = b.spent >= b.limit;

          return (
            <div key={b.id} className="card-outline space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <h2 className="text-base font-heading font-bold text-ink">
                      {b.name}.
                    </h2>
                    <span className="text-xs text-text-muted font-mono">
                      Account: {b.account} · Period: {b.period}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                      isOverBudget
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : pct > 80
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {pct.toFixed(1)}% Consumed
                  </span>

                  {canManageBudgets && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBudgetId(b.id);
                        setEditLimitInput(b.limit.toString());
                      }}
                      className="p-1 rounded-full text-text-muted hover:text-ink hover:bg-canvas-soft transition"
                      title="Adjust Budget Ceiling Limit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Limit Inline Box */}
              {editingBudgetId === b.id && (
                <div className="p-3 bg-canvas-soft rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-ink">New Limit (USD):</span>
                    <input
                      type="number"
                      step="50"
                      value={editLimitInput}
                      onChange={(e) => setEditLimitInput(e.target.value)}
                      className="text-input font-mono !py-1 !px-3 w-32"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingBudgetId(null)}
                      className="button-outline text-xs !h-8 !py-1 !px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditLimit(b.id)}
                      className="button-primary text-xs !h-8 !py-1 !px-3"
                    >
                      Save Limit
                    </button>
                  </div>
                </div>
              )}

              {/* Progress & Limit Visual */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink font-bold text-sm">
                    Incurred Spend: ${b.spent.toFixed(2)} USD
                  </span>
                  <span className="text-text-muted">
                    Allocated Ceiling: ${b.limit.toFixed(2)} USD
                  </span>
                </div>

                <div className="w-full bg-field h-3 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-rose-600' : 'bg-ink'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Threshold Milestones Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {b.thresholds.map((th) => (
                    <div
                      key={th.percentage}
                      className={`p-3 rounded-2xl border text-xs transition-colors ${
                        th.triggered
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-canvas-soft border-hairline-soft text-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{th.percentage}% Threshold Ladder</span>
                        {th.triggered ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <p className="font-mono text-text-muted mt-1 text-[11px]">
                        Trigger Level: ${th.amount.toFixed(2)} USD
                      </p>
                      <span className="text-[10px] mt-1 block font-medium">
                        {th.triggered ? 'Triggered (Alert Dispatched)' : 'Active (Within Bounds)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deduplicated Alert Log */}
      <div className="card-outline space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline-soft">
          <div>
            <h2 className="text-base font-heading font-bold text-ink">
              Alert Event Dispatch History.
            </h2>
            <p className="text-xs text-text-muted">
              Idempotent threshold dispatch with deduplicated alert event guarantees (PRD US-5)
            </p>
          </div>
          <span className="text-xs text-text-muted font-mono">
            {alerts.length} Events Dispatched
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-4 rounded-2xl bg-canvas-soft border border-hairline-soft flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-full bg-canvas border border-hairline text-ink mt-0.5">
                  <Bell className="w-4 h-4 text-ink" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold text-ink block">
                    {alt.budgetName} — {alt.thresholdPercent}% Threshold Milestone
                  </span>
                  <p className="text-text-muted">
                    Spend reached ${alt.amount.toFixed(2)} USD. Trigger notification dispatched to subscribed Budget Owners.
                  </p>
                  <div className="flex items-center space-x-1.5 text-text-faint font-mono text-[10px] pt-1">
                    <Hash className="w-3 h-3 text-text-faint" />
                    <span>Dedupe-Key: {alt.dedupeKey}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-text-faint whitespace-nowrap self-start sm:self-auto">
                {alt.triggeredAt}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-outline max-w-lg w-full bg-canvas shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-hairline-soft">
              <h2 className="text-lg font-heading font-bold text-ink">
                Create New Budget Policy.
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-canvas-soft text-text-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Budget Policy Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Data Engineering Budget"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  className="text-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Target Cloud Account
                </label>
                <select
                  value={budgetAccount}
                  onChange={(e) => setBudgetAccount(e.target.value)}
                  className="text-input font-mono"
                >
                  <option value="111122223333">111122223333 (Primary AWS)</option>
                  <option value="222233334444">222233334444 (Staging AWS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Monthly Limit Amount (USD)
                </label>
                <input
                  type="number"
                  required
                  step="10"
                  placeholder="1500.00"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="text-input font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-text-muted mb-1">Threshold 1 (%)</label>
                  <input
                    type="number"
                    value={threshold1}
                    onChange={(e) => setThreshold1(e.target.value)}
                    className="text-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Threshold 2 (%)</label>
                  <input
                    type="number"
                    value={threshold2}
                    onChange={(e) => setThreshold2(e.target.value)}
                    className="text-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Threshold 3 (%)</label>
                  <input
                    type="number"
                    value={threshold3}
                    onChange={(e) => setThreshold3(e.target.value)}
                    className="text-input font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="button-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
