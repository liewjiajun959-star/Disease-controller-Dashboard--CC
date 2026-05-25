'use client';

import { motion } from 'framer-motion';
import { useDashboard } from '@/context/DashboardContext';
import { useCurrentDiseaseData } from '@/hooks/useCurrentDiseaseData';
import { formatMonthDay, formatShortDate } from '@/utils/dateUtils';

const EXPOSURE_LABEL: Record<string, string> = {
  rodent_contact: 'Rodent contact',
  environment: 'Environmental',
  travel: 'Travel-linked',
  unknown: 'Unknown',
};

const STATUS_COLOR: Record<string, string> = {
  recovered: '#22c55e',
  active: '#f59e0b',
  deceased: '#ef4444',
  unknown: '#64748b',
};

export default function ClusterDetailView() {
  const { state } = useDashboard();
  const { selectedCountry, selectedCluster } = state;
  const { patients } = useCurrentDiseaseData();

  if (!selectedCountry || !selectedCluster) return null;

  const clusterPatients = patients.filter((p) => p.clusterId === selectedCluster.id);

  const statusColor =
    selectedCluster.status === 'active'
      ? '#ef4444'
      : selectedCluster.status === 'monitoring'
      ? '#f59e0b'
      : '#22c55e';

  // Approximate coordinates display (truncated to 2 decimal places — not exact)
  const approxLat = selectedCluster.coordinates.lat.toFixed(2);
  const approxLng = selectedCluster.coordinates.lng.toFixed(2);

  return (
    <div className="overflow-y-auto h-full">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-3 py-3 space-y-4"
      >
        {/* Cluster header */}
        <div
          className="rounded-lg p-3 border"
          style={{ borderColor: `${statusColor}30`, backgroundColor: `${statusColor}08` }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-sm font-bold text-slate-100 leading-snug flex-1">
              {selectedCluster.name}
            </h2>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0"
              style={{
                color: statusColor,
                borderColor: `${statusColor}40`,
                backgroundColor: `${statusColor}12`,
              }}
            >
              {selectedCluster.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Total Cases</div>
              <div className="text-xl font-mono font-bold" style={{ color: statusColor }}>
                {selectedCluster.caseCount}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Patients Tracked</div>
              <div className="text-xl font-mono font-bold text-slate-200">
                {clusterPatients.length}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">First Detected</div>
              <div className="text-xs font-mono text-slate-300">{formatShortDate(selectedCluster.firstDetected)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Region</div>
              <div className="text-xs font-mono text-slate-300">{selectedCluster.region}</div>
            </div>
          </div>
        </div>

        {/* Suspected source */}
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1.5">
            Suspected Source
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedCluster.suspectedSource}</p>
          <div className="mt-2 text-[9px] font-mono text-slate-700">
            ⊕ Approx. location: {approxLat}°, {approxLng}°
          </div>
        </div>

        {/* Patient chain */}
        {clusterPatients.length > 0 && (
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">
              Patient Chain — Anonymized ({clusterPatients.length})
            </div>
            <div className="space-y-1.5">
              {clusterPatients.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 text-[10px] p-1.5 rounded bg-white/[0.02] border border-white/[0.04]"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLOR[p.status] ?? '#64748b' }}
                  />
                  <span className="font-mono text-slate-400 font-medium w-24 flex-shrink-0">
                    {p.anonymousLabel}
                  </span>
                  <span className="text-slate-600 flex-1 truncate">
                    {EXPOSURE_LABEL[p.exposureType] ?? p.exposureType}
                  </span>
                  <span className="text-slate-700 font-mono flex-shrink-0">
                    {formatMonthDay(p.detectedDate)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-700 mt-2 font-mono">
              Anonymous labels only. No real patient data.
            </p>
          </div>
        )}

        {/* Cluster links */}
        {selectedCluster.links.length > 0 && (
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">
              Epidemiological Links
            </div>
            <div className="space-y-1.5">
              {selectedCluster.links.map((link, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] border ${
                      link.confidence === 'high'
                        ? 'text-green-400 border-green-500/30 bg-green-500/10'
                        : link.confidence === 'medium'
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        : 'text-slate-500 border-slate-500/30 bg-slate-500/10'
                    }`}
                  >
                    {link.confidence}
                  </span>
                  <span className="text-slate-500">{link.linkType}</span>
                  <span className="text-slate-700 truncate">→ {link.targetClusterId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
