import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  FileCode,
  X
} from 'lucide-react';
import { OptimizationCandidate, UserProfile } from '../types';
import { SquircleIcon } from '../components/SquircleIcon';

interface OptimizationScreenProps {
  candidates: OptimizationCandidate[];
  onReviewCandidate: (id: string, action: 'APPROVED' | 'DISMISSED' | 'DEFERRED', notes?: string) => void;
  currentUser: UserProfile;
}

export const OptimizationScreen: React.FC<OptimizationScreenProps> = ({
  candidates,
  onReviewCandidate,
  currentUser,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DISMISSED'>('ALL');
  const [activeTicketCandidate, setActiveTicketCandidate] = useState<OptimizationCandidate | null>(null);
  const [copiedTerraform, setCopiedTerraform] = useState(false);

  const canReview = currentUser.role === 'ADMIN' || currentUser.role === 'ENGINEER';

  const filteredCandidates = candidates.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const totalIdentifiedSavings = candidates
    .filter((c) => c.status !== 'DISMISSED')
    .reduce((acc, curr) => acc + curr.estimatedMonthlySavings, 0);

  const handleCopyTerraform = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTerraform(true);
    setTimeout(() => setCopiedTerraform(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
            Human-Reviewed Optimization Candidates.
          </h1>
          <p className="text-base font-light text-text-muted mt-2 max-w-3xl">
            Conservative, evidence-backed rightsizing recommendations. CloudPilot is 100% read-only
            and never resizes, stops, or terminates live resources (PRD US-8).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center bg-canvas-soft rounded-full p-1 border border-hairline text-xs">
          {(['ALL', 'PENDING', 'APPROVED', 'DISMISSED'] as const).map((s) => (
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
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Strict Read-Only Safety Principle Banner */}
      <div className="card-featured flex items-start space-x-4 border border-hairline">
        <div className="w-10 h-10 rounded-full bg-ink text-canvas flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-canvas" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-heading font-bold text-ink">
              Safety Principle: Advisory and Non-Destructive.
            </h2>
            <span className="badge-popular">
              ~${totalIdentifiedSavings.toFixed(2)}/mo Total Potential
            </span>
          </div>
          <p className="text-text-muted leading-relaxed">
            CloudPilot does not possess mutation IAM policies. Optimization candidates must be reviewed
            by authorized infrastructure engineers before any Terraform PR or console change is executed.
          </p>
        </div>
      </div>

      {/* Role Notice */}
      {!canReview && (
        <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline flex items-center space-x-3 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are operating in <strong>{currentUser.role}</strong> mode. Reviewing and approving rightsizing proposals requires <strong>ENGINEER</strong> or <strong>ADMIN</strong> permissions.
          </span>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-6">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              className={`card-outline transition-all space-y-6 ${
                cand.popular ? 'border-hairline bg-canvas' : ''
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline-soft">
                <div className="flex items-center space-x-3">
                  <SquircleIcon name={cand.service} size="md" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-heading font-bold text-ink">
                        {cand.recommendationType}.
                      </h3>
                      {cand.popular && (
                        <span className="badge-popular">Popular Savings</span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      Resource: {cand.resourceId} · Service: {cand.service}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-canvas-soft text-ink font-semibold border border-hairline">
                    Confidence: {cand.confidence}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                      cand.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : cand.status === 'DISMISSED'
                        ? 'bg-slate-100 text-slate-800 border-slate-200'
                        : 'bg-canvas-soft text-text-muted border-hairline'
                    }`}
                  >
                    {cand.status === 'PENDING' ? 'Needs Human Review' : cand.status}
                  </span>
                </div>
              </div>

              {/* Recommendation Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rightsizing Specification */}
                <div className="p-4 bg-canvas-soft rounded-2xl flex items-center justify-between col-span-2">
                  <div>
                    <span className="text-[11px] font-sans text-text-muted block">
                      Current Configuration
                    </span>
                    <span className="text-sm font-bold font-mono text-ink">
                      {cand.currentType}
                    </span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-text-muted mx-4 flex-shrink-0" />

                  <div>
                    <span className="text-[11px] font-sans text-text-muted block">
                      Target Configuration
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-700">
                      {cand.recommendedType}
                    </span>
                  </div>
                </div>

                {/* Savings figure */}
                <div className="p-4 bg-canvas-soft rounded-2xl flex flex-col justify-center">
                  <span className="text-[11px] font-sans text-text-muted block">
                    Estimated Monthly Savings
                  </span>
                  <span className="text-2xl font-bold font-mono text-ink">
                    ~${cand.estimatedMonthlySavings.toFixed(2)}
                    <span className="text-xs font-normal text-text-muted font-sans">
                      /month
                    </span>
                  </span>
                </div>
              </div>

              {/* Telemetry Evidence Box */}
              <div className="p-4 bg-canvas-soft rounded-2xl border border-hairline-soft space-y-1">
                <span className="text-xs font-semibold text-ink flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Telemetry Evidence ({cand.lookbackDays}-Day Lookback):</span>
                </span>
                <p className="text-xs text-text-muted leading-relaxed font-mono">
                  {cand.metricReason}
                </p>
              </div>

              {/* Action Buttons (Stadium Pills) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-text-muted">
                  Decision is recorded in the platform audit history without live resource disruption.
                </span>

                <div className="flex items-center space-x-2">
                  {cand.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={!canReview}
                        onClick={() => onReviewCandidate(cand.id, 'DISMISSED', 'Rejected during human architectural review.')}
                        className="button-outline text-xs !h-9 disabled:opacity-50"
                      >
                        Dismiss Candidate
                      </button>
                      <button
                        type="button"
                        disabled={!canReview}
                        onClick={() => {
                          onReviewCandidate(cand.id, 'APPROVED', 'Approved for production engineering ticket.');
                          setActiveTicketCandidate(cand);
                        }}
                        className="button-primary text-xs !h-9 disabled:opacity-50"
                      >
                        Approve &amp; Export Ticket ↗
                      </button>
                    </>
                  )}

                  {cand.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => setActiveTicketCandidate(cand)}
                      className="button-outline text-xs !h-9 flex items-center space-x-1"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>View Generated Terraform Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card-outline p-8 text-center text-xs text-text-muted">
            No optimization candidates found matching the selected filter ({statusFilter}).
          </div>
        )}
      </div>

      {/* Generated Terraform & Jira Ticket Modal */}
      {activeTicketCandidate && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-outline max-w-xl w-full bg-canvas shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-hairline-soft">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-ink" />
                <h2 className="text-lg font-heading font-bold text-ink">
                  Generated Ticket: {activeTicketCandidate.recommendationType}.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicketCandidate(null)}
                className="p-1.5 rounded-full hover:bg-canvas-soft text-text-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-text-muted">
                Copy the code snippet below into your Terraform configuration or Jira ticket description.
              </p>

              {/* Terraform Snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-ink">
                  <span>Terraform Configuration Snippet:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyTerraform(
                        `# CloudPilot Rightsizing Advisory\n# Target: ${activeTicketCandidate.resourceId}\n# Estimated Savings: ~$${activeTicketCandidate.estimatedMonthlySavings}/month\n\nresource "aws_instance" "app" {\n  instance_type = "${
                          activeTicketCandidate.recommendedType.split(' ')[0]
                        }"\n  # Lookback Evidence: ${activeTicketCandidate.metricReason}\n}`
                      )
                    }
                    className="text-xs text-accent hover:underline flex items-center space-x-1"
                  >
                    {copiedTerraform ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Terraform</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-canvas-soft rounded-2xl border border-hairline font-mono text-[11px] text-ink overflow-x-auto">
{`# CloudPilot Rightsizing Advisory
# Target: ${activeTicketCandidate.resourceId}
# Estimated Savings: ~$${activeTicketCandidate.estimatedMonthlySavings}/month

resource "aws_instance" "app" {
  instance_type = "${activeTicketCandidate.recommendedType.split(' ')[0]}"
  # Lookback Evidence: ${activeTicketCandidate.metricReason}
}`}
                </pre>
              </div>

              {/* Jira Description Snippet */}
              <div className="p-3 bg-canvas-soft rounded-2xl border border-hairline space-y-1">
                <span className="font-semibold text-ink block">Jira Ticket Summary:</span>
                <p className="font-mono text-text-muted text-[11px]">
                  [FinOps] Rightsizing candidate for {activeTicketCandidate.resourceId} ({activeTicketCandidate.currentType} → {activeTicketCandidate.recommendedType}) yielding estimated savings of ~${activeTicketCandidate.estimatedMonthlySavings}/month.
                </p>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTicketCandidate(null)}
                  className="button-primary text-xs !h-9"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
