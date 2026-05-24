'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsageLogs, clearUsageLogs } from '@/services/usageLogService';
import type { UsageLogEntry } from '@/types';

const STATUS_COLOR: Record<UsageLogEntry['status'], string> = {
  success: '#22c55e',
  rejected: '#ef4444',
  error: '#f97316',
  info: '#06b6d4',
};

export default function DevUsageLogPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<UsageLogEntry[]>([]);

  const refresh = useCallback(() => {
    setLogs(getUsageLogs());
  }, []);

  function toggle() {
    if (!open) refresh();
    setOpen((v) => !v);
  }

  function handleClear() {
    clearUsageLogs();
    setLogs([]);
  }

  return (
    <div className="flex-shrink-0 border-t border-white/[0.05]">
      {/* Collapsed footer bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#0a0e1a]/80">
        {/* Disclaimer */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-slate-600 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <p className="text-[9px] font-mono text-slate-700 truncate">
            DISCLAIMER: HantaWatch provides aggregated demo data for situational awareness only. Not for medical diagnosis. Always consult official health authorities such as WHO, CDC, or local public health agencies. Demo data is simulated.
          </p>
        </div>

        {/* Dev logs toggle */}
        <button
          onClick={toggle}
          className="flex-shrink-0 flex items-center gap-1 text-[9px] font-mono text-slate-700 hover:text-slate-500 transition-colors border border-white/[0.05] rounded px-2 py-0.5"
        >
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          DEV LOGS {open ? '▲' : '▼'}
        </button>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[9px] text-slate-800">© 2025 HantaWatch Global Intelligence System</span>
        </div>
      </div>

      {/* Expanded log panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.05] bg-[#080c17]"
          >
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-cyan-600 uppercase tracking-wider">
                  Developer Usage Logs (Demo-Only — Privacy-Preserving)
                </span>
                <span className="text-[9px] font-mono text-slate-700">
                  {logs.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refresh}
                  className="text-[9px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={handleClear}
                  className="text-[9px] font-mono text-slate-700 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(200px-32px)] px-4 py-2 space-y-0.5">
              {logs.length === 0 ? (
                <p className="text-[9px] font-mono text-slate-700 py-4 text-center">
                  No log entries yet. Interact with the dashboard to generate events.
                </p>
              ) : (
                [...logs].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-[9px] font-mono">
                    <span className="text-slate-700 flex-shrink-0 w-14">
                      {entry.timestamp.split('T')[1].slice(0, 8)}
                    </span>
                    <span
                      className="flex-shrink-0 w-2 h-2 rounded-full mt-0.5"
                      style={{ backgroundColor: STATUS_COLOR[entry.status] }}
                    />
                    <span className="text-slate-500 flex-shrink-0 w-40 truncate">{entry.eventType}</span>
                    <span className="text-slate-700 flex-shrink-0 w-20 truncate">{entry.feature}</span>
                    <span className="text-slate-700 truncate">
                      {Object.entries(entry.metadata)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(' · ')}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-1 border-t border-white/[0.04]">
              <p className="text-[8px] font-mono text-slate-800">
                ⓘ Logs stored in sessionStorage only. No PII. No server transmission. Cleared on tab close. Raw rejected inputs are never logged.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
