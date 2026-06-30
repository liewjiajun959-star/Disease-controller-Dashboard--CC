'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TelemetrySource } from '@/types';

const STATUS_STYLE: Record<string, { color: string; pulse: boolean; label: string }> = {
  live:    { color: '#22c55e', pulse: true,  label: 'LIVE' },
  polling: { color: '#06b6d4', pulse: true,  label: 'SYNC' },
  cached:  { color: '#f59e0b', pulse: false, label: 'CACHE' },
  error:   { color: '#ef4444', pulse: false, label: 'ERR' },
  idle:    { color: '#334155', pulse: false, label: 'N/A' },
};

interface Props {
  sources: TelemetrySource[];
  lastPoll: Date | null;
  isPolling: boolean;
  onRefresh: () => void;
}

export default function TelemetryStatusBar({ sources, lastPoll, isPolling, onRefresh }: Props) {
  const [age, setAge] = useState('');

  // Update "X ago" label every 10 seconds
  useEffect(() => {
    function computeAge() {
      if (!lastPoll) return '—';
      const secs = Math.floor((Date.now() - lastPoll.getTime()) / 1000);
      if (secs < 60) return `${secs}s ago`;
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins}m ago`;
      return `${Math.floor(mins / 60)}h ago`;
    }
    setAge(computeAge());
    const id = setInterval(() => setAge(computeAge()), 10_000);
    return () => clearInterval(id);
  }, [lastPoll]);

  const liveCount = sources.filter((s) => s.status === 'live').length;
  const hasAnyLive = liveCount > 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 border-b border-white/[0.04]">
      {/* TELEMETRY label */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          className={`w-1.5 h-1.5 rounded-full ${hasAnyLive ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: hasAnyLive ? '#22c55e' : '#475569' }}
        />
        <span className="text-[8px] font-mono font-semibold tracking-widest text-slate-600 uppercase">
          TELEMETRY
        </span>
      </div>

      <div className="w-px h-3 bg-white/[0.06] flex-shrink-0" />

      {/* Per-source indicators */}
      <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-none">
        {sources.length === 0 ? (
          <span className="text-[9px] font-mono text-slate-600">Initialising…</span>
        ) : (
          sources.map((src) => {
            const style = STATUS_STYLE[src.status] ?? STATUS_STYLE.idle;
            return (
              <div
                key={src.id}
                className="flex items-center gap-1 flex-shrink-0 cursor-default"
                title={`${src.name}${src.error ? ` — ${src.error}` : ''}${src.latencyMs ? ` (${src.latencyMs}ms)` : ''}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.pulse ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: style.color }}
                />
                <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                  {src.shortName}
                </span>
                {src.itemCount > 0 && (
                  <span className="text-[8px] font-mono text-slate-600 tabular-nums">
                    {src.itemCount}
                  </span>
                )}
                <span
                  className="text-[8px] font-mono uppercase tracking-wider"
                  style={{ color: style.color, opacity: 0.7 }}
                >
                  {style.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Last poll age */}
      {lastPoll && (
        <span className="text-[8px] font-mono text-slate-700 flex-shrink-0 whitespace-nowrap tabular-nums">
          {age}
        </span>
      )}

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isPolling}
        title="Refresh all feeds now"
        className="flex-shrink-0 text-[11px] font-mono text-slate-700 hover:text-cyan-500 transition-colors disabled:opacity-30 leading-none"
      >
        {isPolling ? (
          <motion.span
            className="inline-block leading-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          >
            ↻
          </motion.span>
        ) : (
          '↻'
        )}
      </button>
    </div>
  );
}
