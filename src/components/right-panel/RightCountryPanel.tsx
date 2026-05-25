'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDashboard } from '@/context/DashboardContext';
import { useCurrentDiseaseData } from '@/hooks/useCurrentDiseaseData';
import { sortCountriesByRisk } from '@/utils/riskUtils';
import CountryCard from './CountryCard';
import CountryDetailView from './CountryDetailView';
import RegionDetailView from './RegionDetailView';
import ClusterDetailView from './ClusterDetailView';
import Breadcrumb from './Breadcrumb';

export default function RightCountryPanel() {
  const { state, selectCountry } = useDashboard();
  const { selectedCountry, selectedRegion, selectedCluster } = state;
  const { countries } = useCurrentDiseaseData();

  // Determine which view to show
  const view = selectedCluster
    ? 'cluster'
    : selectedRegion
    ? 'region'
    : selectedCountry
    ? 'country'
    : 'list';

  const sortedCountries = sortCountriesByRisk(countries);

  return (
    <div className="flex flex-col h-full bg-[#0f1628]/60">
      {/* Panel header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/[0.05] min-h-[36px]">
        {view === 'list' ? (
          <>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">COUNTRIES</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-[9px] font-mono text-slate-600">Sort: Risk Level</span>
          </>
        ) : (
          <>
            <Breadcrumb />
            <div className="flex-1" />
            <button
              onClick={() => selectCountry(null)}
              className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </>
        )}
      </div>

      {/* Content — 4-view cascade */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === 'cluster' && (
            <motion.div
              key="cluster"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18 }}
            >
              <ClusterDetailView />
            </motion.div>
          )}

          {view === 'region' && (
            <motion.div
              key="region"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18 }}
            >
              <RegionDetailView />
            </motion.div>
          )}

          {view === 'country' && (
            <motion.div
              key="country"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
            >
              <CountryDetailView country={selectedCountry!} />
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div
              key="list"
              className="absolute inset-0 overflow-y-auto"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
            >
              {sortedCountries.map((country, index) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  isSelected={false}
                  index={index}
                />
              ))}

              {/* Footer */}
              <div className="px-3 py-3 border-t border-white/[0.05]">
                <button className="w-full py-2 rounded border border-white/[0.06] text-[10px] font-mono text-slate-500 hover:text-slate-300 hover:border-white/[0.12] transition-colors">
                  VIEW ALL COUNTRIES →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
