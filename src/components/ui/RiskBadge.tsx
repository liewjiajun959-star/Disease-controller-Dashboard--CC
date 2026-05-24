'use client';

import { clsx } from 'clsx';
import type { RiskLevel } from '@/types';
import { getRiskBgClass } from '@/utils/riskUtils';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export default function RiskBadge({ level, size = 'sm', className }: RiskBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border font-mono font-medium uppercase tracking-wider',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        getRiskBgClass(level),
        className
      )}
    >
      {level}
    </span>
  );
}
