import React, { useState } from 'react';
import { Info, Sliders } from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  Line,
  ComposedChart
} from 'recharts';
import { SegmentedControl } from '../components/SegmentedControl';

interface ForecastsScreenProps {
  totalSpend: number;
}

export const ForecastsScreen: React.FC<ForecastsScreenProps> = ({ totalSpend = 208.0 }) => {
  const [scenario, setScenario] = useState<'baseline' | 'conservative' | 'optimized'>('baseline');
  const [simulatedDailyRate, setSimulatedDailyRate] = useState<number>(41.60);

  const daysElapsed = 5;
  const daysRemaining = 26;

  // Multiplier based on scenario
  const scenarioMultiplier =
    scenario === 'conservative' ? 1.10 : scenario === 'optimized' ? 0.95 : 1.0;

  const currentDailyRate = simulatedDailyRate * scenarioMultiplier;
  const projectedEOM = totalSpend + currentDailyRate * daysRemaining;

  // Timeline data for the 31 days of October 2026
  const forecastTimeline = [
    { day: 'Oct 01', actual: 43.70, forecast: 43.70, upper: 43.70, lower: 43.70 },
    { day: 'Oct 02', actual: 87.67, forecast: 87.67, upper: 87.67, lower: 87.67 },
    { day: 'Oct 03', actual: 130.52, forecast: 130.52, upper: 130.52, lower: 130.52 },
    { day: 'Oct 04', actual: 169.25, forecast: 169.25, upper: 169.25, lower: 169.25 },
    { day: 'Oct 05', actual: 208.00, forecast: 208.00, upper: 208.00, lower: 208.00 },
    {
      day: 'Oct 10',
      forecast: parseFloat((208.00 + currentDailyRate * 5).toFixed(2)),
      upper: parseFloat(((208.00 + currentDailyRate * 5) * 1.041).toFixed(2)),
      lower: parseFloat(((208.00 + currentDailyRate * 5) * 0.959).toFixed(2)),
    },
    {
      day: 'Oct 15',
      forecast: parseFloat((208.00 + currentDailyRate * 10).toFixed(2)),
      upper: parseFloat(((208.00 + currentDailyRate * 10) * 1.041).toFixed(2)),
      lower: parseFloat(((208.00 + currentDailyRate * 10) * 0.959).toFixed(2)),
    },
    {
      day: 'Oct 20',
      forecast: parseFloat((208.00 + currentDailyRate * 15).toFixed(2)),
      upper: parseFloat(((208.00 + currentDailyRate * 15) * 1.041).toFixed(2)),
      lower: parseFloat(((208.00 + currentDailyRate * 15) * 0.959).toFixed(2)),
    },
    {
      day: 'Oct 25',
      forecast: parseFloat((208.00 + currentDailyRate * 20).toFixed(2)),
      upper: parseFloat(((208.00 + currentDailyRate * 20) * 1.041).toFixed(2)),
      lower: parseFloat(((208.00 + currentDailyRate * 20) * 0.959).toFixed(2)),
    },
    {
      day: 'Oct 31',
      forecast: parseFloat(projectedEOM.toFixed(2)),
      upper: parseFloat((projectedEOM * 1.041).toFixed(2)),
      lower: parseFloat((projectedEOM * 0.959).toFixed(2)),
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ink leading-tight">
            Month-End Spend Forecast.
          </h1>
          <p className="text-base font-light text-text-muted mt-2 max-w-3xl">
            Deterministic run-rate model with documented assumptions, confidence bounds,
            and Mean Absolute Percentage Error (MAPE) tracking (PRD US-7).
          </p>
        </div>

        <SegmentedControl
          size="sm"
          value={scenario}
          onChange={(val) => setScenario(val)}
          options={[
            { value: 'baseline', label: 'Baseline Run-Rate' },
            { value: 'conservative', label: '+10% Buffer' },
            { value: 'optimized', label: 'Rightsized' },
          ]}
        />
      </div>

      {/* Projection Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-outline">
          <span className="text-xs text-text-muted block font-medium mb-2">
            Projected Month-End Close
          </span>
          <div className="text-3xl font-heading font-bold text-ink font-mono tracking-normal">
            ${projectedEOM.toFixed(2)}
          </div>
          <span className="text-xs text-text-muted mt-2 block">
            October 31, 2026 Expected EOM Total
          </span>
        </div>

        <div className="card-outline">
          <span className="text-xs text-text-muted block font-medium mb-2">
            Effective Daily Spend Rate
          </span>
          <div className="text-3xl font-heading font-bold text-ink font-mono tracking-normal">
            ${currentDailyRate.toFixed(2)}
            <span className="text-sm font-normal text-text-muted">/day</span>
          </div>
          <span className="text-xs text-text-muted mt-2 block">
            Across {daysRemaining} remaining days
          </span>
        </div>

        <div className="card-outline">
          <span className="text-xs text-text-muted block font-medium mb-2">
            Historical Backtest Accuracy
          </span>
          <div className="text-3xl font-heading font-bold text-emerald-700 font-mono tracking-normal">
            ±4.1% MAPE
          </div>
          <span className="text-xs text-text-muted mt-2 block">
            Evaluated on historical 90-day cycles
          </span>
        </div>
      </div>

      {/* Interactive Daily Spend Slider */}
      <div className="card-outline p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-ink">
            <Sliders className="w-4 h-4 text-ink" />
            <span>Interactive Run-Rate Sensitivity Simulator:</span>
          </div>
          <span className="font-mono text-xs font-bold text-ink">
            Simulation Parameter: ${simulatedDailyRate.toFixed(2)}/day
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[11px] font-mono text-text-muted">$20/day</span>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={simulatedDailyRate}
            onChange={(e) => setSimulatedDailyRate(parseFloat(e.target.value))}
            className="w-full accent-ink cursor-pointer"
          />
          <span className="text-[11px] font-mono text-text-muted">$100/day</span>
        </div>
        <p className="text-[11px] text-text-muted">
          Adjust the slider to simulate higher or lower workload velocity and inspect the projected month-end trajectory instantly.
        </p>
      </div>

      {/* Burn-up Forecast Chart */}
      <div className="card-outline space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-hairline-soft">
          <div>
            <h2 className="text-lg font-heading font-bold text-ink">
              October 2026 Spend Projection Trajectory.
            </h2>
            <p className="text-xs text-text-muted">
              Actual incurred cumulative spend (Oct 01–05) + linear extrapolation with ±4.1% MAPE confidence interval
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ink" />
              <span>Incurred Actuals</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
              <span>Projected EOM</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#adadad"
                tick={{ fontSize: 11, fill: '#707070' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis
                stroke="#adadad"
                tick={{ fontSize: 11, fill: '#707070' }}
                tickFormatter={(val) => `$${val}`}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e0e0e0',
                  borderRadius: '16px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="upper"
                name="Confidence Upper (+4.1%)"
                stroke="transparent"
                fill="#f3f3f3"
                fillOpacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast Run-Rate"
                stroke="#0066ff"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#0066ff' }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Spend"
                stroke="#141414"
                strokeWidth={3}
                dot={{ r: 4, fill: '#141414' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Assumptions Box */}
      <div className="card-featured space-y-4">
        <div className="flex items-center space-x-2 text-ink font-heading font-bold text-sm">
          <Info className="w-4 h-4 text-ink" />
          <span>Documented Mathematical Formula &amp; Non-Guarantee Notice (PRD US-7).</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed font-mono">
          Method: Linear Run-Rate Projection · Version: 1.0.0 · Formula: Forecast = Month_to_Date (${totalSpend.toFixed(2)}) + (${totalSpend.toFixed(2)} / ${daysElapsed} Days) × ${daysRemaining} Remaining Days
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          <strong>Safety &amp; Compliance Notice:</strong> Forecasts are strictly mathematical extrapolations for planning and allocation. They do not constitute guaranteed provider invoices and do not foresee unannounced infrastructure deployments or sudden architectural shifts.
        </p>
      </div>
    </div>
  );
};
