'use client';

import { useCallback } from 'react';
import { logAppEvent } from '@/services/usageLogService';
import type { UsageEventType } from '@/types';

export function useUsageLogger() {
  const log = useCallback(
    (
      eventType: UsageEventType,
      feature: string,
      status: 'success' | 'rejected' | 'error' | 'info' = 'info',
      metadata: Record<string, unknown> = {},
      notes = ''
    ) => {
      logAppEvent(eventType, feature, status, metadata, notes);
    },
    []
  );

  return { log };
}
