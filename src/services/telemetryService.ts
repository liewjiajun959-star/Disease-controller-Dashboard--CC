/**
 * telemetryService.ts
 *
 * Client-side live data feeds from health authorities.
 * Three source tiers:
 *   1. ReliefWeb API      — CORS-enabled, fetches WHO/OCHA reports in real time
 *   2. CDC Open Data      — Socrata API, CORS-enabled, disease-specific case data
 *   3. Static JSON feeds  — Built by GitHub Actions from WHO/CDC/ProMED RSS every 2h
 *
 * All fetches are fire-and-forget with silent fallback — the UI never breaks.
 */

import type { NewsItem, DiseaseType, TelemetrySource } from '@/types';
import { DISEASE_DATASETS } from '@/data/diseaseDatasets';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Search terms per disease for ReliefWeb full-text query
const RELIEFWEB_TERMS: Record<DiseaseType, string> = {
  hantavirus: 'hantavirus',
  mpox: 'mpox monkeypox',
  covid19: 'COVID-19 SARS-CoV-2',
  ebola: 'ebola',
};

// CDC Open Data Socrata dataset IDs (publicly available, no auth)
const CDC_DATASETS: Record<DiseaseType, string | null> = {
  covid19: '9mfq-cb36',  // COVID-19 Case Surveillance
  mpox: 'hmz2-vwda',     // Mpox Cases
  hantavirus: null,
  ebola: null,
};

// ── Internal helper ──────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ── Source 1: ReliefWeb API ──────────────────────────────────────────────────
// ReliefWeb is the UN OCHA humanitarian data platform and is CORS-enabled.
// It aggregates WHO, UNICEF, MSF, CDC and other authority reports.

export async function fetchReliefWebFeed(disease: DiseaseType): Promise<{
  source: TelemetrySource;
  items: NewsItem[];
}> {
  const t0 = Date.now();
  const base = { id: 'reliefweb', name: 'ReliefWeb (WHO/OCHA)', shortName: 'RWB' };

  try {
    const term = encodeURIComponent(RELIEFWEB_TERMS[disease]);
    const url =
      `https://api.reliefweb.int/v1/reports` +
      `?appname=hantawatch-dashboard` +
      `&query[value]=${term}` +
      `&limit=8` +
      `&sort[]=date.original:desc` +
      `&fields[include][]=title` +
      `&fields[include][]=date` +
      `&fields[include][]=url` +
      `&fields[include][]=source`;

    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const latencyMs = Date.now() - t0;

    const items: NewsItem[] = (json.data ?? [])
      .filter((d: Record<string, unknown>) => (d.fields as Record<string, unknown>)?.title)
      .map((d: Record<string, unknown>, i: number) => {
        const fields = d.fields as Record<string, unknown>;
        const dateObj = fields.date as Record<string, string> | undefined;
        return {
          id: `rw-${disease}-${d.id ?? i}`,
          source: 'ReliefWeb (WHO/OCHA)',
          headline: String(fields.title).slice(0, 200),
          summary: String(fields.title).slice(0, 200),
          publishedAt: dateObj?.original ?? new Date().toISOString(),
          country: null,
          countryCode: null,
          category: 'outbreak',
          severity: 'update' as const,
          url: typeof fields.url === 'string' ? fields.url : null,
          isLive: true,
        };
      });

    return {
      source: { ...base, status: 'live', lastUpdated: new Date(), itemCount: items.length, latencyMs, error: null },
      items,
    };
  } catch (err) {
    return {
      source: {
        ...base,
        status: 'error',
        lastUpdated: null,
        itemCount: 0,
        latencyMs: null,
        error: err instanceof Error ? err.message : 'Fetch failed',
      },
      items: [],
    };
  }
}

// ── Source 2: CDC Open Data (Socrata) ───────────────────────────────────────
// data.cdc.gov Socrata API supports CORS. Disease-specific dataset IDs above.

