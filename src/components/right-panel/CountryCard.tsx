'use client';

import { motion } from 'framer-motion';
import type { CountryOutbreak } from '@/types';
import RiskBadge from '@/components/ui/RiskBadge';
import { getRiskColor } from '@/utils/riskUtils';
import { formatMonthDay, formatRelativeTime } from '@/utils/dateUtils';
import { useDashboard } from '@/context/DashboardContext';
import { useUsageLogger } from '@/hooks/useUsageLogger';

interface CountryCardProps {
  country: CountryOutbreak;
  isSelected: boolean;
  index: number;
}

const TREND_ICONS: Record<string, { icon: string; color: string }> = {
  rising: { icon: '↑', color: '#ef4444' },
  stable: { icon: '→', color: '#f59e0b' },
  declining: { icon: '↓', color: '#22c55e' },
};

export default function CountryCard({ country, isSelected, index }: CountryCardProps) {
  const { selectCountry } = useDashboard();
  const { log } = useUsageLogger();
  const color = getRiskColor(country.riskLevel);
  const trend = TREND_ICONS[country.trend] ?? TREND_ICONS.stable;

  function handleClick() {
    selectCountry(isSelected ? null : country);
    if (!isSelected) {
      log('country_selected', 'country_panel', 'success', {
        countryCode: country.code,
        riskLevel: country.riskLevel,
        source: 'country_card',
      });
    }
  }

  // Mini sparkline (last 5 data points)
  const series = country.casesTimeSeries.slice(-7);
  const max = Math.max(...series.map((p) => p.cases), 1);
  const sparkPoints = series.map((p, i) => {
    const x = (i / (series.length - 1)) * 48;
    const y = 12 - (p.cases / max) * 10;
    return `${x},${y}`;
  });

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left px-3 py-2.5 border-b transition-all ${
        isSelected
          ? 'bg-cyan-500/[0.06] border-l-2 border-l-cyan-500/50'
          : 'hover:bg-white/[0.02]'
      } border-b-white/[0.04]`}
      style={{ borderLeftColor: isSelected ? color : undefined }}
    >
      <div className="flex items-start gap-2">
        {/* Flag + name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base leading-none">{country.flagEmoji}</span>
            <span className="text-xs font-semibold text-slate-200 truncate">{country.name}</span>
            <RiskBadge level={country.riskLevel} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1">
            <div>
              <div className="text-[10px] text-slate-600">Cases</div>
              <div className="text-xs font-mono font-semibold stat-number" style={{ color }}>
                {country.totalCases.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600">First Case</div>
              <div className="text-[10px] font-mono text-slate-400">
                {formatMonthDay(country.firstCaseDate)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600">Clusters</div>
              <div className="text-xs font-mono text-slate-300">
                {country.activeClusters}
                {country.activeClusters > 0 && (
                  <span className="text-[9px] text-slate-600"> active</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sparkline + trend */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {/* Mini sparkline SVG */}
          <svg width="52" height="14" className="opacity-70">
            <polyline
              points={sparkPoints.join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            className="text-[10px] font-mono font-semibold"
            style={{ color: trend.color }}
          >
            {trend.icon} {country.trend}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-1.5">
        {country.videoNewsCount > 0 && (
          <span className="text-[9px] font-mono text-slate-700">
            ▶ {country.videoNewsCount} videos
          </span>
        )}
        <span className="ml-auto text-[9px] font-mono text-slate-700">
          Updated {formatRelativeTime(country.lastUpdated)}
        </span>
      </div>
    </motion.button>
  );
}
