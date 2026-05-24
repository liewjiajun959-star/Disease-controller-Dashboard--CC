# HantaWatch Usage Log — Privacy & Design Documentation

## Overview

HantaWatch includes a privacy-preserving usage logging system for development transparency, debugging, and analytics readiness.

All runtime logs are stored in **sessionStorage only** — they are never transmitted to a server in the default GitHub Pages demo.

---

## What Is Logged

| Event Type | Triggered By | Metadata Stored |
|---|---|---|
| `app_loaded` | App initialization | `dataSource`, `version` |
| `mock_data_loaded` | Mock data import | `countries`, `clusters`, `newsItems` |
| `country_selected` | Globe click / country card click | `countryCode`, `riskLevel`, `source` |
| `panel_switched` | Info panel tab change | `fromTab`, `toTab` |
| `radius_search_attempted` | Search button clicked | `radiusKm`, `unit` |
| `radius_search_succeeded` | Valid search completed | `radiusKm`, `resultCount`, `regionBucket` |
| `radius_search_rejected` | Input validation failure | `rejectionReason` (generic category, NOT the raw input) |
| `nearby_cluster_detected` | Cluster found in radius | `resultCount` |
| `validation_error` | Input validation triggered | `rejectionReason` |
| `security_rejection` | Injection/GPT/code input blocked | `rejectionReason`, `inputLength` (NOT the raw input) |
| `country_video_section_viewed` | Country detail video section opened | `countryCode`, `videoCount` |
| `youtube_video_selected` | Video card clicked | `countryCode`, `videoId`, `sourceType` |
| `youtube_video_opened` | External video link opened | `countryCode`, `videoId`, `action` |

---

## What Is NOT Logged

The following are explicitly **never logged**:

- Full address text entered by the user
- Exact latitude/longitude of the user's location
- Raw content of rejected inputs (GPT attempts, code injections, etc.)
- Real patient names or identifiers
- Email addresses, phone numbers, or any PII
- Precise user location beyond broad regional bucket
- YouTube tracking query strings
- Full user agent string
- IP address
- Browser fingerprint data

---

## How Logs Are Anonymized

### Session ID

- A random session ID is generated using `crypto.getRandomValues()` on first load
- Format: `sess_` + 16 random hex characters
- Stored in `sessionStorage` only — clears when the browser tab closes
- NOT linked to any user identity
- NOT shared across tabs or sessions

### Location Anonymization

When a successful radius search is logged, the user's coordinate is converted to a broad **regional bucket** using `getCoordsRegionBucket()`:

- `SE_Asia`, `North_America`, `South_America`, `Europe`, etc.
- Never stores exact coordinates

### Input Anonymization

When an input is rejected (security_rejection event):
- Only the **character length** of the input is stored
- The **rejection reason category** is stored (e.g., `gpt_llm_request`, `code_injection`)
- The **raw rejected text is never stored or echoed**

---

## Log Entry Schema

```typescript
interface UsageLogEntry {
  id: string;              // Generated: "log-{timestamp}-{counter}"
  timestamp: string;       // ISO 8601
  eventType: UsageEventType;
  feature: string;         // Which feature triggered the event
  status: 'success' | 'rejected' | 'error' | 'info';
  anonymizedSessionId: string; // Random, non-identifying
  metadata: Record<string, string | number | boolean>; // Sanitized — allowlist enforced
  notes: string;           // Human-readable note for debugging
}
```

---

## Storage Mechanism

- **Runtime**: `sessionStorage` under key `hw_usage_log`
- **Maximum entries**: 200 (older entries are dropped)
- **Lifetime**: Current browser session only (clears on tab close)
- **Cross-tab**: Not shared (sessionStorage is per-tab)
- **Server transmission**: None in demo mode

---

## Developer Log Panel

The Developer Usage Log Panel is accessible at the bottom of the dashboard via the "DEV LOGS" toggle.

It shows:
- Event type and timestamp
- Feature that generated the event
- Sanitized metadata (allowlisted fields only)

It does NOT show:
- Raw user input
- Rejected payload content
- Personal information

---

## Connecting Backend Logging (Production Recommendation)

To add server-side logging in production:

1. Create a backend endpoint that accepts sanitized log entries
2. Update `usageLogService.ts` to POST entries to your endpoint
3. Apply the same metadata sanitization server-side
4. Implement rate limiting on the logging endpoint
5. Store logs in a system that complies with your jurisdiction's data protection laws (GDPR, CCPA, etc.)
6. Apply data retention policies (e.g., auto-delete after 90 days)
7. Never log raw user inputs — keep the sanitization layer intact

---

## Privacy Limitations (Demo Mode)

The current implementation:
- Uses sessionStorage which may be accessible to browser extensions
- Does not encrypt log data
- Has no access controls on the Dev Log Panel
- Logs are visible to anyone who opens DevTools

For production, additional measures are required:
- Backend-only log storage
- Access-controlled log viewer (admin auth)
- Encrypted transmission (HTTPS)
- Regulatory compliance audit

---

## Security Audit Commands

```bash
# Check for PII in log output
npm run dev
# Open DevTools → Application → Session Storage → hw_usage_log
# Verify: no addresses, no exact coordinates, no raw rejected text

# Check for console log leaks
# Search codebase for console.log statements
grep -r "console.log" src/ --include="*.ts" --include="*.tsx"
```
