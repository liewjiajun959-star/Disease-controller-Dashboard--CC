# HantaWatch — Global Intelligence Dashboard

A polished, secure, privacy-preserving interactive web application that visualizes Hantavirus-related outbreak intelligence through a 3D globe, country risk panels, news feeds, and cluster detection.

> **Demo Data Disclaimer**: All data shown in this application is simulated for demonstration purposes only. This dashboard does not provide medical diagnosis. Always verify outbreak information with official health authorities such as WHO, CDC, or your local public health agency.

---

## Features

- **3D Interactive Globe** — WebGL globe with glowing outbreak markers, country selection, and smooth rotation
- **Top Intelligence Bar** — Real-time alert cards for new clusters, patient zero alerts, and country warnings
- **Left Information Panel** — Tabbed panel with Latest News (grouped by source), Research Breakthroughs, and Health Announcements
- **Right Country Panel** — Country cards ranked by risk level, expandable to full detail view with case timeline, clusters, and anonymized patient chain
- **Address/Radius Cluster Detection** — Enter any location to detect nearby outbreak clusters within a configurable radius
- **Country YouTube Video News** — Curated video cards per country (demo mock data; YouTube API-ready)
- **Privacy-Preserving Usage Logs** — Developer log panel showing sanitized events (sessionStorage only, no PII)
- **Security-First Design** — Strict input validation, anti-injection guards, anti-GPT input blocking, URL sanitization

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, static export) |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Globe | cobe (WebGL, ~5 KB) |
| Validation | Zod |
| Deployment | GitHub Pages via GitHub Actions |

---

## Local Development

### Prerequisites

- Node.js 18 or 20
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/hantawatch-dashboard.git
cd hantawatch-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
npm run build
```

This generates a static export in the `./out/` directory.

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

---

## GitHub Pages Deployment

### Initial Setup

1. Push your repository to GitHub
2. Go to your repository **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow at `.github/workflows/deploy.yml` will trigger on every push to `main`
5. After the first successful run, your site will be available at:
   `https://YOUR_USERNAME.github.io/hantawatch-dashboard/`

### Changing the Repository Name / Base Path

If your GitHub repository name is different from `hantawatch-dashboard`, update the base path:

1. In `.github/workflows/deploy.yml`, change:
   ```yaml
   NEXT_PUBLIC_BASE_PATH: /YOUR_REPO_NAME
   ```

2. That's it — Next.js uses this environment variable to configure `basePath` and `assetPrefix` automatically via `next.config.mjs`.

---

## Mock Data

All mock data is stored in `src/data/`:

| File | Contents |
|---|---|
| `countries.ts` | 10 countries with risk levels, case counts, time series |
| `news.ts` | 15 news items from WHO, CDC, PAHO, ECDC, GHNN, RKI |
| `clusters.ts` | 8 outbreak clusters with coordinates and patient links |
| `patients.ts` | Anonymized patient data (Patient Alpha, Beta, etc.) |
| `announcements.ts` | 5 public health guidance announcements |
| `breakthroughs.ts` | 6 research and diagnostic breakthrough items |
| `youtubeVideos.ts` | 25+ mock video entries per country |
| `usageLog.sample.ts` | Sample usage log entries for documentation |

### Replacing Mock Data with Real APIs

Each data module has a corresponding service in `src/services/`:

1. Update the service function to call your real API endpoint
2. Keep the same TypeScript interface (`src/types/index.ts`)
3. Add your API key to `.env.local` (never commit real keys)
4. The service falls back to mock data if the API is unavailable

---

## Globe Interaction

- **Auto-rotation** — Globe rotates slowly by default
- **Click a marker** — Selects the country and opens the detail panel
- **Hover a marker** — Shows a tooltip with case count, cluster status, and last updated time
- **Country panel selection** — Click a country card to rotate the globe to that country
- **Pause/Resume** — Use the ⏸/▶ button on the globe to toggle auto-rotation
- **User location** — After a successful address search, a cyan marker appears at the geocoded location

---

## Address / Radius Cluster Detection

The address input field detects nearby Hantavirus clusters from a user-provided location.

### How It Works (Demo Mode)

1. User enters a location (city, country, postal code, or lat,lng)
2. Input is validated and sanitized — injection attempts are rejected immediately
3. Mock geocoding matches the input against a city lookup table
4. Haversine formula calculates distances to known clusters
5. Matching clusters are displayed with distance and risk level
6. The user's location appears as a cyan marker on the globe

### In Production

- Replace `geocodingService.ts` with a call to a backend-proxied geocoding API
- Never send raw user location input directly from the frontend to external APIs
- The cluster detection math is already production-ready (pure Haversine function)

---

## Input Validation & Security

### What the Address Field Accepts

