import type { NewsItem, DiseaseType } from '@/types';
import { DISEASE_DATASETS } from '@/data/diseaseDatasets';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Fetches live news from the static JSON file written at build time
 * by scripts/fetch-health-data.mjs.
 *
 * Falls back to mock data if the file doesn't exist or fetch fails.
 * Never throws — always returns an array (possibly empty mock data).
 */
export async function fetchLiveNews(disease: DiseaseType): Promise<NewsItem[]> {
  try {
    const url = `${BASE_PATH}/data/news-${disease}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NewsItem[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');
    return data;
  } catch {
    // Silently fall back to mock data — no console error in production
    return DISEASE_DATASETS[disease].news;
  }
}

/**
 * Returns merged news: live items first (tagged [LIVE]), then mock items
 * for context, deduplicated by headline prefix.
 */
export async function fetchMergedNews(disease: DiseaseType): Promise<NewsItem[]> {
  const [live, mock] = await Promise.all([
    fetchLiveNews(disease),
    Promise.resolve(DISEASE_DATASETS[disease].news),
  ]);

  const liveHeadlines = new Set(live.map((n) => n.headline.slice(0, 60).toLowerCase()));
  const uniqueMock = mock.filter((n) => !liveHeadlines.has(n.headline.slice(0, 60).toLowerCase()));

  return [...live, ...uniqueMock];
}

// Legacy export for backward compatibility
export async function fetchLatestNews(): Promise<NewsItem[]> {
  return fetchLiveNews('hantavirus');
}

export async function fetchHealthAnnouncements(): Promise<NewsItem[]> {
  const news = await fetchLiveNews('hantavirus');
  return news.filter((n) => n.category === 'Guidance' || n.category === 'Public Health');
}
