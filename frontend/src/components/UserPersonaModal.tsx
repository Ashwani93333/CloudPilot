import React from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../utils/mockData';

interface UserPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectRole: (role: UserRole) => void;
}

export const UserPersonaModal: React.FC<UserPersonaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  const rolesList: { role: UserRole; name: string; email: string; title: string; desc: string }[] = [
    {
      role: 'ADMIN',
      name: MOCK_USERS.ADMIN.name,
      email: MOCK_USERS.ADMIN.email,
      title: MOCK_USERS.ADMIN.title,
      desc: 'Full read/write permissions, billing file ingestion, cloud account lifecycle, global system governance.',
    },
    {
      role: 'ENGINEER',
      name: MOCK_USERS.ENGINEER.name,
      email: MOCK_USERS.ENGINEER.email,
      title: MOCK_USERS.ENGINEER.title,
      desc: 'Investigate cost drivers, analyze multidimensional records, triage anomalies, and review rightsizing candidates.',
    },
    {
      role: 'BUDGET_OWNER',
      name: MOCK_USERS.BUDGET_OWNER.name,
      email: MOCK_USERS.BUDGET_OWNER.email,
      title: MOCK_USERS.BUDGET_OWNER.title,
      desc: 'Establish financial budgets, configure multi-tier threshold alerts, examine EOM projections.',
    },
    {
      role: 'VIEWER',
      name: MOCK_USERS.VIEWER.name,
      email: MOCK_USERS.VIEWER.email,
      title: MOCK_USERS.VIEWER.title,
      desc: 'Read-only access across summaries and charts. Cannot mutate budgets, ingest files, or approve recommendations.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-outline max-w-xl w-full bg-canvas shadow-lg space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline-soft">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-ink">
                Authentication &amp; Persona Switcher.
              </h2>
              <p className="text-xs text-text-muted">
                Simulate role-based access control (RBAC) tiers defined in the PRD
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-canvas-soft text-text-muted hover:text-ink transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Banner */}
        <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-ink text-canvas flex items-center justify-center font-bold text-xs">
              {currentUser.avatarInitials}
            </div>
            <div>
              <span className="font-heading font-bold text-ink text-sm block">
                {currentUser.name}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {currentUser.email} · {currentUser.role}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-canvas text-ink border border-hairline">
            Active Session
          </span>
        </div>

        {/* Roles List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-ink block">
            Select Persona to Simulate:
          </span>

          {rolesList.map((item) => {
            const isSelected = currentUser.role === item.role;
            return (
              <div
                key={item.role}
                onClick={() => {
                  onSelectRole(item.role);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-ink bg-canvas-soft/80'
                    : 'border-hairline hover:border-hairline-soft bg-canvas hover:bg-canvas-soft/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-bold text-sm text-ink">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-ink text-canvas'
                          : 'bg-hairline text-ink-soft'
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-mono">{item.email}</p>
                  <p className="text-xs text-text-muted pt-1 leading-relaxed max-w-md">
                    {item.desc}
                  </p>
                </div>

                <div className="self-end sm:self-center">
                  {isSelected ? (
                    <span className="text-xs font-semibold text-ink flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Current</span>
                    </span>
                  ) : (
                    <span className="button-outline text-xs !h-8 !py-1 !px-3 flex items-center space-x-1">
                      <span>Switch</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / JWT Note */}
        <div className="pt-2 border-t border-hairline-soft flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-text-muted" />
            <span>Spring Security JWT Protocol</span>
          </span>
          <span className="font-mono text-text-faint">BCrypt (Cost 12)</span>
        </div>
      </div>
    </div>
  );
};
