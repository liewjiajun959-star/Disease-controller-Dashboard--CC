'use client';

import { motion } from 'framer-motion';
import { useDashboard } from '@/context/DashboardContext';
import { useCurrentDiseaseData } from '@/hooks/useCurrentDiseaseData';
import { getRiskColor } from '@/utils/riskUtils';
import { formatMonthDay } from '@/utils/dateUtils';
import type { Cluster } from '@/types';

export default function RegionDetailView() {
  const { state, selectCluster } = useDashboard();
  const { selectedCountry, selectedRegion } = state;
  const { clusters } = useCurrentDiseaseData();

  if (!selectedCountry || !selectedRegion) return null;

  const regionClusters = clusters.filter(
    (c) => c.countryCode === selectedCountry.code && c.region === selectedRegion
  );

  const totalCases = regionClusters.reduce((sum, c) => sum + c.caseCount, 0);
  const activeClusters = regionClusters.filter((c) => c.status === 'active').length;

  return (
    <div className="overflow-y-auto h-full">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-3 py-3 space-y-4"
      >
        {/* Region header */}
        <div className="rounded-lg p-3 bg-white/[0.03] border border-white/[0.07]">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">
            {selectedCountry.flagEmoji} {selectedCountry.name}
          </div>
          <h2 className="text-sm font-bold text-slate-100 mb-2">{selectedRegion}</h2>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Cases</div>
              <div className="text-lg font-mono font-bold text-slate-200">{totalCases.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Clusters</div>
              <div className="text-lg font-mono font-bold text-slate-200">{regionClusters.length}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Active</div>
              <div className="text-lg font-mono font-bold text-red-400">{activeClusters}</div>
            </div>
          </div>
        </div>

        {/* Cluster list */}
        <div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2 px-1">
            Clusters in this region
          </div>

          {regionClusters.length === 0 ? (
            <div className="text-[11px] text-slate-600 text-center py-6">
              No cluster data for this region
            </div>
          ) : (
            <div className="space-y-2">
              {regionClusters.map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  onSelect={() => selectCluster(cluster)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ClusterCard({ cluster, onSelect }: { cluster: Cluster; onSelect: () => void }) {
  const statusColor =
    cluster.status === 'active'
      ? '#ef4444'
      : cluster.status === 'monitoring'
      ? '#f59e0b'
      : '#22c55e';

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-lg p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-200 leading-snug">{cluster.name}</span>
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0"
          style={{
            color: statusColor,
            borderColor: `${statusColor}40`,
            backgroundColor: `${statusColor}12`,
          }}
        >
          {cluster.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-600">
        <span>{cluster.caseCount} cases</span>
        <span>{cluster.relatedPatients.length} patients tracked</span>
        <span>Detected {formatMonthDay(cluster.firstDetected)}</span>
      </div>

      <div className="mt-1.5 text-[9px] text-slate-600 truncate">
        ⚠ {cluster.suspectedSource}
      </div>

      <div className="mt-1.5 flex items-center justify-end text-[9px] font-mono text-cyan-600">
        Drill down →
      </div>
    </motion.button>
  );
}
