import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Hash,
  AlertTriangle,
  Download,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { IngestionBatch, CostRecord, UserRole } from '../types';
import {
  parseBillingCsv,
  FIXTURE_VALID_CSV,
  FIXTURE_MALFORMED_CSV,
  FIXTURE_OVERLAPPING_CSV,
  FIXTURE_SPIKE_CSV,
  ParseResult
} from '../utils/csvParser';

interface ImportsScreenProps {
  batches: IngestionBatch[];
  existingRecords: CostRecord[];
  onAddBatch: (batch: IngestionBatch) => void;
  onAddRecords: (records: CostRecord[]) => void;
  onAnomalyDetected?: (service: string, amount: number) => void;
  currentRole: UserRole;
}

export const ImportsScreen: React.FC<ImportsScreenProps> = ({
  batches,
  existingRecords,
  onAddBatch,
  onAddRecords,
  onAnomalyDetected,
  currentRole,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string>('');
  const [dedupNotice, setDedupNotice] = useState<string | null>(null);

  const isViewer = currentRole === 'VIEWER';

  const processCsvContent = async (filename: string, content: string) => {
    if (isViewer) {
      alert('Read-only Viewer role cannot upload or ingest billing files.');
      return;
    }

    setIsProcessing(true);
    setLoadedFileName(filename);
    setDedupNotice(null);

    try {
      const result = await parseBillingCsv(content);
      setParseResult(result);

      // 1. File-level SHA-256 Deduplication check (PRD FR-3, US-3)
      const existingBatch = batches.find(
        (b) => b.fingerprint.slice(0, 16) === result.fingerprint.slice(0, 16)
      );

      if (existingBatch) {
        setDedupNotice(
          `File-Level Deduplication Alert: Exact file "${filename}" was previously ingested in batch ${existingBatch.id}. Ingestion terminated early with zero double-counting.`
        );
        setIsProcessing(false);
        return;
      }

      // 2. Record-level Deduplication check via source_record_key
      const existingKeys = new Set(existingRecords.map((r) => r.sourceRecordKey || ''));
      let netNewRecords: CostRecord[] = [];
      let deduplicatedCount = 0;

      for (const rec of result.records) {
        if (rec.sourceRecordKey && existingKeys.has(rec.sourceRecordKey)) {
          deduplicatedCount++;
        } else {
          netNewRecords.push(rec);
        }
      }

      if (deduplicatedCount > 0) {
        setDedupNotice(
          `Record-Level Deduplication: ${deduplicatedCount} overlapping records detected and deduplicated via source_record_key. Only ${netNewRecords.length} net-new records ingested.`
        );
      }

      // Append net-new records
      if (netNewRecords.length > 0) {
        onAddRecords(netNewRecords);

        // Check if spike injected
        const spikeRow = netNewRecords.find((r) => r.costAmount > 100);
        if (spikeRow && onAnomalyDetected) {
          onAnomalyDetected(spikeRow.service, spikeRow.costAmount);
        }
      }

      // Register new batch
      const newBatch: IngestionBatch = {
        id: `batch-${Date.now().toString().slice(-4)}`,
        filename,
        accountId: result.records[0]?.accountId || '111122223333',
        fingerprint: result.fingerprint.slice(0, 16) + '...',
        status:
          result.rejectedRows === 0
            ? 'COMPLETED'
            : result.acceptedRows > 0
            ? 'COMPLETED_WITH_ERRORS'
            : 'FAILED',
        acceptedRows: netNewRecords.length,
        rejectedRows: result.rejectedRows,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        totalCost: netNewRecords.reduce((acc, r) => acc + r.costAmount, 0),
        errors: result.errors,
      };

      onAddBatch(newBatch);
    } catch (err) {
      console.error('CSV Parsing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isViewer) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvContent(file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvContent(file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const loadFixture = (type: 'valid' | 'malformed' | 'overlapping' | 'spike') => {
    if (type === 'valid') {
      processCsvContent('sample_billing_valid.csv', FIXTURE_VALID_CSV);
    } else if (type === 'malformed') {
      processCsvContent('sample_billing_malformed.csv', FIXTURE_MALFORMED_CSV);
    } else if (type === 'overlapping') {
      processCsvContent('sample_billing_overlapping.csv', FIXTURE_OVERLAPPING_CSV);
    } else if (type === 'spike') {
      processCsvContent('sample_billing_spike.csv', FIXTURE_SPIKE_CSV);
    }
  };

  const handleDownloadErrors = () => {
    if (!parseResult || parseResult.errors.length === 0) return;
    const header = 'row_number,column_name,error_message,raw_data\n';
    const rows = parseResult.errors
      .map(
        (e) =>
          `${e.rowNumber},"${e.column}","${e.message}","${e.rawData.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_errors_${loadedFileName || 'import'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
          Billing CSV Ingestion Pipeline.
        </h1>
        <p className="text-base font-light text-text-muted mt-2 max-w-3xl">
          Stream AWS CUR and CSV exports with SHA-256 fingerprint deduplication, row-level validation,
          and idempotent persistence.
        </p>
      </div>

      {/* Role Notice if Viewer */}
      {isViewer && (
        <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline flex items-center space-x-3 text-xs text-text-muted">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are logged in as a <strong>Read-Only Viewer</strong>. Ingestion triggers and file uploads are disabled by Spring Security RBAC. Switch to <strong>ADMIN</strong> or <strong>ENGINEER</strong> to upload files.
          </span>
        </div>
      )}

      {/* Dropzone & Quick-Loaders */}
      <div className="card-outline space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isViewer) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            isViewer
              ? 'opacity-60 cursor-not-allowed border-hairline bg-canvas-soft/30'
              : isDragging
              ? 'border-ink bg-canvas-soft cursor-pointer'
              : 'border-hairline bg-canvas hover:bg-canvas-soft/40 cursor-pointer'
          }`}
          onClick={() => {
            if (!isViewer) document.getElementById('csv-file-input')?.click();
          }}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            disabled={isViewer}
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="w-14 h-14 bg-canvas-soft rounded-full flex items-center justify-center mx-auto mb-4 border border-hairline">
            <UploadCloud className={`w-7 h-7 text-ink ${isProcessing ? 'animate-bounce' : ''}`} />
          </div>
          <h2 className="text-base font-heading font-bold text-ink">
            {isProcessing ? 'Validating and computing SHA-256...' : 'Drag and drop your billing CSV here.'}
          </h2>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Supports AWS Cost &amp; Usage Reports (CUR) or CloudPilot format. Validates ISO-8601 dates, currency (USD), and NUMERIC(19,6) values.
          </p>
          <div className="pt-4">
            <span className="button-outline text-xs !py-1.5 !px-4 pointer-events-none">
              Browse Local Files
            </span>
          </div>
        </div>

        {/* Synthetic Benchmark Fixture Quick-Loaders */}
        <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-ink block">
              Pre-Engineered Test Fixtures:
            </span>
            <span className="text-xs text-text-muted">
              Load synthetic datasets to verify validation, deduplication, and anomaly triggers
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isViewer}
              onClick={() => loadFixture('valid')}
              className="button-pill-soft text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Valid CSV (21 rows)</span>
            </button>
            <button
              type="button"
              disabled={isViewer}
              onClick={() => loadFixture('malformed')}
              className="button-pill-soft text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Malformed (5 errors)</span>
            </button>
            <button
              type="button"
              disabled={isViewer}
              onClick={() => loadFixture('overlapping')}
              className="button-pill-soft text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Overlapping (Dedup Test)</span>
            </button>
            <button
              type="button"
              disabled={isViewer}
              onClick={() => loadFixture('spike')}
              className="button-pill-soft text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Spike Injection (+$170.50)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deduplication Alert Notice if Triggered */}
      {dedupNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start space-x-3 text-xs text-blue-900">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">Deduplication Guard Engaged:</span>
            <p className="leading-relaxed">{dedupNotice}</p>
          </div>
        </div>
      )}

      {/* Real-time Validation Preview */}
      {parseResult && (
        <div className="card-outline space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline-soft">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-canvas-soft flex items-center justify-center border border-hairline">
                <FileSpreadsheet className="w-5 h-5 text-ink" />
              </div>
              <div>
                <h2 className="text-base font-heading font-bold text-ink">
                  Validation Results: {loadedFileName}.
                </h2>
                <div className="flex items-center space-x-2 text-xs text-text-muted font-mono mt-0.5">
                  <Hash className="w-3 h-3 text-text-faint" />
                  <span title={parseResult.fingerprint}>
                    SHA-256: {parseResult.fingerprint.slice(0, 24)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  parseResult.rejectedRows === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {parseResult.rejectedRows === 0 ? 'Verified 100% Valid' : `${parseResult.rejectedRows} Errors Isolated`}
              </span>
            </div>
          </div>

          {/* Validation Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-canvas-soft rounded-2xl">
              <span className="text-text-muted text-[11px] font-sans block">Total Rows In File</span>
              <span className="text-base font-bold text-ink">{parseResult.totalRows}</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl">
              <span className="text-text-muted text-[11px] font-sans block">Valid Rows</span>
              <span className="text-base font-bold text-emerald-700">{parseResult.acceptedRows}</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl">
              <span className="text-text-muted text-[11px] font-sans block">Rejected Errors</span>
              <span className="text-base font-bold text-rose-700">{parseResult.rejectedRows}</span>
            </div>
            <div className="p-3 bg-canvas-soft rounded-2xl">
              <span className="text-text-muted text-[11px] font-sans block">Calculated Spend</span>
              <span className="text-base font-bold text-ink">${parseResult.totalCost.toFixed(6)}</span>
            </div>
          </div>

          {/* Row-Level Errors List if Any */}
          {parseResult.errors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-rose-900 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Row-Level Validation Failures ({parseResult.errors.length} rows rejected):</span>
                </h3>
                <button
                  type="button"
                  onClick={handleDownloadErrors}
                  className="button-outline text-xs !h-7 !py-0.5 !px-2.5 flex items-center space-x-1 text-rose-900 border-rose-300 hover:bg-rose-100"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Error Log</span>
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 text-xs text-rose-800 font-mono">
                {parseResult.errors.map((err, idx) => (
                  <div key={idx} className="p-2 bg-white/70 rounded-lg border border-rose-100 flex items-start justify-between">
                    <div>
                      <strong className="text-rose-950">Row {err.rowNumber} [{err.column}]:</strong> {err.message}
                    </div>
                    <span className="text-[10px] text-text-muted font-mono truncate max-w-xs ml-2">
                      {err.rawData}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Accepted Records Table */}
          {parseResult.records.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="text-xs font-semibold text-ink mb-2">
                Parsed Sample Records (Showing up to 5 Rows):
              </h3>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-hairline text-text-muted font-sans">
                    <th className="pb-2">Usage Date</th>
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Region</th>
                    <th className="pb-2">Usage Type</th>
                    <th className="pb-2 text-right">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-soft">
                  {parseResult.records.slice(0, 5).map((rec) => (
                    <tr key={rec.id} className="hover:bg-canvas-soft/60">
                      <td className="py-2 text-ink">{rec.usageDate}</td>
                      <td className="py-2 text-ink font-semibold">{rec.service}</td>
                      <td className="py-2 text-text-muted">{rec.region}</td>
                      <td className="py-2 text-text-muted">{rec.usageType}</td>
                      <td className="py-2 text-right font-bold text-ink">${rec.costAmount.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Ingestion Batch History Table */}
      <div className="card-outline space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline-soft">
          <div>
            <h2 className="text-base font-heading font-bold text-ink">
              Recent Ingestion Batches.
            </h2>
            <p className="text-xs text-text-muted">
              Audit log of processed billing files with SHA-256 fingerprint verification
            </p>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {batches.length} Ingestion Batches Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted font-medium">
                <th className="pb-3">Batch File</th>
                <th className="pb-3">Account</th>
                <th className="pb-3">Fingerprint</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Rows (Accepted / Total)</th>
                <th className="pb-3 text-right">Net Incurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft font-mono">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-canvas-soft/40 transition-colors">
                  <td className="py-3 font-sans text-ink font-medium flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-ink-soft flex-shrink-0" />
                    <span>{batch.filename}</span>
                  </td>
                  <td className="py-3 text-text-muted">{batch.accountId}</td>
                  <td className="py-3 text-text-faint text-[11px]">{batch.fingerprint}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : batch.status === 'COMPLETED_WITH_ERRORS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-3 text-ink">
                    {batch.acceptedRows} / {batch.acceptedRows + batch.rejectedRows}
                  </td>
                  <td className="py-3 text-right font-bold text-ink">
                    ${batch.totalCost.toFixed(2)} USD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
