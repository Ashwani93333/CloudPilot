import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CostRecord } from '../types';
import { SquircleIcon } from '../components/SquircleIcon';

interface ExplorerScreenProps {
  records: CostRecord[];
  initialServiceFilter?: string;
  initialAccountId?: string;
}

export const ExplorerScreen: React.FC<ExplorerScreenProps> = ({
  records,
  initialServiceFilter = 'ALL',
  initialAccountId = 'ALL',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(initialAccountId);
  const [selectedService, setSelectedService] = useState(initialServiceFilter);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'usageDate' | 'costAmount'>('usageDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const accounts = useMemo(() => {
    const set = new Set(records.map((r) => r.accountId));
    return ['ALL', ...Array.from(set)];
  }, [records]);

  const services = useMemo(() => {
    const set = new Set(records.map((r) => r.service));
    return ['ALL', ...Array.from(set)];
  }, [records]);

  const regions = useMemo(() => {
    const set = new Set(records.map((r) => r.region));
    return ['ALL', ...Array.from(set)];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch =
          r.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.usageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.resourceId && r.resourceId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesAccount = selectedAccount === 'ALL' || r.accountId === selectedAccount;
        const matchesService = selectedService === 'ALL' || r.service === selectedService;
        const matchesRegion = selectedRegion === 'ALL' || r.region === selectedRegion;

        let matchesDate = true;
        if (dateRangeFilter === 'OCT_1_3') {
          matchesDate = ['2026-10-01', '2026-10-02', '2026-10-03'].includes(r.usageDate);
        } else if (dateRangeFilter === 'OCT_4_5') {
          matchesDate = ['2026-10-04', '2026-10-05'].includes(r.usageDate);
        }

        return matchesSearch && matchesAccount && matchesService && matchesRegion && matchesDate;
      })
      .sort((a, b) => {
        if (sortField === 'costAmount') {
          return sortAsc ? a.costAmount - b.costAmount : b.costAmount - a.costAmount;
        }
        return sortAsc
          ? a.usageDate.localeCompare(b.usageDate)
          : b.usageDate.localeCompare(a.usageDate);
      });
  }, [records, searchTerm, selectedAccount, selectedService, selectedRegion, dateRangeFilter, sortField, sortAsc]);

  const totalFilteredCost = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + curr.costAmount, 0);
  }, [filteredRecords]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleExportCsv = () => {
    const headers = 'usage_date,service,region,usage_type,currency,cost_amount,resource_id,account_id\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `${r.usageDate},${r.service},${r.region},${r.usageType},${r.currency},${r.costAmount.toFixed(
            6
          )},${r.resourceId || ''},${r.accountId}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudpilot_cost_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedAccount('ALL');
    setSelectedService('ALL');
    setSelectedRegion('ALL');
    setDateRangeFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedAccount !== 'ALL' ||
    selectedService !== 'ALL' ||
    selectedRegion !== 'ALL' ||
    dateRangeFilter !== 'ALL';

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
            Cost Explorer.
          </h1>
          <p className="text-base font-light text-text-muted mt-2">
            Multidimensional slice-and-dice across AWS accounts, regions, service lines, and resources.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="button-primary self-start md:self-auto flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Bar with Field Tint Inputs (Border-free at rest, 2px ink ring on focus) */}
      <div className="card-outline space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search resource/type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="text-input pl-10"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              aria-label="Filter by Cloud Account"
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="text-input font-medium text-ink cursor-pointer"
            >
              <option value="ALL">All Cloud Accounts ({accounts.length - 1})</option>
              {accounts
                .filter((a) => a !== 'ALL')
                .map((a) => (
                  <option key={a} value={a}>
                    Acct {a}
                  </option>
                ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <select
              aria-label="Filter by Service"
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="text-input font-medium text-ink cursor-pointer"
            >
              <option value="ALL">All Services ({services.length - 1})</option>
              {services
                .filter((s) => s !== 'ALL')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              aria-label="Filter by Region"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="text-input font-medium text-ink cursor-pointer"
            >
              <option value="ALL">All Regions ({regions.length - 1})</option>
              {regions
                .filter((r) => r !== 'ALL')
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              aria-label="Filter by Date Window"
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-input font-medium text-ink cursor-pointer"
            >
              <option value="ALL">All Dates (Oct 01 – Oct 07)</option>
              <option value="OCT_1_3">Oct 01 – Oct 03 (3-Day Cycle)</option>
              <option value="OCT_4_5">Oct 04 – Oct 05 (Weekend)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-hairline-soft text-xs text-text-muted gap-2">
          <div className="flex items-center space-x-3">
            <span>
              Showing <strong className="text-ink">{filteredRecords.length}</strong> of{' '}
              <strong className="text-ink">{records.length}</strong> total records
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-accent hover:underline flex items-center space-x-1 font-semibold"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-text-muted text-[11px] font-sans">
              Measure: <strong className="text-ink">Unblended Incurred Cost</strong>
            </span>
            <span className="font-mono text-ink text-sm font-bold">
              Subtotal: ${totalFilteredCost.toFixed(6)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Table (Shadow-Free, Clean Hairlines) */}
      <div className="card-outline space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-hairline text-text-muted font-sans font-medium pb-2">
                <th
                  className="pb-3 cursor-pointer hover:text-ink select-none"
                  onClick={() => {
                    if (sortField === 'usageDate') setSortAsc(!sortAsc);
                    else {
                      setSortField('usageDate');
                      setSortAsc(false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Usage Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="pb-3">Service</th>
                <th className="pb-3">Account</th>
                <th className="pb-3">Region</th>
                <th className="pb-3">Usage Type</th>
                <th className="pb-3">Resource ID</th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-ink select-none"
                  onClick={() => {
                    if (sortField === 'costAmount') setSortAsc(!sortAsc);
                    else {
                      setSortField('costAmount');
                      setSortAsc(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Cost (USD)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-canvas-soft/60 transition-colors">
                    <td className="py-3 text-ink font-sans">{rec.usageDate}</td>
                    <td className="py-3 font-sans">
                      <div className="flex items-center space-x-2">
                        <SquircleIcon name={rec.service} size="sm" />
                        <span className="font-semibold text-ink">{rec.service}</span>
                      </div>
                    </td>
                    <td className="py-3 text-text-muted text-[11px]">{rec.accountId}</td>
                    <td className="py-3 text-text-muted font-sans">{rec.region}</td>
                    <td className="py-3 text-ink-soft">{rec.usageType}</td>
                    <td className="py-3 text-text-faint text-[11px] max-w-xs truncate" title={rec.resourceId}>
                      {rec.resourceId || '—'}
                    </td>
                    <td className="py-3 text-right font-bold text-ink">
                      ${rec.costAmount.toFixed(6)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted font-sans">
                    No cost records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-hairline-soft flex items-center justify-between text-xs text-text-muted">
            <span>
              Page <strong className="text-ink">{currentPage}</strong> of <strong className="text-ink">{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="button-outline text-xs !h-8 !py-1 !px-3 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="button-outline text-xs !h-8 !py-1 !px-3 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
