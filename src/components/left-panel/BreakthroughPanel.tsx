'use client';

import { motion } from 'framer-motion';
import { mockBreakthroughs } from '@/data/breakthroughs';
import { formatShortDate } from '@/utils/dateUtils';

const TYPE_COLORS: Record<string, string> = {
  vaccine: '#22c55e',
  treatment: '#06b6d4',
  diagnostic: '#3b82f6',
  surveillance: '#8b5cf6',
  epidemiology: '#f59e0b',
};

const CONFIDENCE_LABEL: Record<string, { label: string; color: string }> = {
  high: { label: 'HIGH CONFIDENCE', color: '#22c55e' },
  medium: { label: 'MEDIUM CONFIDENCE', color: '#f59e0b' },
  preliminary: { label: 'PRELIMINARY', color: '#94a3b8' },
};

export default function BreakthroughPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/[0.05]">
        <p className="text-[10px] text-slate-600 font-mono">
          Research & scientific updates — Not peer-review verified. Do not overstate certainty.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {mockBreakthroughs.map((item, i) => {
          const typeColor = TYPE_COLORS[item.type] ?? '#94a3b8';
          const conf = CONFIDENCE_LABEL[item.confidenceLevel];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-3 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              {/* Type + confidence */}
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span
                  className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                  style={{
                    color: typeColor,
                    borderColor: `${typeColor}30`,
                    backgroundColor: `${typeColor}12`,
                  }}
                >
                  {item.type}
                </span>
                <span
                  className="text-[9px] font-mono uppercase tracking-wider"
                  style={{ color: conf.color }}
                >
                  {conf.label}
                </span>
              </div>

              <h3 className="text-xs font-semibold text-slate-200 leading-snug mb-1.5">
                {item.title}
              </h3>

              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">
                {item.summary}
              </p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-slate-600 font-medium truncate max-w-[160px]">
                  {item.source}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.relatedRegion && (
                    <span className="text-[9px] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
                      {item.relatedRegion}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-slate-600">
                    {formatShortDate(item.publishedAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
