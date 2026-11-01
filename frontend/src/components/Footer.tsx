import React from 'react';
import { Layers, ArrowUpRight, Shield } from 'lucide-react';
import { NavScreen } from '../types';

interface FooterProps {
  onNavigate: (screen: NavScreen) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-ink text-canvas rounded-t-[32px] mt-24 pt-16 pb-12 px-6 sm:px-12 md:px-16 transition-all">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top: Wordmark at display scale & Mission */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-12 border-b border-[#262626]">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 bg-canvas text-ink flex items-center justify-center"
                style={{ borderRadius: '30%' }}
              >
                <Layers className="w-5 h-5 text-ink" />
              </div>
              <span className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-normal">
                CloudPilot.
              </span>
            </div>
            <p className="text-text-faint text-base font-light leading-relaxed">
              Deterministic cloud cost intelligence, explainable anomaly detection, and
              evidence-based rightsizing without infrastructure mutations.
            </p>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <span className="text-white font-semibold text-xs uppercase tracking-wider block">
                Modules
              </span>
              <ul className="space-y-2 text-text-faint">
                <li>
                  <button
                    onClick={() => onNavigate('overview')}
                    className="hover:text-white transition-colors"
                  >
                    Overview Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('imports')}
                    className="hover:text-white transition-colors"
                  >
                    Billing Ingestion
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('explorer')}
                    className="hover:text-white transition-colors"
                  >
                    Cost Explorer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('budgets')}
                    className="hover:text-white transition-colors"
                  >
                    Budget Governance
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-white font-semibold text-xs uppercase tracking-wider block">
                Intelligence
              </span>
              <ul className="space-y-2 text-text-faint">
                <li>
                  <button
                    onClick={() => onNavigate('anomalies')}
                    className="hover:text-white transition-colors"
                  >
                    Anomaly Centre
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('forecasts')}
                    className="hover:text-white transition-colors"
                  >
                    Month-End Projections
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('optimization')}
                    className="hover:text-white transition-colors"
                  >
                    Rightsizing Review
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('settings')}
                    className="hover:text-white transition-colors"
                  >
                    Access Roles (RBAC)
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <span className="text-white font-semibold text-xs uppercase tracking-wider block">
                Developer API
              </span>
              <ul className="space-y-2 text-text-faint">
                <li>
                  <a
                    href="http://localhost:8080/swagger-ui.html"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center space-x-1"
                  >
                    <span>Swagger OpenAPI</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
                  </a>
                </li>
                <li>
                  <a
                    href="http://localhost:8080/api/v1/health"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center space-x-1"
                  >
                    <span>Health Probe</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  <span className="text-[11px] font-mono block text-[#707070] pt-1">
                    Spring Boot 3.3.5 / Java 21
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Safety Principle Banner */}
        <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2c2c2c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-full bg-canvas text-ink">
              <Shield className="w-4 h-4 text-ink" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Strict Non-Destructive Guarantee.
              </p>
              <p className="text-xs text-text-faint mt-0.5">
                CloudPilot is read-only with respect to infrastructure. It never resizes, stops, or terminates live instances.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#262626] text-text-faint border border-[#333333] whitespace-nowrap">
            NUMERIC(19,6) Precision
          </span>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="pt-6 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between text-xs text-text-faint gap-3">
          <p>© 2026 CloudPilot Cost Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Monochrome Design System</span>
            <span>·</span>
            <span>Zero-Shadow Architecture</span>
            <span>·</span>
            <span className="text-white font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
