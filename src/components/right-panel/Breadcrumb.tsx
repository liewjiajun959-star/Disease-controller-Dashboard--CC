'use client';

import { useDashboard } from '@/context/DashboardContext';

export default function Breadcrumb() {
  const { state, selectCountry, clearRegionDrill, selectRegion } = useDashboard();
  const { selectedCountry, selectedRegion, selectedCluster } = state;

  if (!selectedCountry) return null;

  return (
    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600 flex-wrap">
      <button
        onClick={() => selectCountry(null)}
        className="hover:text-cyan-400 transition-colors"
      >
        Countries
      </button>

      <span className="text-slate-700">›</span>

      <button
        onClick={() => clearRegionDrill()}
        className={`transition-colors ${
          !selectedRegion ? 'text-slate-300 cursor-default' : 'hover:text-cyan-400'
        }`}
      >
        {selectedCountry.flagEmoji} {selectedCountry.name}
      </button>

      {selectedRegion && (
        <>
          <span className="text-slate-700">›</span>
          <button
            onClick={() => selectRegion(selectedRegion)}
            className={`transition-colors ${
              !selectedCluster ? 'text-slate-300 cursor-default' : 'hover:text-cyan-400'
            }`}
          >
            {selectedRegion}
          </button>
        </>
      )}

      {selectedCluster && (
        <>
          <span className="text-slate-700">›</span>
          <span className="text-slate-300 truncate max-w-[120px]" title={selectedCluster.name}>
            {selectedCluster.name.replace(/ Cluster$/, '').replace(/ Satellite$/, '')}
          </span>
        </>
      )}
    </div>
  );
}
