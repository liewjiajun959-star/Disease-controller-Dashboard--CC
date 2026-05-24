'use client';

import { clsx } from 'clsx';
import type { SeverityLabel } from '@/types';
import { getNewsSeverityBgClass } from '@/utils/riskUtils';

interface SeverityBadgeProps {
  severity: SeverityLabel;
  className?: string;
}

const LABEL: Record<SeverityLabel, string> = {
  breaking: 'BREAKING',
  update: 'UPDATE',
  normal: 'REPORT',
};

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider',
        getNewsSeverityBgClass(severity),
        className
      )}
    >
      {severity === 'breaking' && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-slow" />
      )}
      {LABEL[severity]}
    </span>
  );
}
