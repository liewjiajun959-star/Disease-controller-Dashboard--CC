import type { UsageLogEntry, UsageEventType } from '@/types';
import { getOrCreateSessionId, sanitizeLogMetadata } from '@/utils/anonymize';

const LOG_STORAGE_KEY = 'hw_usage_log';
const MAX_LOG_ENTRIES = 200;

let logIdCounter = 0;

function generateLogId(): string {
  logIdCounter += 1;
  return `log-${Date.now()}-${logIdCounter}`;
}

/**
 * Creates a new usage log entry (in memory — not yet persisted).
 */
export function createUsageLogEntry(
  eventType: UsageEventType,
  feature: string,
  status: UsageLogEntry['status'],
  metadata: Record<string, unknown> = {},
  notes = ''
): UsageLogEntry {
  return {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    eventType,
    feature,
    status,
    anonymizedSessionId: getOrCreateSessionId(),
    metadata: sanitizeLogMetadata(metadata),
    notes,
  };
}

/**
 * Appends a log entry to sessionStorage.
 * Privacy rules enforced by sanitizeLogMetadata — no PII is stored.
 */
export function logAppEvent(
  eventType: UsageEventType,
  feature: string,
  status: UsageLogEntry['status'] = 'info',
  metadata: Record<string, unknown> = {},
  notes = ''
): void {
  if (typeof window === 'undefined') return;

  const entry = createUsageLogEntry(eventType, feature, status, metadata, notes);

  try {
    const existing = getUsageLogs();
    const updated = [...existing, entry].slice(-MAX_LOG_ENTRIES);
    sessionStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // sessionStorage full or unavailable — fail silently
  }
}

/**
 * Retrieves all sanitized usage log entries from sessionStorage.
 */
export function getUsageLogs(): UsageLogEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = sessionStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UsageLogEntry[];
  } catch {
    return [];
  }
}

/**
 * Clears all usage log entries from sessionStorage.
 */
export function clearUsageLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(LOG_STORAGE_KEY);
  } catch {
    // fail silently
  }
}
