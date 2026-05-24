'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { AlertCard as AlertCardType } from '@/types';
import { getRiskColor } from '@/utils/riskUtils';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useDashboard } from '@/context/DashboardContext';
import { mockCountries } from '@/data/countries';

interface AlertCardProps {
  alert: AlertCardType;
}

const TYPE_ICONS: Record<AlertCardType['type'], string> = {
  patient_zero: '◈',
  new_cluster: '⬡',
  country_alert: '⚠',
  global_update: '⊕',
};

export default function AlertCard({ alert }: AlertCardProps) {
  const { selectCountry } = useDashboard();
  const color = getRiskColor(alert.severity);

  function handleClick() {
    if (alert.countryCode) {
      const country = mockCountries.find((c) => c.code === alert.countryCode);
      if (country) selectCountry(country);
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className={clsx(
        'flex-shrink-0 flex items-start gap-2.5 px-3 py-2 rounded-lg border transition-all text-left min-w-[200px] max-w-[240px] cursor-pointer',
        'hover:bg-white/[0.03]',
        alert.isNew && 'border-l-2'
      )}
      style={{
        borderColor: `${color}22`,
        borderLeftColor: alert.isNew ? color : undefined,
        backgroundColor: `${color}08`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={alert.detail}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 text-base mt-0.5 font-mono"
        style={{ color }}
      >
        {TYPE_ICONS[alert.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="text-[9px] font-mono font-semibold uppercase tracking-widest"
            style={{ color }}
          >
            {alert.type.replace('_', ' ')}
          </span>
          {alert.isNew && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-slow" />
          )}
        </div>
        <p className="text-xs font-medium text-slate-200 truncate leading-tight">{alert.title}</p>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">{alert.subtitle}</p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">{formatRelativeTime(alert.timestamp)}</p>
      </div>

      {/* Arrow indicator */}
      {alert.countryCode && (
        <div className="flex-shrink-0 text-slate-600 text-xs self-center">›</div>
      )}
    </motion.button>
  );
}
