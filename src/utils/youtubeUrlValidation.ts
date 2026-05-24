import { validateYouTubeUrl, extractYouTubeVideoId, toSafeYouTubeWatchUrl } from './urlSecurity';
import type { YouTubeVideoItem } from '@/types';

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Validates a YouTube video ID (strict 11-character format).
 */
export function isValidYouTubeVideoId(id: string): boolean {
  return YOUTUBE_ID_REGEX.test(id);
}

/**
 * Returns a safe URL for opening a video in a new tab.
 * For mock data, strips tracking params and validates format.
 * Returns null if URL is invalid.
 */
export function getSafeVideoOpenUrl(video: YouTubeVideoItem): string | null {
  if (video.sourceType === 'mock') {
    const id = extractYouTubeVideoId(video.videoUrl);
    if (!id) return null;
    return toSafeYouTubeWatchUrl(video.videoUrl);
  }

  if (!validateYouTubeUrl(video.videoUrl)) return null;
  return toSafeYouTubeWatchUrl(video.videoUrl);
}

/**
 * Validates a complete YouTubeVideoItem entry.
 * Used to filter out any malformed entries before rendering.
 */
export function validateVideoEntry(video: YouTubeVideoItem): boolean {
  if (!video.id || typeof video.id !== 'string') return false;
  if (!video.countryCode || video.countryCode.length !== 2) return false;
  if (!video.title || video.title.length > 300) return false;
  if (!video.channelName || video.channelName.length > 100) return false;

  // For mock entries, we relax URL validation (they use placeholder URLs)
  if (video.sourceType === 'mock') {
    const id = extractYouTubeVideoId(video.videoUrl);
    // Allow if we can extract a valid-looking ID OR if it's clearly a placeholder
    if (id && isValidYouTubeVideoId(id)) return true;
    // Accept mock entries even with placeholder URLs
    return true;
  }

  // For real YouTube entries, enforce strict URL validation
  return validateYouTubeUrl(video.videoUrl);
}

/**
 * Sanitizes video title for safe display (no HTML injection).
 * React renders strings safely, but this adds an extra layer.
 */
export function sanitizeVideoTitle(title: string): string {
  return title
    .replace(/[<>&"']/g, '')
    .trim()
    .slice(0, 300);
}

/**
 * Sanitizes relevance tags array.
 */
export function sanitizeRelevanceTags(tags: string[]): string[] {
  return tags
    .filter((t) => typeof t === 'string' && t.length > 0 && t.length <= 50)
    .map((t) => t.replace(/[<>&"']/g, '').trim())
    .slice(0, 10);
}