- Street addresses
- City names
- Country names
- Postal codes
- Latitude/longitude coordinates (e.g., `13.75, 100.50`)

### What the Address Field Rejects

The field will show a rejection message (never echoing the input) for:

- GPT / AI / LLM requests (`gpt`, `claude`, `chatgpt`, `openai`, etc.)
- Prompt injection attempts (`act as`, `ignore previous instructions`, etc.)
- Code-like payloads (`<script>`, `SELECT *`, `rm -rf`, etc.)
- Unsupported requests (`write code`, `search youtube`, `scrape`, etc.)
- Inputs over 120 characters
- Inputs with excessive punctuation or repeated symbols

### GPT/LLM Blocking

The following utility functions in `src/utils/inputValidation.ts` block AI-related requests:

- `isGptOrLlmRequest()` — blocks AI service names
- `isPromptInstruction()` — blocks prompt injection phrases
- `isUnsupportedFreeformRequest()` — blocks unsupported actions
- `isCodeLikeInput()` — blocks code/script payloads

The rejection message is always: **"This field only accepts addresses, locations, postal codes, or coordinates for nearby cluster detection."**

---

## YouTube Video News

### Demo Mode (Default)

- Videos are stored in `src/data/youtubeVideos.ts` as mock entries
- No YouTube API key required
- Video cards show title, channel, date, summary, and tags
- Clicking "Open ↗" opens the video URL in a new tab (sanitized, validated)

### YouTube URL Safety

All YouTube URLs are validated by `src/utils/youtubeUrlValidation.ts`:

- Only `youtube.com/watch`, `youtu.be/`, and `youtube-nocookie.com/embed/` are allowed
- Video IDs must match `^[a-zA-Z0-9_-]{11}$`
- Tracking parameters are stripped before opening
- Privacy-enhanced `youtube-nocookie.com` domain is used for any embeds

### Future YouTube API Integration

To connect the real YouTube Data API v3:

1. Create a backend or build-time script that calls the YouTube API
2. Generate system queries only: `"{Country} Hantavirus news"`
3. Validate all returned URLs before storing
4. Never send user-entered text as a YouTube search query
5. Store results in `src/data/youtubeVideos.ts` at build time

---

## Usage Logging

See [`docs/USAGE_LOG.md`](docs/USAGE_LOG.md) for full documentation.

**Summary:**
- Logs stored in `sessionStorage` only — cleared on tab close
- No PII, no full addresses, no exact coordinates
- Raw rejected inputs are never stored
- Session ID is random and not linked to any identity
- No server transmission in demo mode

---

## Secrets & Environment Variables

Copy `.env.example` to `.env.local` for local overrides:

```bash
cp .env.example .env.local
```

**Never commit `.env.local` or any file containing real API keys.**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | GitHub Pages repository base path (e.g., `/hantawatch-dashboard`) |

---

## Security Commands

```bash
# Audit npm dependencies for known vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Type check
npm run type-check

# Lint
npm run lint
```

**Note on VulnDB**: Direct VulnDB verification requires a licensed subscription. The implementation was reviewed against OWASP Top 10, CVE/NVD patterns, GitHub Security Advisory data, and npm audit as available alternatives.

---

## Secure Coding Commitments

This application follows these security principles:

- No `eval()`, `new Function()`, or dynamic code execution
- No `dangerouslySetInnerHTML`
- All user input sanitized before any use
- External URLs validated against an allowlist (http/https only)
- YouTube URLs validated against strict patterns
- No secrets in frontend code or repository
- No sensitive data in localStorage
- Anonymous patient data only — no PII
- Usage logs never contain raw user inputs or precise location

---

## Medical Disclaimer

> This dashboard is for **informational and visualization purposes only**. It does not provide medical diagnosis. Always verify with official health authorities such as WHO, CDC, or local public health agencies.

> Demo data shown in this application is **simulated** unless explicitly connected to verified official sources.

---

## Production Hardening Recommendations

Before deploying to production with real data:

1. **Move API calls server-side** — Never expose API keys in the frontend
2. **Add CSP headers** — Configure `Content-Security-Policy` at the CDN/server level
3. **Backend logging** — Replace sessionStorage logs with a secure backend logging service
4. **Rate limiting** — Enforce server-side rate limits on geocoding and search endpoints
5. **Input validation** — Mirror all client-side validation server-side
6. **Dependency audits** — Run `npm audit` and `npx osv-scanner .` regularly
7. **Dependabot** — Enable GitHub Dependabot for automated security alerts
8. **HTTPS** — Ensure all traffic uses HTTPS (GitHub Pages provides this automatically)
9. **Cookie consent** — If adding any cookies beyond sessionStorage, comply with GDPR/CCPA
10. **Data source verification** — Only display data from verified official health APIs (WHO, CDC)
