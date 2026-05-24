'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCluster } from '@/context/ClusterContext';
import { useClusterDetection } from '@/hooks/useClusterDetection';
import { REJECTION_MESSAGE } from '@/utils/inputValidation';
import { getRiskColor } from '@/utils/riskUtils';
import GlassPanel from '@/components/ui/GlassPanel';

const UNIT_OPTIONS = [
  { value: 'km', label: 'KM', maxKm: 50 },
  { value: 'm', label: 'M', maxKm: 50 },
];

export default function AddressRadiusSearch() {
  const [input, setInput] = useState('');
  const [radiusValue, setRadiusValue] = useState('25');
  const [unit, setUnit] = useState('km');
  const [localError, setLocalError] = useState<string | null>(null);

  const { state } = useCluster();
  const { search, clear } = useClusterDetection();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setLocalError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      const trimmed = input.trim();
      if (!trimmed) {
        setLocalError('Please enter a location.');
        return;
      }

      const numValue = parseFloat(radiusValue);
      if (isNaN(numValue) || numValue <= 0) {
        setLocalError('Please enter a valid distance.');
        return;
      }

      const radiusKm = unit === 'm' ? numValue / 1000 : numValue;
      await search(trimmed, radiusKm);
    },
    [input, radiusValue, unit, search]
  );

  const handleClear = useCallback(() => {
    setInput('');
    setLocalError(null);
    clear();
  }, [clear]);

  const isSearching = state.searchStatus === 'searching';
  const displayError =
    localError ??
    (state.searchStatus === 'rejected' ? state.errorMessage ?? REJECTION_MESSAGE : null) ??
    (state.searchStatus === 'rate_limited' ? state.errorMessage : null) ??
    (state.searchStatus === 'geocode_failed' ? state.errorMessage : null);

  return (
    <div className="w-full">
      <GlassPanel className="px-3 py-2" elevated>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Location icon */}
          <div className="flex-shrink-0 text-slate-600">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Address input */}
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter address, city, region, or postal code"
            maxLength={120}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
            aria-label="Location input for nearby cluster detection"
            aria-describedby="search-hint"
          />

          {/* Radius value */}
          <input
            type="number"
            value={radiusValue}
            onChange={(e) => setRadiusValue(e.target.value)}
            min="1"
            max={unit === 'm' ? '50000' : '50'}
            step="1"
            className="w-14 bg-white/[0.04] border border-white/[0.08] rounded px-1.5 py-1 text-xs font-mono text-slate-300 text-center focus:outline-none focus:border-cyan-500/30"
            aria-label="Search radius value"
          />

          {/* Unit selector */}
          <div className="flex rounded overflow-hidden border border-white/[0.08] bg-white/[0.02]">
            {UNIT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUnit(opt.value)}
                className={`px-2 py-1 text-[10px] font-mono transition-colors ${
                  unit === opt.value
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Detect button */}
          <button
            type="submit"
            disabled={isSearching}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            {isSearching ? (
              <span className="w-3 h-3 rounded-full border border-cyan-400 border-t-transparent animate-spin" />
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
            DETECT NEARBY CLUSTERS
          </button>

          {/* Clear button */}
          {(input || state.searchStatus !== 'idle') && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-600 hover:text-slate-400 transition-colors text-sm"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>

        {/* Hint text */}
        <p id="search-hint" className="text-[9px] text-slate-700 font-mono mt-1">
          Search any location to detect and visualize nearby Hantavirus clusters
        </p>
      </GlassPanel>

      {/* Error message */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono"
          >
            {displayError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {(state.searchStatus === 'success' || state.searchStatus === 'no_results') && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1"
          >
            <GlassPanel className="p-2.5">
              {state.searchStatus === 'no_results' ? (
                <p className="text-[10px] font-mono text-slate-500">
                  ○ No clusters found within {state.lastRadiusKm} km of your location.
                </p>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                      ⚠ {state.results.length} cluster{state.results.length !== 1 ? 's' : ''} found within {state.lastRadiusKm} km
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {state.results.map((result) => {
                      const riskColor = getRiskColor(result.country.riskLevel);
                      return (
                        <div
                          key={result.cluster.id}
                          className="flex items-start gap-2 p-2 rounded border"
                          style={{ borderColor: `${riskColor}25`, backgroundColor: `${riskColor}08` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 animate-pulse-slow" style={{ backgroundColor: riskColor }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-200 truncate">{result.cluster.name}</div>
                            <div className="text-[9px] font-mono text-slate-500">
                              {result.country.name} • {result.distanceKm.toFixed(1)} km away • {result.cluster.caseCount} cases
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
