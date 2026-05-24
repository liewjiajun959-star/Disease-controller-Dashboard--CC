import { mockNews } from '@/data/news';
import type { NewsItem } from '@/types';

export async function fetchLatestNews(): Promise<NewsItem[]> {
  // Returns mock data. Replace with real API call when a backend is available.
  return Promise.resolve(mockNews);
}

export async function fetchHealthAnnouncements(): Promise<NewsItem[]> {
  return Promise.resolve(mockNews.filter((n) => n.category === 'Guidance' || n.category === 'Public Health'));
}
