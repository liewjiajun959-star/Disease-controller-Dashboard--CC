/**
 * fetch-health-data.mjs
 *
 * Build-time script: fetches RSS feeds from public health authorities,
 * filters by disease keywords, and writes static JSON files to public/data/.
 *
 * Run:  node scripts/fetch-health-data.mjs
 *
 * Output:
 *   public/data/news-hantavirus.json
 *   public/data/news-mpox.json
 *   public/data/news-covid19.json
 *   public/data/news-ebola.json
 *
 * Security: No user input is processed. All sources are hardcoded.
 * Privacy:  No PII collected. No user data written.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const FETCH_TIMEOUT_MS = 8000;
const MAX_ITEMS_PER_DISEASE = 20;

// ─── Disease keyword filters ──────────────────────────────────────────────────

const DISEASE_KEYWORDS = {
  hantavirus: ['hantavirus', 'hanta', 'hemorrhagic fever with renal syndrome', 'hfrs', 'hps', 'sin nombre', 'andes virus', 'puumala'],
  mpox: ['mpox', 'monkeypox', 'mpxv', 'clade i', 'clade ii', 'mva-bn'],
  covid19: ['covid-19', 'covid19', 'sars-cov-2', 'sars-cov', 'coronavirus', 'nb.1.8', 'xbb'],
  ebola: ['ebola', 'ebolavirus', 'ebov', 'sudv', 'marburg', 'viral haemorrhagic fever', 'viral hemorrhagic fever'],
};

// ─── RSS sources (public, no authentication required) ─────────────────────────

const RSS_SOURCES = [
  {
    name: 'WHO Disease Outbreaks',
    url: 'https://www.who.int/rss-feeds/news-releases-en.xml',
    category: 'outbreak',
  },
  {
    name: 'CDC Emergency Preparedness',
    url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
    category: 'advisory',
  },
  {
    name: 'ProMED Mail',
    url: 'https://promedmail.org/feed/',
    category: 'surveillance',
  },
  {
    name: 'ECDC',
    url: 'https://www.ecdc.europa.eu/en/rss.xml',
    category: 'surveillance',
  },
  {
    name: 'ReliefWeb',
    url: 'https://reliefweb.int/updates/rss.xml?primary_country=0&source=WHO',
    category: 'response',
  },
  {
    name: 'PAHO',
    url: 'https://www.paho.org/en/rss',
    category: 'advisory',
  },
];

// ─── XML parser (no external deps — plain regex on RSS 2.0 / Atom) ────────────

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripCdata(extractTag(block, 'title')) ?? '';
    const description = stripCdata(extractTag(block, 'description') ?? extractTag(block, 'summary')) ?? '';
    const link = stripCdata(extractTag(block, 'link')) ?? null;
    const pubDate = stripCdata(extractTag(block, 'pubDate') ?? extractTag(block, 'dc:date') ?? extractTag(block, 'published')) ?? null;

    if (title) {
      items.push({ title, description, link, pubDate });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

function stripCdata(str) {
  if (!str) return str;
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
}

function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Fetch one RSS source with timeout ────────────────────────────────────────

async function fetchSource(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HantaWatch-HealthDataBot/1.0 (public health dashboard; build-time only)' },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[WARN] ${source.name}: HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items = parseRssItems(xml);
    console.log(`[OK]   ${source.name}: ${items.length} items`);
    return items.map((item) => ({ ...item, sourceName: source.name, category: source.category }));
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn(`[WARN] ${source.name}: timeout after ${FETCH_TIMEOUT_MS}ms`);
    } else {
      console.warn(`[WARN] ${source.name}: ${err.message}`);
    }
    return [];
  }
}

// ─── Filter items by disease keywords ────────────────────────────────────────

function matchesDisease(item, disease) {
  const keywords = DISEASE_KEYWORDS[disease];
  const text = `${item.title} ${item.description}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

// ─── Map raw RSS item to NewsItem shape ───────────────────────────────────────

let idCounter = 0;

function toNewsItem(raw, disease) {
  idCounter++;
  const headline = raw.title.slice(0, 200);
  const summary = stripHtml(raw.description).slice(0, 400) || headline;

  // Determine severity heuristically
  const lc = headline.toLowerCase();
  const severity =
    lc.includes('emergency') || lc.includes('alert') || lc.includes('outbreak') || lc.includes('breaking')
      ? 'breaking'
      : lc.includes('update') || lc.includes('situation') || lc.includes('report') || lc.includes('new cases')
      ? 'update'
      : 'normal';

  // Parse publishedAt
  let publishedAt;
  try {
    publishedAt = raw.pubDate ? new Date(raw.pubDate).toISOString() : new Date().toISOString();
  } catch {
    publishedAt = new Date().toISOString();
  }

  // Sanitize URL — only allow https
  const url = raw.link && raw.link.startsWith('https://') ? raw.link : null;

  return {
    id: `live-${disease}-${idCounter}`,
    source: raw.sourceName,
    headline,
    summary,
    publishedAt,
    country: null,
    countryCode: null,
    category: raw.category,
    severity,
    url,
    isLive: true,
  };
}

// ─── Deduplicate by headline prefix ───────────────────────────────────────────

function deduplicate(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.headline.slice(0, 60).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== HantaWatch Health Data Fetch ===');
  console.log(`Sources: ${RSS_SOURCES.length} | Diseases: ${Object.keys(DISEASE_KEYWORDS).length}\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Fetch all sources concurrently
  const allItems = (await Promise.all(RSS_SOURCES.map(fetchSource))).flat();
  console.log(`\nTotal raw items: ${allItems.length}`);

  // Filter, map, deduplicate, and write per disease
  for (const disease of Object.keys(DISEASE_KEYWORDS)) {
    const filtered = allItems.filter((item) => matchesDisease(item, disease));
    const mapped = filtered.map((raw) => toNewsItem(raw, disease));
    const deduped = deduplicate(mapped).slice(0, MAX_ITEMS_PER_DISEASE);

    const outPath = join(OUTPUT_DIR, `news-${disease}.json`);
    writeFileSync(outPath, JSON.stringify(deduped, null, 2), 'utf-8');
    console.log(`[OUT]  news-${disease}.json — ${deduped.length} items`);
  }

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('[FATAL]', err);
  // Exit 0 so build continues even if fetch fails — client will use mock data
  process.exit(0);
});
