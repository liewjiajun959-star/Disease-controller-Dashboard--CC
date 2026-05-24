import type { RiskLevel, SeverityLabel } from '@/types';

// ─── Risk level utilities ─────────────────────────────────────────────────────

export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH':     return '#f97316';
    case 'ELEVATED': return '#f59e0b';
    case 'MODERATE': return '#eab308';
    case 'LOW':      return '#22c55e';
    default:         return '#64748b';
  }
}

export function getRiskBgClass(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'HIGH':     return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'ELEVATED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'MODERATE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'LOW':      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:         return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function getRiskGlowClass(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'CRITICAL': return 'shadow-glow-red';
    case 'HIGH':     return 'shadow-glow-orange';
    case 'ELEVATED': return 'shadow-[0_0_16px_rgba(245,158,11,0.35)]';
    case 'MODERATE': return 'shadow-[0_0_16px_rgba(234,179,8,0.25)]';
    case 'LOW':      return 'shadow-glow-green';
    default:         return '';
  }
}

export function getRiskMarkerSize(caseCount: number): number {
  // Logarithmic scale: 0.01 to 0.1
  const maxLog = Math.log1p(200); // roughly max expected cases
  return 0.01 + (Math.log1p(Math.min(caseCount, 200)) / maxLog) * 0.09;
}

export function sortCountriesByRisk<T extends { riskLevel: RiskLevel; totalCases: number }>(
  countries: T[]
): T[] {
  const order: Record<RiskLevel, number> = {
    CRITICAL: 0,
    HIGH: 1,
    ELEVATED: 2,
    MODERATE: 3,
    LOW: 4,
  };
  return [...countries].sort((a, b) => {
    const diff = order[a.riskLevel] - order[b.riskLevel];
    if (diff !== 0) return diff;
    return b.totalCases - a.totalCases;
  });
}

// ─── Severity label utilities ─────────────────────────────────────────────────

export function getNewsSeverityColor(severity: SeverityLabel): string {
  switch (severity) {
    case 'breaking': return '#ef4444';
    case 'update':   return '#f97316';
    case 'normal':   return '#06b6d4';
    default:         return '#94a3b8';
  }
}

export function getNewsSeverityBgClass(severity: SeverityLabel): string {
  switch (severity) {
    case 'breaking': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'update':   return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'normal':   return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    default:         return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}

// ─── Group news by source ─────────────────────────────────────────────────────

export function groupNewsBySource<T extends { source: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const existing = groups.get(item.source) ?? [];
    groups.set(item.source, [...existing, item]);
  }
  return groups;
}

// ─── Globe marker color (RGB 0-1 range for cobe) ─────────────────────────────

export function getRiskMarkerRGB(riskLevel: RiskLevel): [number, number, number] {
  switch (riskLevel) {
    case 'CRITICAL': return [1, 0.15, 0.15];
    case 'HIGH':     return [1, 0.45, 0.1];
    case 'ELEVATED': return [1, 0.75, 0.1];
    case 'MODERATE': return [0.9, 0.85, 0.1];
    case 'LOW':      return [0.15, 0.8, 0.3];
    default:         return [0.4, 0.5, 0.6];
  }
}
