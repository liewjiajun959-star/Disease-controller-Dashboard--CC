'use client';

import { motion } from 'framer-motion';
import { useDashboard } from '@/context/DashboardContext';
import { DISEASE_CONFIGS, DISEASE_ORDER } from '@/data/diseases';

export default function DiseaseSelector() {
  const { state, setDisease } = useDashboard();

  return (
    <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-white/[0.05]">
      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mr-0.5 hidden lg:block">
        Monitor
      </span>
      {DISEASE_ORDER.map((id) => {
        const config = DISEASE_CONFIGS[id];
        const isActive = state.currentDisease === id;

        return (
          <motion.button
            key={id}
            onClick={() => setDisease(id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider transition-all duration-150"
            style={
              isActive
                ? {
                    color: config.accentColor,
                    backgroundColor: `${config.accentColor}15`,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: `${config.accentColor}50`,
                    boxShadow: `0 0 8px ${config.accentColor}20`,
                  }
                : {
                    color: '#64748b',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: 'rgba(255,255,255,0.06)',
                  }
            }
            title={config.label}
            aria-pressed={isActive}
          >
            <span className="text-xs leading-none">{config.icon}</span>
            <span className="hidden sm:inline">{config.shortLabel}</span>

            {/* Active indicator dot */}
            {isActive && (
              <motion.span
                layoutId="disease-active-dot"
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: config.accentColor }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
