// Allowed URL schemes for external links
const ALLOWED_SCHEMES = ['https:', 'http:'];

/**
 * Sanitizes an external URL for use in href attributes.
 * Returns null if the URL is not safe to use.
 * Only allows http and https schemes.
 */
export function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_SCHEMES.includes(parsed.protocol)) return null;
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is a valid YouTube URL (watch, short, or embed format).
 */
export function validateYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase();
    const isYouTube = host === 'www.youtube.com' || host === 'youtube.com';
    const isYouTuBe = host === 'youtu.be';
    const isYouTubeNoCookie = host === 'www.youtube-nocookie.com';

    if (isYouTube) {
      return parsed.pathname === '/watch' || parsed.pathname.startsWith('/embed/');
    }
    if (isYouTuBe) {
      return parsed.pathname.length > 1;
    }
    if (isYouTubeNoCookie) {
      return parsed.pathname.startsWith('/embed/');
    }

    return false;
  } catch {
    return false;
  }
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts a YouTube video ID from a URL.
 * Returns null if the URL is invalid or the ID cannot be determined.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === 'www.youtube.com' || host === 'youtube.com') {
      if (parsed.pathname === '/watch') {
        const v = parsed.searchParams.get('v');
        return v && YOUTUBE_ID_REGEX.test(v) ? v : null;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/embed/')[1]?.split('?')[0] ?? '';
        return YOUTUBE_ID_REGEX.test(id) ? id : null;
      }
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('?')[0];
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (host === 'www.youtube-nocookie.com') {
      const id = parsed.pathname.split('/embed/')[1]?.split('?')[0] ?? '';
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Converts any valid YouTube URL to a safe privacy-enhanced embed URL.
 * Returns null if conversion fails.
 */
export function toSafeYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  if (!id) return null;
  // Use the privacy-enhanced domain (youtube-nocookie.com)
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/**
 * Converts any valid YouTube URL to a safe external watch URL for new-tab opening.
 * Strips all tracking parameters.
 */
export function toSafeYouTubeWatchUrl(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Sanitizes video metadata to ensure it contains no unsafe content.
 * Returns a sanitized copy — never modifies in place.
 */
export function sanitizeVideoMetadata(metadata: Record<string, unknown>): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      // Only include fields with safe string values (no HTML, no scripts)
      const cleaned = String(value).replace(/[<>&"']/g, '');
      safe[key] = cleaned.slice(0, 200); // cap length
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = String(value);
    }
  }
  return safe;
}
