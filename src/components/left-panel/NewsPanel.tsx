'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockNews } from '@/data/news';
import { groupNewsBySource } from '@/utils/riskUtils';
import { formatRelativeTime } from '@/utils/dateUtils';
import { sanitizeExternalUrl } from '@/utils/urlSecurity';
import SeverityBadge from '@/components/ui/SeverityBadge';
import { useDashboard } from '@/context/DashboardContext';

export default function NewsPanel() {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const { state } = useDashboard();

  const filtered = useMemo(() => {
    let items = [...mockNews];

    // If a country is selected, show related news first
    if (state.selectedCountry) {
      items = [
        ...items.filter((n) => n.countryCode === state.selectedCountry!.code),
        ...items.filter((n) => n.countryCode !== state.selectedCountry!.code),
      ];
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.headline.toLowerCase().includes(q) ||
          n.source.toLowerCase().includes(q) ||
          (n.country?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filterSource) {
      items = items.filter((n) => n.source === filterSource);
    }

    return items;
  }, [search, filterSource, state.selectedCountry]);

  const grouped = useMemo(() => groupNewsBySource(filtered), [filtered]);
  const sources = useMemo(() => [...new Set(mockNews.map((n) => n.source))], []);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/[0.05]">
        <input
          type="text"
          placeholder="Filter news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={80}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 focus:bg-white/[0.06] transition-colors"
        />
        {/* Source filter chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            onClick={() => setFilterSource(null)}
            className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border transition-colors ${
              filterSource === null
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                : 'text-slate-600 border-white/[0.06] hover:text-slate-400'
            }`}
          >
            All
          </button>
          {sources.map((src) => {
            const short = src.match(/\(([^)]+)\)/)?.[1] ?? src.split(' ')[0];
            return (
              <button
                key={src}
                onClick={() => setFilterSource(filterSource === src ? null : src)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border transition-colors ${
                  filterSource === src
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    : 'text-slate-600 border-white/[0.06] hover:text-slate-400'
                }`}
              >
                {short}
              </button>
            );
          })}
        </div>
      </div>

      {/* News list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-slate-600 text-xs">
            No news found
          </div>
        ) : (
          <div className="py-1">
            {[...grouped.entries()].map(([source, items]) => (
              <div key={source} className="mb-1">
                {/* Source header */}
                <div className="flex items-center gap-2 px-3 py-2 sticky top-0 bg-[#0f1628]/95 backdrop-blur-sm border-b border-white/[0.04] z-10">
                  <div className="w-4 h-4 rounded bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <span className="text-[7px] font-mono text-cyan-500">
                      {source.match(/\(([^)]+)\)/)?.[1]?.slice(0, 3) ?? source.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 truncate">{source}</span>
                  <span className="ml-auto text-[9px] text-slate-600 font-mono flex-shrink-0">{items.length}</span>
                </div>

                {/* News items */}
                <AnimatePresence>
                  {items.map((item) => {
                    const safeUrl = sanitizeExternalUrl(item.url);
                    const isHighlighted =
                      state.selectedCountry && item.countryCode === state.selectedCountry.code;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`px-3 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                          isHighlighted ? 'border-l-2 border-l-cyan-500/40 bg-cyan-500/[0.03]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {/* Severity indicator bar */}
                          <div
                            className="flex-shrink-0 w-0.5 self-stretch rounded-full mt-0.5"
                            style={{
                              backgroundColor:
                                item.severity === 'breaking'
                                  ? '#ef4444'
                                  : item.severity === 'update'
                                  ? '#f97316'
                                  : '#06b6d4',
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <SeverityBadge severity={item.severity} />
                              {item.country && (
                                <span className="text-[9px] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
                                  {item.country}
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-medium text-slate-200 leading-snug mb-1">
                              {item.headline}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                              {item.summary}
                            </p>

                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[9px] font-mono text-slate-600">
                                {formatRelativeTime(item.publishedAt)}
                              </span>
                              {safeUrl && (
                                <a
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] text-cyan-600 hover:text-cyan-400 font-mono transition-colors"
                                >
                                  Source →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* View all footer */}
        <div className="px-3 py-3 border-t border-white/[0.05]">
          <button className="w-full py-2 rounded border border-white/[0.06] text-[10px] font-mono text-slate-500 hover:text-slate-300 hover:border-white/[0.12] transition-colors">
            VIEW ALL NEWS →
          </button>
        </div>
      </div>
    </div>
  );
}
