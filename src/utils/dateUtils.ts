/**
 * Checks whether a news item is "breaking" based on its publication time.
 * Breaking: published within the last 6 hours.
 */
export function isBreakingNews(publishedAt: string): boolean {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const sixHours = 6 * 60 * 60 * 1000;
  return now - published < sixHours;
}

/**
 * Returns true if the date string is older than 24 hours from now.
 */
export function isOlderThan24Hours(dateString: string): boolean {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - date > twentyFourHours;
}

/**
 * Formats a date string to a human-readable relative time.
 * E.g., "2h ago", "1d ago", "Just now"
 */
export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;

  if (diffMs < 60_000) return 'Just now';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  if (diffMs < 604_800_000) return `${Math.floor(diffMs / 86_400_000)}d ago`;

  return formatShortDate(dateString);
}

/**
 * Formats a date string to a short display date (e.g., "May 24, 2025").
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date to just month + day (e.g., "May 16").
 */
export function formatMonthDay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns an ISO date string (YYYY-MM-DD).
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formats a timestamp to UTC time string (e.g., "10:24 UTC").
 */
export function formatUTCTime(dateString: string): string {
  const date = new Date(dateString);
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m} UTC`;
}
