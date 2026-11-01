import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  UserCheck,
  X
} from 'lucide-react';
import { AnomalyFinding, UserProfile } from '../types';

interface AnomaliesScreenProps {
  anomalies: AnomalyFinding[];
  onReviewAnomaly: (
    id: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE',
    notes: string,
    reviewer: string
  ) => void;
  currentUser: UserProfile;
}

export const AnomaliesScreen: React.FC<AnomaliesScreenProps> = ({
  anomalies,
  onReviewAnomaly,
  currentUser,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE'>('ALL');
  const [reviewModalAnomaly, setReviewModalAnomaly] = useState<AnomalyFinding | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE'>('RESOLVED');
  const [reviewNotes, setReviewNotes] = useState('');

  const canReview = currentUser.role === 'ADMIN' || currentUser.role === 'ENGINEER';

  const filteredAnomalies = anomalies.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleOpenReview = (anom: AnomalyFinding) => {
    if (!canReview) {
      alert('Read-only Viewer or Budget Owner role cannot record anomaly resolutions. Switch to ADMIN or ENGINEER.');
      return;
    }
    setReviewModalAnomaly(anom);
    setReviewStatus(anom.status === 'NEW' ? 'ACKNOWLEDGED' : 'RESOLVED');
    setReviewNotes(anom.reviewNotes || '');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewModalAnomaly) {
      onReviewAnomaly(
        reviewModalAnomaly.id,
        reviewStatus,
        reviewNotes || 'Investigation confirmed with infrastructure operations.',
        currentUser.name
      );
      setReviewModalAnomaly(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
            Explainable Cost Anomaly Centre.
          </h1>
          <p className="text-base font-light text-text-muted mt-2 max-w-3xl">
            Statistical anomaly detection backed by rolling 14-day median baselines,
            absolute cost deltas, and percentage deviation triggers (PRD US-6).
          </p>
        </div>

        {/* Status Filter Pill Segment */}
        <div className="flex flex-wrap items-center bg-canvas-soft rounded-full p-1 border border-hairline text-xs">
          {(['ALL', 'NEW', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                statusFilter === s
                  ? 'bg-canvas text-ink shadow-soft'
                  : 'text-text-muted hover:text-ink'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Role Notice */}
      {!canReview && (
        <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline flex items-center space-x-3 text-xs text-text-muted">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are operating in <strong>{currentUser.role}</strong> mode. Triaging and resolving anomalies requires <strong>ENGINEER</strong> or <strong>ADMIN</strong> permissions.
          </span>
        </div>
      )}

      {/* Main Anomaly Cards List */}
      <div className="space-y-6">
        {filteredAnomalies.length > 0 ? (
          filteredAnomalies.map((anom) => (
            <div
              key={anom.id}
              className={`card-outline transition-all space-y-6 ${
                anom.status === 'NEW'
                  ? 'border-rose-200 bg-rose-50/10'
                  : anom.status === 'ACKNOWLEDGED'
                  ? 'border-amber-200 bg-amber-50/10'
                  : 'border-hairline bg-canvas'
              }`}
            >
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline-soft">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                      anom.severity === 'HIGH'
                        ? 'bg-rose-100 border-rose-300 text-rose-700'
                        : 'bg-canvas-soft border-hairline text-ink'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-heading font-bold text-ink">
                        {anom.service} Spend Spike.
                      </h2>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          anom.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {anom.severity} SEVERITY
                      </span>
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      Account: {anom.account} · Region: {anom.region} · Date: {anom.usageDate}
                    </span>
                  </div>
                </div>

                {/* Status pill */}
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                      anom.status === 'NEW'
                        ? 'bg-rose-100 text-rose-900 border-rose-200'
                        : anom.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : anom.status === 'FALSE_POSITIVE'
                        ? 'bg-slate-100 text-slate-800 border-slate-200'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    Status: {anom.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 bg-canvas rounded-2xl border border-hairline-soft">
                  <span className="text-text-muted font-sans text-[11px] block">Observed Spend</span>
                  <span className="text-lg font-bold text-ink">${anom.observedCost.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-canvas rounded-2xl border border-hairline-soft">
                  <span className="text-text-muted font-sans text-[11px] block">14-Day Median Baseline</span>
                  <span className="text-lg font-bold text-text-muted">${anom.baselineCost.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-canvas rounded-2xl border border-hairline-soft">
                  <span className="text-text-muted font-sans text-[11px] block">Absolute Delta</span>
                  <span className="text-lg font-bold text-rose-700">+${anom.deltaCost.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-canvas rounded-2xl border border-hairline-soft">
                  <span className="text-text-muted font-sans text-[11px] block">Percentage Deviation</span>
                  <span className="text-lg font-bold text-rose-700">+{anom.deviationPct.toFixed(0)}%</span>
                </div>
              </div>

              {/* Explanation text */}
              <div className="p-4 bg-canvas rounded-2xl border border-hairline-soft space-y-1">
                <span className="text-xs font-semibold text-ink flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Deterministic Diagnostic Explanation:</span>
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  {anom.explanation}
                </p>
              </div>

              {/* Audit Trail if reviewed */}
              {anom.reviewNotes && (
                <div className="p-3 bg-canvas-soft rounded-2xl border border-hairline text-xs space-y-1">
                  <div className="flex items-center justify-between text-text-muted text-[11px]">
                    <span className="flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-ink" />
                      <span>Reviewed by: <strong className="text-ink">{anom.reviewedBy || 'Engineer'}</strong></span>
                    </span>
                    <span className="font-mono">{anom.reviewedAt}</span>
                  </div>
                  <p className="text-ink font-sans pl-4 border-l-2 border-hairline">
                    "{anom.reviewNotes}"
                  </p>
                </div>
              )}

              {/* Action buttons (Stadium Pills) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-text-muted">
                  Requires human investigation prior to permanent signoff.
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={!canReview}
                    onClick={() => handleOpenReview(anom)}
                    className="button-primary text-xs !h-9 !py-1 !px-4 disabled:opacity-50"
                  >
                    <span>Triage &amp; Review Anomaly ↗</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card-outline p-8 text-center text-xs text-text-muted">
            No anomalies found matching the selected filter ({statusFilter}).
          </div>
        )}
      </div>

      {/* Detection Formula Reference */}
      <div className="card-featured space-y-3">
        <h3 className="text-sm font-heading font-bold text-ink">
          Mathematical Baseline &amp; Threshold Rules (PRD US-6).
        </h3>
        <p className="text-xs text-text-muted leading-relaxed font-mono">
          Trigger Condition: Observed_Spend &gt; Baseline_Median + (3.0 × MAD) AND Delta_Percentage &gt;= 50% AND Absolute_Delta &gt;= $10.00
        </p>
        <p className="text-xs text-text-muted">
          Protects against spurious triggers during low-cost noise periods while guaranteeing critical spike escalation on runaway cloud workloads.
        </p>
      </div>

      {/* Review Modal */}
      {reviewModalAnomaly && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-outline max-w-lg w-full bg-canvas shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-hairline-soft">
              <h2 className="text-lg font-heading font-bold text-ink">
                Review Anomaly: {reviewModalAnomaly.service}.
              </h2>
              <button
                type="button"
                onClick={() => setReviewModalAnomaly(null)}
                className="p-1.5 rounded-full hover:bg-canvas-soft text-text-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Resolution Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewStatus(st)}
                      className={`p-2.5 rounded-2xl border text-center font-semibold transition ${
                        reviewStatus === st
                          ? 'border-ink bg-canvas-soft text-ink'
                          : 'border-hairline text-text-muted hover:text-ink'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Engineer Investigation Notes &amp; Root Cause
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. EC2 runaway stress-test script completed; instance terminated by dev team."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReviewModalAnomaly(null)}
                  className="button-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
