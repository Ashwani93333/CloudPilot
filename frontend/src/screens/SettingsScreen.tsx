import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  UserCheck,
  Download,
  Plus,
  X
} from 'lucide-react';
import { UserProfile, CloudAccount } from '../types';

interface SettingsScreenProps {
  currentUser: UserProfile;
  onOpenUserModal: () => void;
  accounts: CloudAccount[];
  onAddAccount: (acc: CloudAccount) => void;
  onExportSnapshot: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  onOpenUserModal,
  accounts,
  onAddAccount,
  onExportSnapshot,
}) => {
  const [adapterMode, setAdapterMode] = useState<'MOCK' | 'LIVE_SDK'>('MOCK');
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountRegion, setNewAccountRegion] = useState('us-east-1');

  const canManageAccounts = currentUser.role === 'ADMIN';

  const rbacMatrix = [
    { permission: 'View Dashboard & Cost Aggregates', admin: true, engineer: true, budgetOwner: true, viewer: true },
    { permission: 'Upload & Parse Billing CSV Files', admin: true, engineer: true, budgetOwner: false, viewer: false },
    { permission: 'Create & Modify Financial Budgets', admin: true, engineer: false, budgetOwner: true, viewer: false },
    { permission: 'Acknowledge & Triage Anomalies', admin: true, engineer: true, budgetOwner: false, viewer: false },
    { permission: 'Review & Approve Rightsizing Candidates', admin: true, engineer: true, budgetOwner: false, viewer: false },
    { permission: 'Register Cloud Accounts & Manage RBAC', admin: true, engineer: false, budgetOwner: false, viewer: false },
  ];

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageAccounts) {
      alert('Only Administrators can register cloud accounts.');
      return;
    }
    const newAcc: CloudAccount = {
      id: `acc-${Date.now().toString().slice(-4)}`,
      externalAccountId: newAccountId.trim() || '333344445555',
      displayName: newAccountName.trim() || 'New Cloud Environment',
      provider: 'AWS',
      connectionStatus: 'ACTIVE',
      defaultRegion: newAccountRegion,
      totalCost: 0,
      recordsCount: 0,
    };
    onAddAccount(newAcc);
    setShowAddAccountModal(false);
    setNewAccountId('');
    setNewAccountName('');
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
            System Configuration &amp; Governance.
          </h1>
          <p className="text-base font-light text-text-muted mt-2 max-w-3xl">
            Manage connected cloud accounts, inspect RBAC permission enforcement, and configure provider adapter modes (PRD US-1, US-9).
          </p>
        </div>

        <button
          type="button"
          onClick={onExportSnapshot}
          className="button-outline self-start sm:self-auto flex items-center space-x-2"
        >
          <Download className="w-4 h-4 text-ink" />
          <span>Export State Snapshot</span>
        </button>
      </div>

      {/* Active Persona Profile Card */}
      <div className="card-featured space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-ink text-canvas flex items-center justify-center font-bold text-sm">
              {currentUser.avatarInitials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-heading font-bold text-ink">
                  {currentUser.name}.
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-canvas text-ink border border-hairline font-bold">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {currentUser.title} · {currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenUserModal}
            className="button-primary text-xs !h-9 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Role Persona</span>
          </button>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Logged in with Spring Security token context. In the Java backend, `@PreAuthorize("hasRole('${currentUser.role}')")` restricts operations accordingly.
        </p>
      </div>

      {/* RBAC Matrix Table (ex-data-table-cell chrome) */}
      <div className="card-outline space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline-soft">
          <div>
            <h2 className="text-base font-heading font-bold text-ink">
              Role-Based Access Control (RBAC) Matrix.
            </h2>
            <p className="text-xs text-text-muted">
              Security permissions mapped across CloudPilot persona tiers (active column highlighted)
            </p>
          </div>
          <span className="text-xs font-mono text-text-muted">Active: {currentUser.role}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted font-mono uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-sans font-medium text-xs">Capability</th>
                <th className={`pb-3 text-center ${currentUser.role === 'ADMIN' ? 'text-ink font-bold bg-canvas-soft rounded-t-lg' : ''}`}>
                  ADMIN
                </th>
                <th className={`pb-3 text-center ${currentUser.role === 'ENGINEER' ? 'text-ink font-bold bg-canvas-soft rounded-t-lg' : ''}`}>
                  ENGINEER
                </th>
                <th className={`pb-3 text-center ${currentUser.role === 'BUDGET_OWNER' ? 'text-ink font-bold bg-canvas-soft rounded-t-lg' : ''}`}>
                  BUDGET OWNER
                </th>
                <th className={`pb-3 text-center ${currentUser.role === 'VIEWER' ? 'text-ink font-bold bg-canvas-soft rounded-t-lg' : ''}`}>
                  VIEWER
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {rbacMatrix.map((row) => (
                <tr key={row.permission} className="hover:bg-canvas-soft/40 transition-colors">
                  <td className="py-3 font-medium text-ink">{row.permission}</td>
                  <td className={`py-3 text-center ${currentUser.role === 'ADMIN' ? 'bg-canvas-soft' : ''}`}>
                    {row.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </td>
                  <td className={`py-3 text-center ${currentUser.role === 'ENGINEER' ? 'bg-canvas-soft' : ''}`}>
                    {row.engineer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </td>
                  <td className={`py-3 text-center ${currentUser.role === 'BUDGET_OWNER' ? 'bg-canvas-soft' : ''}`}>
                    {row.budgetOwner ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </td>
                  <td className={`py-3 text-center ${currentUser.role === 'VIEWER' ? 'bg-canvas-soft' : ''}`}>
                    {row.viewer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Accounts & Storage Engine Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cloud Accounts List */}
        <div className="card-outline space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-hairline-soft">
            <div className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-ink" />
              <h3 className="text-base font-heading font-bold text-ink">
                Registered Cloud Accounts.
              </h3>
            </div>
            {canManageAccounts && (
              <button
                type="button"
                onClick={() => setShowAddAccountModal(true)}
                className="button-pill-soft text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3 bg-canvas-soft rounded-2xl border border-hairline flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-ink block">{acc.displayName}</span>
                  <span className="font-mono text-text-muted text-[11px]">
                    ID: {acc.externalAccountId} · Region: {acc.defaultRegion}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold font-mono">
                    {acc.connectionStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Provider Adapter Selector */}
          <div className="pt-2 text-xs">
            <label className="block text-text-muted mb-1 font-semibold">
              Provider Adapter Mode (Spring Bean Configuration)
            </label>
            <select
              aria-label="Provider Adapter Mode"
              value={adapterMode}
              onChange={(e) => setAdapterMode(e.target.value as any)}
              className="text-input font-medium cursor-pointer"
            >
              <option value="MOCK">MOCK / Offline Synthetic Fixtures (Default)</option>
              <option value="LIVE_SDK">AWS SDK v2 (Read-Only Cost Explorer)</option>
            </select>
          </div>
        </div>

        {/* Database & System Specifications */}
        <div className="card-outline space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-hairline-soft">
            <Database className="w-5 h-5 text-ink" />
            <h3 className="text-base font-heading font-bold text-ink">
              Database Engine &amp; Precision.
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-canvas-soft rounded-2xl flex justify-between items-center">
              <span className="text-text-muted">Storage Engine</span>
              <span className="font-mono font-bold text-ink">PostgreSQL 16.x</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl flex justify-between items-center">
              <span className="text-text-muted">Monetary Precision</span>
              <span className="font-mono font-bold text-ink">NUMERIC(19, 6)</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl flex justify-between items-center">
              <span className="text-text-muted">Migration Tool</span>
              <span className="font-mono font-bold text-ink">Flyway Baseline V1</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl flex justify-between items-center">
              <span className="text-text-muted">Deduplication Method</span>
              <span className="font-mono font-bold text-ink">SHA-256 Composite Key</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl flex justify-between items-center">
              <span className="text-text-muted">Deployment Standard</span>
              <span className="font-mono font-bold text-ink">Docker Compose (Modular Monolith)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-outline max-w-md w-full bg-canvas shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-hairline-soft">
              <h2 className="text-base font-heading font-bold text-ink">
                Connect New Cloud Account.
              </h2>
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="p-1 rounded-full hover:bg-canvas-soft"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-muted mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Analytics DataLake AWS"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="text-input"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1">AWS Account ID (12 Digits)</label>
                <input
                  type="text"
                  required
                  placeholder="333344445555"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  className="text-input font-mono"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1">Default Region</label>
                <select
                  value={newAccountRegion}
                  onChange={(e) => setNewAccountRegion(e.target.value)}
                  className="text-input font-mono"
                >
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                  <option value="us-west-2">us-west-2 (Oregon)</option>
                  <option value="eu-west-1">eu-west-1 (Ireland)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="button-outline text-xs !h-9"
                >
                  Cancel
                </button>
                <button type="submit" className="button-primary text-xs !h-9">
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
