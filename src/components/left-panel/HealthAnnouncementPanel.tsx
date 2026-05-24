'use client';

import { motion } from 'framer-motion';
import { mockAnnouncements } from '@/data/announcements';
import { formatShortDate } from '@/utils/dateUtils';

const URGENCY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  urgent: { label: 'URGENT', color: '#ef4444', icon: '⚠' },
  advisory: { label: 'ADVISORY', color: '#f97316', icon: '◈' },
  informational: { label: 'INFORMATION', color: '#06b6d4', icon: '○' },
};

export default function HealthAnnouncementPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/[0.05]">
        <p className="text-[10px] text-amber-600/70 font-mono">
          General public health information only. Not personal medical advice. Consult a qualified healthcare professional.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {mockAnnouncements.map((item, i) => {
          const urg = URGENCY_CONFIG[item.recommendationLevel];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="px-3 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              {/* Urgency header */}
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: urg.color }} className="text-sm leading-none">
                  {urg.icon}
                </span>
                <span
                  className="text-[9px] font-mono font-semibold uppercase tracking-widest"
                  style={{ color: urg.color }}
                >
                  {urg.label}
                </span>
                {item.source && (
                  <span className="ml-auto text-[9px] font-mono text-slate-600 flex-shrink-0">
                    {item.source}
                  </span>
                )}
              </div>

              <h3 className="text-xs font-semibold text-slate-200 leading-snug mb-2">
                {item.title}
              </h3>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                {item.summary}
              </p>

              <div className="flex items-center justify-between mt-2">
                {item.country && (
                  <span className="text-[9px] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {item.country}
                  </span>
                )}
                <span className="ml-auto text-[9px] font-mono text-slate-600">
                  {formatShortDate(item.publishedAt)}
                </span>
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-mono text-slate-700 bg-white/[0.03] border border-white/[0.05] px-1 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-2 border-t border-white/[0.05]">
        <p className="text-[9px] text-slate-700 font-mono leading-relaxed">
          ⚕ This dashboard provides aggregated public health information only. It does not provide medical diagnosis. Always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
