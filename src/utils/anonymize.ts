// ─── Session ID management ─────────────────────────────────────────────────────

const SESSION_ID_KEY = 'hw_session_id';

/**
 * Generates a short random session identifier.
 * Uses crypto.getRandomValues for unpredictability.
 * NOT linked to any user identity.
 */
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return 'sess_' + Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without crypto
  return 'sess_' + Math.random().toString(36).slice(2, 16);
}

/**
 * Returns or creates a session-scoped anonymous session ID.
 * Stored in sessionStorage only — cleared when the browser tab closes.
 * Never stored in localStorage or cookies.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess_ssr';

  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;

    const id = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return generateSessionId();
  }
}

/**
 * Anonymizes a session ID for display purposes.
 * Shows only the first 8 characters.
 */
export function anonymizeSessionId(sessionId: string): string {
  return sessionId.slice(0, 12) + '...';
}

/**
 * Sanitizes log metadata — removes any fields that could contain PII.
 * Enforces an allowlist of safe field names.
 */
export function sanitizeLogMetadata(
  metadata: Record<string, unknown>
): Record<string, string | number | boolean> {
  const ALLOWED_FIELDS = new Set([
    'countryCode', 'riskLevel', 'source', 'fromTab', 'toTab',
    'radiusKm', 'resultCount', 'regionBucket', 'unit', 'dataSource',
    'countries', 'clusters', 'newsItems', 'version', 'rejectionReason',
    'inputLength', 'videoId', 'sourceType', 'action', 'videoCount',
    'feature', 'roundedDistanceBucket',
  ]);

  const safe: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (!ALLOWED_FIELDS.has(key)) continue;

    if (typeof value === 'string') {
      // Truncate and strip potential HTML/injection content
      safe[key] = value.replace(/[<>&"']/g, '').slice(0, 100);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value;
    }
  }

  return safe;
}
