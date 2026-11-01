import { useState, useMemo } from 'react';
import {
  NavScreen,
  UserRole,
  UserProfile,
  CostRecord,
  IngestionBatch,
  BudgetConfig,
  BudgetAlertEvent,
  AnomalyFinding,
  OptimizationCandidate,
  CloudAccount
} from './types';
import {
  MOCK_USERS,
  MOCK_ACCOUNTS,
  INITIAL_COST_RECORDS,
  INITIAL_BATCHES,
  INITIAL_BUDGETS,
  INITIAL_ALERTS,
  INITIAL_ANOMALIES,
  INITIAL_OPTIMIZATION_CANDIDATES
} from './utils/mockData';

// UI Components
import { Navbar } from './components/Navbar';
import { BrandMarquee } from './components/BrandMarquee';
import { Footer } from './components/Footer';
import { UserPersonaModal } from './components/UserPersonaModal';

// Modular Screen Views
import { OverviewScreen } from './screens/OverviewScreen';
import { ImportsScreen } from './screens/ImportsScreen';
import { ExplorerScreen } from './screens/ExplorerScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { AnomaliesScreen } from './screens/AnomaliesScreen';
import { ForecastsScreen } from './screens/ForecastsScreen';
import { OptimizationScreen } from './screens/OptimizationScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  // Navigation & User Context
  const [activeScreen, setActiveScreen] = useState<NavScreen>('overview');
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.ADMIN);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Cloud Account Context
  const [accounts, setAccounts] = useState<CloudAccount[]>(MOCK_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('111122223333');

  // Core Data Store
  const [records, setRecords] = useState<CostRecord[]>(INITIAL_COST_RECORDS);
  const [batches, setBatches] = useState<IngestionBatch[]>(INITIAL_BATCHES);
  const [budgets, setBudgets] = useState<BudgetConfig[]>(INITIAL_BUDGETS);
  const [alerts, setAlerts] = useState<BudgetAlertEvent[]>(INITIAL_ALERTS);
  const [anomalies, setAnomalies] = useState<AnomalyFinding[]>(INITIAL_ANOMALIES);
  const [candidates, setCandidates] = useState<OptimizationCandidate[]>(INITIAL_OPTIMIZATION_CANDIDATES);

  // Quick filter for Explorer when clicked from Overview
  const [explorerServiceFilter, setExplorerServiceFilter] = useState<string>('ALL');

  // Filtered records based on active account scope
  const activeRecords = useMemo(() => {
    if (selectedAccountId === 'ALL') return records;
    return records.filter((r) => r.accountId === selectedAccountId);
  }, [records, selectedAccountId]);

  // Active budget for the selected account
  const activeBudget = useMemo(() => {
    return budgets.find((b) => b.account === selectedAccountId) || budgets[0];
  }, [budgets, selectedAccountId]);

  const activeAccountObj = accounts.find((a) => a.externalAccountId === selectedAccountId);
  const activeAccountDisplayName =
    selectedAccountId === 'ALL' ? 'All Accounts' : activeAccountObj?.displayName || 'Primary AWS';

  // Count new anomalies for navbar badge
  const anomalyNewCount = anomalies.filter((a) => a.status === 'NEW').length;

  // Identified potential savings
  const identifiedSavings = candidates
    .filter((c) => c.status !== 'DISMISSED')
    .reduce((acc, curr) => acc + curr.estimatedMonthlySavings, 0);

  // Re-evaluate budget thresholds and trigger alerts when records change
  const evaluateBudgetThresholds = (currentRecords: CostRecord[]) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((b) => {
        const spent = currentRecords
          .filter((r) => r.accountId === b.account)
          .reduce((acc, r) => acc + r.costAmount, 0);

        const updatedThresholds = b.thresholds.map((th) => {
          const thresholdAmount = b.limit * (th.percentage / 100);
          const isTriggered = spent >= thresholdAmount;

          if (isTriggered && !th.triggered) {
            const dedupeKey = `${b.id}:2026-10-01:${th.percentage}`;
            setAlerts((prevAlerts) => {
              if (prevAlerts.some((a) => a.dedupeKey === dedupeKey)) return prevAlerts;
              return [
                {
                  id: `alt-${Date.now()}-${th.percentage}`,
                  budgetId: b.id,
                  budgetName: b.name,
                  thresholdPercent: th.percentage,
                  amount: thresholdAmount,
                  triggeredAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
                  dedupeKey,
                  status: 'DISPATCHED',
                },
                ...prevAlerts,
              ];
            });
          }

          return { ...th, triggered: isTriggered };
        });

        return { ...b, spent, thresholds: updatedThresholds };
      })
    );
  };

  // Add new ingestion batch and append records
  const handleAddBatch = (batch: IngestionBatch) => {
    setBatches((prev) => [batch, ...prev]);
  };

  const handleAddRecords = (newRecords: CostRecord[]) => {
    const updated = [...records, ...newRecords];
    setRecords(updated);
    evaluateBudgetThresholds(updated);
  };

  // Spike detection trigger when spike fixture is loaded
  const handleSpikeDetected = (service: string, amount: number) => {
    const newAnomaly: AnomalyFinding = {
      id: `anom-${Date.now()}`,
      severity: 'HIGH',
      service,
      account: '111122223333',
      region: 'us-east-1',
      usageDate: '2026-10-06',
      observedCost: amount,
      baselineCost: 14.5,
      deltaCost: amount - 14.5,
      deviationPct: Math.round(((amount - 14.5) / 14.5) * 100),
      status: 'NEW',
      explanation: `Injected spike: Observed cost ($${amount.toFixed(2)}) significantly exceeded baseline ($14.50) on 2026-10-06. Severity marked HIGH.`,
    };
    setAnomalies((prev) => [newAnomaly, ...prev]);
  };

  // Update budget limit
  const handleUpdateBudgetLimit = (id: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const thresholds = b.thresholds.map((th) => ({
          ...th,
          amount: newLimit * (th.percentage / 100),
          triggered: b.spent >= newLimit * (th.percentage / 100),
        }));
        return { ...b, limit: newLimit, thresholds };
      })
    );
  };

  // Review anomaly finding
  const handleReviewAnomaly = (
    id: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE',
    notes: string,
    reviewer: string
  ) => {
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              reviewNotes: notes,
              reviewedBy: reviewer,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            }
          : a
      )
    );
  };

  // Review optimization candidate
  const handleReviewCandidate = (
    id: string,
    action: 'APPROVED' | 'DISMISSED' | 'DEFERRED',
    notes?: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: action,
              reviewNotes: notes,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            }
          : c
      )
    );
  };

  // Export entire application state snapshot
  const handleExportSnapshot = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      user: currentUser,
      selectedAccountId,
      accounts,
      recordsCount: records.length,
      totalSpend: records.reduce((acc, r) => acc + r.costAmount, 0),
      budgets,
      alerts,
      anomalies,
      candidates,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudpilot_state_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Navigate to explorer with pre-selected service filter
  const handleFilterServiceFromOverview = (serviceName: string) => {
    setExplorerServiceFilter(serviceName);
    setActiveScreen('explorer');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-ink selection:text-white">
      {/* Top Floating Stadium Nav Pill */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        anomalyNewCount={anomalyNewCount}
        onQuickUpload={() => setActiveScreen('imports')}
      />

      {/* Main Content View Routing */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        {activeScreen === 'overview' && (
          <OverviewScreen
            onNavigate={setActiveScreen}
            onFilterService={handleFilterServiceFromOverview}
            records={activeRecords}
            activeBudget={activeBudget}
            activeAccountDisplayName={activeAccountDisplayName}
            activeAccountId={selectedAccountId}
            identifiedSavings={identifiedSavings}
          />
        )}

        {activeScreen === 'imports' && (
          <ImportsScreen
            batches={batches}
            existingRecords={records}
            onAddBatch={handleAddBatch}
            onAddRecords={handleAddRecords}
            onAnomalyDetected={handleSpikeDetected}
            currentRole={currentUser.role}
          />
        )}

        {activeScreen === 'explorer' && (
          <ExplorerScreen
            records={activeRecords}
            initialServiceFilter={explorerServiceFilter}
            initialAccountId={selectedAccountId}
          />
        )}

        {activeScreen === 'budgets' && (
          <BudgetsScreen
            budgets={budgets}
            alerts={alerts}
            onAddBudget={(b) => setBudgets((prev) => [b, ...prev])}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            currentRole={currentUser.role}
          />
        )}

        {activeScreen === 'anomalies' && (
          <AnomaliesScreen
            anomalies={anomalies}
            onReviewAnomaly={handleReviewAnomaly}
            currentUser={currentUser}
          />
        )}

        {activeScreen === 'forecasts' && (
          <ForecastsScreen
            totalSpend={activeRecords.reduce((acc, r) => acc + r.costAmount, 0)}
          />
        )}

        {activeScreen === 'optimization' && (
          <OptimizationScreen
            candidates={candidates}
            onReviewCandidate={handleReviewCandidate}
            currentUser={currentUser}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            currentUser={currentUser}
            onOpenUserModal={() => setIsUserModalOpen(true)}
            accounts={accounts}
            onAddAccount={(acc) => setAccounts((prev) => [...prev, acc])}
            onExportSnapshot={handleExportSnapshot}
          />
        )}
      </main>

      {/* Full-bleed Brand Squircle Marquee Band */}
      <BrandMarquee />

      {/* Full-bleed Near-Black Inverted Footer with Rounded Top Corners */}
      <Footer onNavigate={setActiveScreen} />

      {/* Interactive User Persona & RBAC Switcher Modal */}
      <UserPersonaModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onSelectRole={(role: UserRole) => setCurrentUser(MOCK_USERS[role])}
      />
    </div>
  );
}