export async function fetchCDCDataFeed(disease: DiseaseType): Promise<{
  source: TelemetrySource;
  items: NewsItem[];
}> {
  const t0 = Date.now();
  const base = { id: 'cdc_data', name: 'CDC Open Data', shortName: 'CDC' };
  const datasetId = CDC_DATASETS[disease];

  if (!datasetId) {
    return {
      source: { ...base, status: 'idle', lastUpdated: null, itemCount: 0, latencyMs: null, error: null },
      items: [],
    };
  }

  try {
    const url = `https://data.cdc.gov/resource/${datasetId}.json?$limit=5&$order=submission_date+DESC`;
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Record<string, string>[] = await res.json();
    const latencyMs = Date.now() - t0;

    if (!Array.isArray(data) || data.length === 0) {
      return { source: { ...base, status: 'cached', lastUpdated: new Date(), itemCount: 0, latencyMs, error: null }, items: [] };
    }

    const latest = data[0];
    const dateStr = latest.submission_date ?? latest.created_at ?? null;
    const diseaseName = disease === 'covid19' ? 'COVID-19' : disease.charAt(0).toUpperCase() + disease.slice(1);

    const item: NewsItem = {
      id: `cdc-${disease}-${dateStr ?? Date.now()}`,
      source: 'CDC Open Data',
      headline: `CDC ${diseaseName} Case Surveillance Update — ${dateStr ? dateStr.slice(0, 10) : 'Latest'}`,
      summary: `CDC surveillance totals: ${latest.tot_cases ?? latest.cases ?? 'N/A'} total cases, ${latest.new_case ?? latest.new_cases ?? 'N/A'} new. Source: data.cdc.gov`,
      publishedAt: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
      country: 'United States',
      countryCode: 'US',
      category: 'surveillance',
      severity: 'update' as const,
      url: `https://data.cdc.gov/resource/${datasetId}`,
      isLive: true,
    };

    return {
      source: { ...base, status: 'live', lastUpdated: new Date(), itemCount: 1, latencyMs, error: null },
      items: [item],
    };
  } catch (err) {
    return {
      source: {
        ...base,
        status: 'error',
        lastUpdated: null,
        itemCount: 0,
        latencyMs: null,
        error: err instanceof Error ? err.message : 'Fetch failed',
      },
      items: [],
    };
  }
}

// ── Source 3: Static JSON (GitHub Actions refreshes every 2h) ────────────────
// WHO, CDC, ProMED, ECDC, PAHO RSS feeds compiled at build time.

export async function fetchStaticJsonFeed(disease: DiseaseType): Promise<{
  source: TelemetrySource;
  items: NewsItem[];
}> {
  const t0 = Date.now();
  const base = { id: 'rss_feeds', name: 'WHO · CDC · ProMED · ECDC', shortName: 'RSS' };

  try {
    const url = `${BASE_PATH}/data/news-${disease}.json`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NewsItem[] = await res.json();
    const latencyMs = Date.now() - t0;

    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');
    return {
      source: { ...base, status: 'cached', lastUpdated: new Date(), itemCount: data.length, latencyMs, error: null },
      items: data,
    };
  } catch {
    const mock = DISEASE_DATASETS[disease].news;
    return {
      source: { ...base, status: 'error', lastUpdated: null, itemCount: mock.length, latencyMs: null, error: 'Using local cache' },
      items: mock,
    };
  }
}

// ── Aggregate ────────────────────────────────────────────────────────────────

export interface TelemetryResult {
  sources: TelemetrySource[];
  news: NewsItem[];
  fetchedAt: Date;
}

export async function fetchAllTelemetry(disease: DiseaseType): Promise<TelemetryResult> {
  const [rw, cdc, rss] = await Promise.all([
    fetchReliefWebFeed(disease),
    fetchCDCDataFeed(disease),
    fetchStaticJsonFeed(disease),
  ]);

  // Real-time items first, then static, deduplicate by headline prefix
  const all = [...rw.items, ...cdc.items, ...rss.items];
  const seen = new Set<string>();
  const news = all.filter((n) => {
    const key = n.headline.slice(0, 60).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (news.length === 0) {
    news.push(...DISEASE_DATASETS[disease].news);
  }

  return {
    sources: [rw.source, cdc.source, rss.source],
    news,
    fetchedAt: new Date(),
  };
}
