'use client';

import { clsx } from 'clsx';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  noBorder?: boolean;
}

export default function GlassPanel({ children, className, elevated = false, noBorder = false }: GlassPanelProps) {
  return (
    <div
      className={clsx(
        elevated ? 'glass-elevated' : 'glass',
        !noBorder && 'border border-white/[0.06]',
        'rounded-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
