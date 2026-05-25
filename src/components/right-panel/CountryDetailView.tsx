'use client';

import { motion } from 'framer-motion';
import type { CountryOutbreak } from '@/types';
import { useCurrentDiseaseData } from '@/hooks/useCurrentDiseaseData';
import { useDashboard } from '@/context/DashboardContext';
import RiskBadge from '@/components/ui/RiskBadge';
import { getRiskColor } from '@/utils/riskUtils';
import { formatShortDate, formatMonthDay } from '@/utils/dateUtils';
import CountryVideoNewsPanel from '@/components/videos/CountryVideoNewsPanel';

interface CountryDetailViewProps {
  country: CountryOutbreak;
}

const STRAIN_COLORS: Record<string, string> = {
  'Andes Virus (ANDV)': '#f59e0b',
  'Sin Nombre Virus (SNV)': '#3b82f6',
  'Hantaan Virus (HTNV)': '#ef4444',
  'Seoul Virus': '#8b5cf6',
  'Puumala Virus (PUUV)': '#22c55e',
  'Bangkok Strain (Novel)': '#f97316',
  'Juquitiba Virus (JUQV)': '#06b6d4',
};

const EXPOSURE_LABEL: Record<string, string> = {
  rodent_contact: 'Rodent contact',
  environment: 'Environmental',
  travel: 'Travel-linked',
  unknown: 'Unknown',
};

export default function CountryDetailView({ country }: CountryDetailViewProps) {
  const { clusters, patients } = useCurrentDiseaseData();
  const { selectRegion } = useDashboard();
  const countryClusters = clusters.filter((c) => c.countryCode === country.code);
  const countryPatients = patients.filter((p) => p.countryCode === country.code);
  const color = getRiskColor(country.riskLevel);
  const strainColor = STRAIN_COLORS[country.strainName] ?? '#94a3b8';

  // Sparkline for case timeline
  const series = country.casesTimeSeries;
  const maxCases = Math.max(...series.map((p) => p.cases), 1);
  const svgW = 260;
  const svgH = 40;
  const points = series.map((p, i) => {
    const x = (i / Math.max(series.length - 1, 1)) * svgW;
    const y = svgH - (p.cases / maxCases) * (svgH - 4) - 2;
    return `${x},${y}`;
  });
  const fillPoints = [
    `0,${svgH}`,
    ...points,
    `${svgW},${svgH}`,
  ];

  return (
    <div className="overflow-y-auto h-full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-3 py-3 space-y-4"
      >
        {/* Country header */}
        <div
          className="rounded-lg p-3 border"
          style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{country.flagEmoji}</span>
            <div>
              <h2 className="text-sm font-bold text-slate-100">{country.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <RiskBadge level={country.riskLevel} size="md" />
                <span className="text-[10px] font-mono text-slate-500">
                  {country.trend === 'rising' ? '↑ Rising' : country.trend === 'declining' ? '↓ Declining' : '→ Stable'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Total Cases</div>
              <div className="text-xl font-mono font-bold stat-number" style={{ color }}>
                {country.totalCases.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Active Clusters</div>
              <div className="text-xl font-mono font-bold text-slate-200">
                {country.activeClusters}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">First Case</div>
              <div className="text-xs font-mono text-slate-300">
                {formatShortDate(country.firstCaseDate)}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Patient Zero</div>
              <div className="text-xs font-mono">
                <span
                  className={`${
                    country.patientZeroStatus === 'identified'
                      ? 'text-green-400'
                      : country.patientZeroStatus === 'under_investigation'
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                >
                  {country.patientZeroStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Strain info */}
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1.5">Pathogen Strain</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: strainColor }} />
            <span className="text-xs font-semibold" style={{ color: strainColor }}>
              {country.strainName}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1">
              Affected Regions — click to drill down
            </div>
            <div className="flex flex-wrap gap-1">
              {country.affectedRegions.map((r) => {
                const regionCases = countryClusters
                  .filter((c) => c.region === r)
                  .reduce((sum, c) => sum + c.caseCount, 0);
                return (
                  <button
                    key={r}
                    onClick={() => selectRegion(r)}
                    className="text-[10px] font-mono text-cyan-400 bg-cyan-500/[0.07] border border-cyan-500/20 px-2 py-0.5 rounded hover:bg-cyan-500/[0.14] hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
                  >
                    <span>{r}</span>
                    {regionCases > 0 && (
                      <span className="text-[9px] text-cyan-600">{regionCases}</span>
                    )}
                    <span className="text-cyan-700">›</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Case timeline sparkline */}
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">
            Case Discovery Timeline
          </div>
          <svg width={svgW} height={svgH} className="w-full overflow-visible" viewBox={`0 0 ${svgW} ${svgH}`}>
            <defs>
              <linearGradient id={`grad-${country.code}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon
              points={fillPoints.join(' ')}
              fill={`url(#grad-${country.code})`}
            />
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Latest point */}
            {points.length > 0 && (
              <circle
                cx={parseFloat(points[points.length - 1].split(',')[0])}
                cy={parseFloat(points[points.length - 1].split(',')[1])}
                r="2.5"
                fill={color}
              />
            )}
          </svg>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] font-mono text-slate-700">
              {series.length > 0 ? formatMonthDay(series[0].date) : ''}
            </span>
            <span className="text-[9px] font-mono text-slate-700">
              {series.length > 0 ? formatMonthDay(series[series.length - 1].date) : ''}
            </span>
          </div>
        </div>

        {/* Clusters */}
        {countryClusters.length > 0 && (
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">
              Known Clusters ({countryClusters.length})
            </div>
            <div className="space-y-2">
              {countryClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="rounded p-2 bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300 truncate">{cluster.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ml-2 flex-shrink-0 ${
                        cluster.status === 'active'
                          ? 'text-red-400 border-red-500/30 bg-red-500/10'
                          : cluster.status === 'monitoring'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-green-400 border-green-500/30 bg-green-500/10'
                      }`}
                    >
                      {cluster.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-600">
                    <span>{cluster.caseCount} cases</span>
                    <span>Detected {formatMonthDay(cluster.firstDetected)}</span>
                  </div>
                  <div className="text-[9px] text-slate-600 mt-0.5 truncate">
                    Source: {cluster.suspectedSource}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anonymous patient chain */}
        {countryPatients.length > 0 && (
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">
              Patient Relationship Chain (Anonymized)
            </div>
            <div className="space-y-1.5">
              {countryPatients.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 text-[10px] p-1.5 rounded bg-white/[0.02]"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      p.status === 'recovered'
                        ? 'bg-green-400'
                        : p.status === 'active'
                        ? 'bg-amber-400'
                        : p.status === 'deceased'
                        ? 'bg-red-500'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span className="font-mono text-slate-400 font-medium w-24 flex-shrink-0">
                    {p.anonymousLabel}
                  </span>
                  <span className="text-slate-600 truncate">{EXPOSURE_LABEL[p.exposureType]}</span>
                  <span className="ml-auto text-slate-700 flex-shrink-0">
                    {formatMonthDay(p.detectedDate)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-700 mt-2 font-mono">
              Anonymous labels only. No real patient data included.
            </p>
          </div>
        )}

        {/* Video news */}
        <CountryVideoNewsPanel countryCode={country.code} countryName={country.name} />
      </motion.div>
    </div>
  );
}
