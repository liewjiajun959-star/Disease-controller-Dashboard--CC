import { mockYouTubeVideos } from '@/data/youtubeVideos';
import type { YouTubeVideoItem } from '@/types';
import { validateVideoEntry } from '@/utils/youtubeUrlValidation';

/**
 * Returns validated video entries for a given country code.
 * Falls back to mock data — no YouTube API key required for demo mode.
 *
 * For production YouTube API integration:
 * - Keep API calls server-side or in a build-time script
 * - Never expose API keys in frontend code
 * - Use system-generated queries only: "{Country} Hantavirus news"
 * - Fall back to mock data if API is unavailable
 */
export async function fetchCountryVideos(countryCode: string): Promise<YouTubeVideoItem[]> {
  const videos = mockYouTubeVideos
    .filter((v) => v.countryCode === countryCode)
    .filter(validateVideoEntry);

  return Promise.resolve(videos);
}

export async function fetchAllVideos(): Promise<YouTubeVideoItem[]> {
  return Promise.resolve(mockYouTubeVideos.filter(validateVideoEntry));
}

export function getVideoById(id: string): YouTubeVideoItem | undefined {
  return mockYouTubeVideos.find((v) => v.id === id);
}
