import React, { useState } from 'react';
import {
  Layers,
  Menu,
  X,
  UploadCloud,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { NavScreen, UserProfile, CloudAccount } from '../types';

interface NavbarProps {
  activeScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  currentUser: UserProfile;
  onOpenUserModal: () => void;
  accounts: CloudAccount[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
  anomalyNewCount: number;
  onQuickUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  currentUser,
  onOpenUserModal,
  accounts,
  selectedAccountId,
  onSelectAccount,
  anomalyNewCount,
  onQuickUpload,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: NavScreen; label: string; badge?: string; accentBadge?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'imports', label: 'Imports', badge: 'CSV' },
    { id: 'explorer', label: 'Explorer' },
    { id: 'budgets', label: 'Budgets' },
    {
      id: 'anomalies',
      label: 'Anomalies',
      badge: anomalyNewCount > 0 ? `${anomalyNewCount}` : undefined,
      accentBadge: anomalyNewCount > 0,
    },
    { id: 'forecasts', label: 'Forecasts' },
    { id: 'optimization', label: 'Optimization' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-4 z-50 px-3 sm:px-6 w-full flex justify-center pointer-events-none">
      {/* Floating Stadium Nav Pill in canvas-soft (#f3f3f3) */}
      <div className="w-full max-w-6xl pointer-events-auto bg-canvas-soft border border-hairline/70 rounded-full px-3.5 sm:px-5 py-2 flex items-center justify-between transition-all duration-200 shadow-none">
        {/* Brand Lockup: Squircle Logo + Wordmark */}
        <div
          onClick={() => onNavigate('overview')}
          className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
        >
          <div
            className="w-8 h-8 bg-ink text-canvas app-icon-squircle flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ borderRadius: '30%' }}
          >
            <Layers className="w-4 h-4 text-canvas" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-heading text-sm sm:text-base font-bold text-ink tracking-normal">
              CloudPilot
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = activeScreen === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-ink text-canvas'
                    : 'text-text-muted hover:text-ink hover:bg-hairline/40'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      link.accentBadge
                        ? 'bg-accent text-white'
                        : isActive
                        ? 'bg-hairline text-ink'
                        : 'bg-hairline text-ink-soft'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Cluster: Account Filter + Persona Profile + Primary CTA */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Cloud Account Selector Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-canvas border border-hairline rounded-full px-2.5 py-1 text-xs">
            <span className="text-[10px] uppercase font-mono text-text-muted">Account:</span>
            <select
              value={selectedAccountId}
              aria-label="Filter by Cloud Account"
              onChange={(e) => onSelectAccount(e.target.value)}
              className="bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer pr-1 font-mono"
            >
              <option value="ALL">All Accounts (Consolidated)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.externalAccountId}>
                  {acc.externalAccountId} ({acc.displayName.slice(0, 10)}...)
                </option>
              ))}
            </select>
          </div>

          {/* User Persona Button */}
          <button
            type="button"
            onClick={onOpenUserModal}
            title={`Logged in as ${currentUser.name} (${currentUser.role}). Click to switch persona.`}
            className="flex items-center space-x-1.5 bg-canvas border border-hairline hover:border-hairline-soft rounded-full pl-1.5 pr-2.5 py-1 text-xs transition cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-ink text-canvas flex items-center justify-center font-bold text-[10px]">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden md:flex flex-col text-left leading-none">
              <span className="font-semibold text-ink text-[11px]">{currentUser.name}</span>
              <span className="text-[9px] font-mono text-text-muted">{currentUser.role}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {/* Primary CTA Stadium Pill */}
          <button
            type="button"
            onClick={onQuickUpload}
            className="button-primary text-xs !h-8 sm:!h-9 !py-1 !px-3 sm:!px-4 flex items-center space-x-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest CSV</span>
          </button>

          {/* Mobile / Tablet Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-full text-ink hover:bg-hairline/60"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Compact Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-4 top-20 bg-canvas border border-hairline rounded-3xl p-5 shadow-soft z-50 pointer-events-auto space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-2xl text-left text-xs font-semibold flex items-center justify-between ${
                  activeScreen === link.id
                    ? 'bg-ink text-canvas'
                    : 'bg-canvas-soft text-ink'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center justify-between sm:justify-start space-x-2">
              <span className="text-text-muted">Account:</span>
              <select
                value={selectedAccountId}
                onChange={(e) => onSelectAccount(e.target.value)}
                className="bg-canvas-soft text-xs font-semibold text-ink rounded-full px-3 py-1 border border-hairline outline-none"
              >
                <option value="ALL">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.externalAccountId}>
                    {acc.displayName} ({acc.externalAccountId})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenUserModal();
                setMobileMenuOpen(false);
              }}
              className="button-outline text-xs !h-8 justify-center"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>Switch Persona ({currentUser.role})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
