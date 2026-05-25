// ─── Risk & Severity ─────────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type SeverityLabel = 'breaking' | 'update' | 'normal';
export type PanelTab = 'news' | 'breakthroughs' | 'announcements';
export type SourceType = 'mock' | 'youtube';
export type TrendDirection = 'rising' | 'stable' | 'declining';

// ─── Disease ──────────────────────────────────────────────────────────────────

export type DiseaseType = 'hantavirus' | 'mpox' | 'covid19' | 'ebola';

export interface DiseaseConfig {
  id: DiseaseType;
  label: string;          // e.g. "Hantavirus"
  shortLabel: string;     // e.g. "HANTA"
  icon: string;           // emoji / symbol
  accentColor: string;    // CSS hex for active border/background tint
  globeGlowColor: [number, number, number];   // cobe RGB 0–1
  globeMarkerColor: [number, number, number]; // cobe RGB 0–1
}

export interface DiseaseDataset {
  countries: CountryOutbreak[];
  news: NewsItem[];
  clusters: Cluster[];
  patients: Patient[];
  breakthroughs: Breakthrough[];
  announcements: HealthAnnouncement[];
}

// ─── Geo ──────────────────────────────────────────────────────────────────────

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

// ─── Core Data Models ─────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  source: string;
  headline: string;
  summary: string;
  publishedAt: string; // ISO 8601
  country: string | null;
  countryCode: string | null;
  category: string;
  severity: SeverityLabel;
  url: string | null;
}

export interface CountryOutbreak {
  id: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2
  flagEmoji: string;
  coordinates: GeoCoordinate;
  totalCases: number;
  firstCaseDate: string; // ISO 8601
  riskLevel: RiskLevel;
  patientZeroStatus: 'identified' | 'under_investigation' | 'unknown';
  activeClusters: number;
  lastUpdated: string; // ISO 8601
  videoNewsCount: number;
  trend: TrendDirection;
  strainName: string;
  affectedRegions: string[];
  casesTimeSeries: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  cases: number;
}

export interface Cluster {
  id: string;
  countryCode: string;
  name: string;
  region: string;          // Administrative region / province name
  coordinates: GeoCoordinate;
  firstDetected: string; // ISO 8601
  status: 'active' | 'contained' | 'monitoring';
  caseCount: number;
  relatedPatients: string[]; // Patient IDs
  suspectedSource: string;
  links: ClusterLink[];
}

export interface ClusterLink {
  targetClusterId: string;
  linkType: 'travel' | 'contact' | 'geographic' | 'epidemiological';
  confidence: 'high' | 'medium' | 'low';
}

export interface Patient {
  id: string;
  anonymousLabel: string; // e.g. "Patient A", "Patient B"
  countryCode: string;
  clusterId: string;
  detectedDate: string; // ISO 8601
  exposureType: 'rodent_contact' | 'environment' | 'travel' | 'unknown';
  relationshipLinks: PatientLink[];
  status: 'recovered' | 'active' | 'deceased' | 'unknown';
}

export interface PatientLink {
  targetPatientId: string;
  relationship: 'household' | 'workplace' | 'travel' | 'geographic';
}

export interface HealthAnnouncement {
  id: string;
  title: string;
  source: string;
  country: string | null;
  summary: string;
  recommendationLevel: 'urgent' | 'advisory' | 'informational';
  publishedAt: string; // ISO 8601
  tags: string[];
}

export interface Breakthrough {
  id: string;
  title: string;
  source: string;
  summary: string;
  confidenceLevel: 'high' | 'medium' | 'preliminary';
  publishedAt: string; // ISO 8601
  relatedRegion: string | null;
  type: 'vaccine' | 'treatment' | 'diagnostic' | 'surveillance' | 'epidemiology';
}

export interface YouTubeVideoItem {
  id: string;
  countryCode: string;
  title: string;
  channelName: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl: string;
  videoUrl: string;
  sourceType: SourceType;
  relevanceTags: string[];
  summary: string;
  safetyLabel: string;
}

// ─── Alert (Top Bar) ──────────────────────────────────────────────────────────

export interface AlertCard {
  id: string;
  type: 'patient_zero' | 'new_cluster' | 'country_alert' | 'global_update';
  title: string;
  subtitle: string;
  detail: string;
  countryCode: string | null;
  severity: RiskLevel;
  timestamp: string; // ISO 8601
  isNew: boolean;
}

// ─── Usage Log ────────────────────────────────────────────────────────────────

export type UsageEventType =
  | 'app_loaded'
  | 'country_selected'
  | 'panel_switched'
  | 'radius_search_attempted'
  | 'radius_search_succeeded'
  | 'radius_search_rejected'
  | 'nearby_cluster_detected'
  | 'validation_error'
  | 'security_rejection'
  | 'mock_data_loaded'
  | 'country_video_section_viewed'
  | 'youtube_video_selected'
  | 'youtube_video_opened';

export interface UsageLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  eventType: UsageEventType;
  feature: string;
  status: 'success' | 'rejected' | 'error' | 'info';
  anonymizedSessionId: string;
  metadata: Record<string, string | number | boolean>;
  notes: string;
}

// ─── Search / Cluster Detection ───────────────────────────────────────────────

export interface AddressSearchState {
  rawInput: string;
  radiusKm: number;
  coordinates: GeoCoordinate | null;
  status: 'idle' | 'validating' | 'geocoding' | 'success' | 'rejected' | 'rate_limited' | 'no_results';
  errorMessage: string | null;
  results: ClusterSearchResult[];
}

export interface ClusterSearchResult {
  cluster: Cluster;
  distanceKm: number;
  country: CountryOutbreak;
}

// ─── Globe Marker ─────────────────────────────────────────────────────────────

export interface GlobeMarker {
  id: string;
  countryCode: string;
  label: string;
  coordinates: GeoCoordinate;
  riskLevel: RiskLevel;
  caseCount: number;
  isSelected: boolean;
  isHighlighted: boolean;
}
