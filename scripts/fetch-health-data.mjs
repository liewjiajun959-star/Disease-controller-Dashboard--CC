/**
 * fetch-health-data.mjs
 *
 * Build-time + scheduled script: fetches RSS feeds and JSON APIs from public
 * health authorities, filters by disease keywords, and writes static JSON
 * files to public/data/ that the client-side telemetry layer reads.
 *
 * Run:  node scripts/fetch-health-data.mjs
 *
 * Output:
 *   public/data/news-hantavirus.json
 *   public/data/news-mpox.json
 *   public/data/news-covid19.json
 *   public/data/news-ebola.json
 *   public/data/telemetry-meta.json   ← last-fetched timestamp + source stats
 *
 * Security: No user input. All sources hardcoded. No PII collected.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const FETCH_TIMEOUT_MS = 8000;
const MAX_ITEMS_PER_DISEASE = 25;

// ─── Disease keyword filters ──────────────────────────────────────────────────

const DISEASE_KEYWORDS = {
  hantavirus: ['hantavirus', 'hanta', 'hemorrhagic fever with renal syndrome', 'hfrs', 'hps', 'sin nombre', 'andes virus', 'puumala', 'seoul virus'],
  mpox: ['mpox', 'monkeypox', 'mpxv', 'clade i', 'clade ii', 'mva-bn', 'clade ib', 'clade ia'],
  covid19: ['covid-19', 'covid19', 'sars-cov-2', 'sars-cov', 'coronavirus', 'nb.1.8', 'xbb', 'jn.1', 'kp.2', 'lp.8'],
  ebola: ['ebola', 'ebolavirus', 'ebov', 'sudv', 'marburg', 'marburgvirus', 'viral haemorrhagic fever', 'viral hemorrhagic fever', 'mvd'],
};

// ─── RSS sources ──────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  // WHO
  { name: 'WHO Disease Outbreaks',       url: 'https://www.who.int/rss-feeds/news-releases-en.xml',                        category: 'outbreak' },
  { name: 'WHO Emergencies',             url: 'https://www.who.int/emergencies/disease-outbreak-news/rss',                  category: 'outbreak' },
  // CDC
  { name: 'CDC Emergency Preparedness', url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',                    category: 'advisory' },
  { name: 'CDC Travelers Health',       url: 'https://wwwnc.cdc.gov/travel/rss/travels.xml',                              category: 'advisory' },
  // Surveillance networks
  { name: 'ProMED Mail',                url: 'https://promedmail.org/feed/',                                               category: 'surveillance' },
  { name: 'ECDC',                       url: 'https://www.ecdc.europa.eu/en/rss.xml',                                     category: 'surveillance' },
  // Humanitarian / response
  { name: 'ReliefWeb',                  url: 'https://reliefweb.int/updates/rss.xml?primary_country=0&source=WHO',         category: 'response' },
  { name: 'PAHO',                       url: 'https://www.paho.org/en/rss',                                               category: 'advisory' },
  // Regional
  { name: 'APSED / WHO WPRO',          url: 'https://www.who.int/westernpacific/rss-feeds/news-releases-en.xml',          category: 'surveillance' },
  { name: 'AFRO WHO',                  url: 'https://www.afro.who.int/rss.xml',                                           category: 'outbreak' },
];

// ─── JSON API sources (non-RSS structured data) ───────────────────────────────

const JSON_API_SOURCES = [
  {
    name: 'WHO Disease Outbreak News (DON)',
    url: 'https://www.who.int/api/news/newstype/donews',
    type: 'who_don',
    category: 'outbreak',
  },
];

// ─── XML parser (no external deps) ───────────────────────────────────────────

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title       = stripCdata(extractTag(block, 'title')) ?? '';
    const description = stripCdata(extractTag(block, 'description') ?? extractTag(block, 'summary')) ?? '';
    const link        = stripCdata(extractTag(block, 'link')) ?? null;
    const pubDate     = stripCdata(extractTag(block, 'pubDate') ?? extractTag(block, 'dc:date') ?? extractTag(block, 'published')) ?? null;

    if (title) items.push({ title, description, link, pubDate });
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

// ─── HTTP fetch with timeout ──────────────────────────────────────────────────

async function fetchSource(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HantaWatch-HealthDataBot/2.0 (public health dashboard; build-time data fetch)',
        Accept: source.type === 'who_don' ? 'application/json' : 'application/rss+xml, application/xml, text/xml',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[WARN] ${source.name}: HTTP ${res.status}`);
      return [];
    }

    if (source.type === 'who_don') {
      return await parseWhoDon(res, source);
    }

    const xml = await res.text();
    const items = parseRssItems(xml);
    console.log(`[OK]   ${source.name}: ${items.length} items`);
    return items.map((item) => ({ ...item, sourceName: source.name, category: source.category }));
  } catch (err) {
    clearTimeout(timer);
    const reason = err.name === 'AbortError' ? `timeout after ${FETCH_TIMEOUT_MS}ms` : err.message;
    console.warn(`[WARN] ${source.name}: ${reason}`);
    return [];
  }
}

// ─── WHO DON JSON API parser ──────────────────────────────────────────────────

async function parseWhoDon(res, source) {
  try {
    const json = await res.json();
    // WHO DON API returns: { value: [ { Title, PublicationDate, Url, Summary } ] }
    const records = Array.isArray(json?.value) ? json.value : (Array.isArray(json) ? json : []);
    const items = records.slice(0, 30).map((r) => ({
      title:      r.Title ?? r.title ?? '',
      description: stripHtml(r.Summary ?? r.summary ?? r.Title ?? '').slice(0, 400),
      link:       r.Url ?? r.url ?? null,
      pubDate:    r.PublicationDate ?? r.publicationDate ?? null,
      sourceName: source.name,
      category:   source.category,
    })).filter((i) => i.title);
    console.log(`[OK]   ${source.name}: ${items.length} items (JSON API)`);
    return items;
  } catch {
    console.warn(`[WARN] ${source.name}: JSON parse failed`);
    return [];
  }
}

// ─── Disease keyword matching ─────────────────────────────────────────────────

function matchesDisease(item, disease) {
  const keywords = DISEASE_KEYWORDS[disease];
  const text = `${item.title} ${item.description}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

// ─── Map raw item → NewsItem ──────────────────────────────────────────────────

let idCounter = 0;

function toNewsItem(raw, disease) {
  idCounter++;
  const headline = raw.title.slice(0, 200);
  const summary  = stripHtml(raw.description).slice(0, 400) || headline;

  const lc = headline.toLowerCase();
  const severity =
    lc.includes('emergency') || lc.includes('alert') || lc.includes('outbreak') || lc.includes('breaking')
      ? 'breaking'
      : lc.includes('update') || lc.includes('situation') || lc.includes('report') || lc.includes('new cases')
      ? 'update'
      : 'normal';

  let publishedAt;
  try {
    publishedAt = raw.pubDate ? new Date(raw.pubDate).toISOString() : new Date().toISOString();
  } catch {
    publishedAt = new Date().toISOString();
  }

  const url = raw.link && raw.link.startsWith('https://') ? raw.link : null;

  return {
    id:          `live-${disease}-${idCounter}`,
    source:      raw.sourceName,
    headline,
    summary,
    publishedAt,
    country:     null,
    countryCode: null,
    category:    raw.category,
    severity,
    url,
    isLive:      true,
  };
}

// ─── Deduplicate by headline prefix ──────────────────────────────────────────

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
  const fetchedAt = new Date().toISOString();
  console.log('\n=== HantaWatch Health Data Fetch ===');
  console.log(`Time: ${fetchedAt}`);
  console.log(`RSS sources: ${RSS_SOURCES.length} | JSON APIs: ${JSON_API_SOURCES.length} | Diseases: ${Object.keys(DISEASE_KEYWORDS).length}\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Fetch all sources concurrently
  const allSources = [...RSS_SOURCES, ...JSON_API_SOURCES];
  const allItems = (await Promise.all(allSources.map(fetchSource))).flat();
  console.log(`\nTotal raw items: ${allItems.length}`);

  const meta = { fetchedAt, sources: [], diseases: {} };

  for (const disease of Object.keys(DISEASE_KEYWORDS)) {
    const filtered = allItems.filter((item) => matchesDisease(item, disease));
    const mapped   = filtered.map((raw) => toNewsItem(raw, disease));
    const deduped  = deduplicate(mapped).slice(0, MAX_ITEMS_PER_DISEASE);

    const outPath = join(OUTPUT_DIR, `news-${disease}.json`);
    writeFileSync(outPath, JSON.stringify(deduped, null, 2), 'utf-8');
    console.log(`[OUT]  news-${disease}.json — ${deduped.length} items`);
    meta.diseases[disease] = { count: deduped.length, fetchedAt };
  }

  // Write telemetry metadata (used by the UI to show last-refreshed time)
  meta.sources = allSources.map((s) => ({ name: s.name, category: s.category }));
  writeFileSync(join(OUTPUT_DIR, 'telemetry-meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
  console.log('[OUT]  telemetry-meta.json');

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('[FATAL]', err.message);
  process.exit(0); // Exit 0 so build pipeline continues; client uses mock fallback
});
