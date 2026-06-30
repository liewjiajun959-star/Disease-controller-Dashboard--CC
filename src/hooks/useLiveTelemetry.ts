'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NewsItem, DiseaseType, TelemetrySource } from '@/types';
import { fetchAllTelemetry } from '@/services/telemetryService';
import { DISEASE_DATASETS } from '@/data/diseaseDatasets';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5-minute client-side polling

export interface LiveTelemetryState {
  sources: TelemetrySource[];
  news: NewsItem[];
  lastPoll: Date | null;
  isPolling: boolean;
  refresh: () => void;
}

export function useLiveTelemetry(disease: DiseaseType): LiveTelemetryState {
  const [sources, setSources] = useState<TelemetrySource[]>([]);
  const [news, setNews] = useState<NewsItem[]>(() => DISEASE_DATASETS[disease].news);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  // Ref so the interval callback always sees the current disease without re-registering
  const diseaseRef = useRef(disease);
  diseaseRef.current = disease;

  const poll = useCallback(async () => {
    setIsPolling(true);
    try {
      const result = await fetchAllTelemetry(diseaseRef.current);
      setSources(result.sources);
      setNews(result.news);
      setLastPoll(result.fetchedAt);
    } finally {
      setIsPolling(false);
    }
  }, []);

  // Immediately swap to mock for the new disease, then fetch
  useEffect(() => {
    setNews(DISEASE_DATASETS[disease].news);
    poll();
  }, [disease, poll]);

  // Background polling
  useEffect(() => {
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [poll]);

  return { sources, news, lastPoll, isPolling, refresh: poll };
}
