'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDashboard } from '@/context/DashboardContext';
import { mockCountries } from '@/data/countries';
import { sortCountriesByRisk } from '@/utils/riskUtils';
import CountryCard from './CountryCard';
import CountryDetailView from './CountryDetailView';

const SORTED_COUNTRIES = sortCountriesByRisk(mockCountries);

export default function RightCountryPanel() {
  const { state, selectCountry } = useDashboard();
  const selectedCountry = state.selectedCountry;

  return (
    <div className="flex flex-col h-full bg-[#0f1628]/60">
      {/* Panel header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/[0.05]">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">COUNTRIES</span>
        <div className="flex-1 h-px bg-white/[0.04]" />

        {selectedCountry ? (
          <button
            onClick={() => selectCountry(null)}
            className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            ← All Countries
          </button>
        ) : (
          <span className="text-[9px] font-mono text-slate-600">
            Sort: Risk Level
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedCountry ? (
            <motion.div
              key="detail"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CountryDetailView country={selectedCountry} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="absolute inset-0 overflow-y-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {SORTED_COUNTRIES.map((country, index) => (
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
