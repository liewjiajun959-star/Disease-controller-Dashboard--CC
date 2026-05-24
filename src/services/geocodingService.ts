import type { GeoCoordinate } from '@/types';
import { normalizeLocationInput } from '@/utils/inputValidation';

// Mock geocoding lookup — pattern-matches common city/country names.
// In production, replace with a backend-proxied geocoding API.
// Never send raw user input directly to external geocoding APIs from the frontend.
const CITY_LOOKUP: Record<string, GeoCoordinate> = {
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'udon thani': { lat: 17.4141, lng: 102.7872 },
  'chiang rai': { lat: 19.9071, lng: 99.8316 },
  'thailand': { lat: 15.8700, lng: 100.9925 },
  'santa cruz': { lat: -17.7863, lng: -63.1812 },
  'bolivia': { lat: -16.5000, lng: -64.0000 },
  'la paz': { lat: -16.5000, lng: -68.1500 },
  'seoul': { lat: 37.5665, lng: 126.9780 },
  'gyeonggi': { lat: 37.4138, lng: 127.5183 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'korea': { lat: 35.9078, lng: 127.7669 },
  'albuquerque': { lat: 35.0853, lng: -106.6056 },
  'new mexico': { lat: 34.5199, lng: -105.8701 },
  'colorado': { lat: 39.5501, lng: -105.7821 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'united states': { lat: 37.0902, lng: -95.7129 },
  'usa': { lat: 37.0902, lng: -95.7129 },
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  'neuquén': { lat: -38.9516, lng: -68.0591 },
  'neuquen': { lat: -38.9516, lng: -68.0591 },
  'patagonia': { lat: -45.0000, lng: -68.0000 },
  'argentina': { lat: -38.4161, lng: -63.6167 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'munich': { lat: 48.1351, lng: 11.5820 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'deutschland': { lat: 51.1657, lng: 10.4515 },
  'santiago': { lat: -33.4489, lng: -70.6693 },
  'temuco': { lat: -38.7359, lng: -72.5904 },
  'chile': { lat: -35.6751, lng: -71.5430 },
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'brazil': { lat: -14.2350, lng: -51.9253 },
  'brasil': { lat: -14.2350, lng: -51.9253 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'harbin': { lat: 45.8038, lng: 126.5349 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'stockholm': { lat: 59.3293, lng: 18.0686 },
  'dalarna': { lat: 61.0000, lng: 14.5000 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'sverige': { lat: 60.1282, lng: 18.6435 },
};

/**
 * Attempts to geocode a location string using the mock lookup table.
 * Returns null if the location cannot be resolved.
 * In production, this function should call a backend-proxied geocoding API.
 */
export async function geocodeAddress(input: string): Promise<GeoCoordinate | null> {
  const normalized = normalizeLocationInput(input).toLowerCase();

  // Try direct lookup
  for (const [key, coords] of Object.entries(CITY_LOOKUP)) {
    if (normalized.includes(key)) {
      return Promise.resolve(coords);
    }
  }

  // Try to parse lat,lng format (e.g., "13.7563, 100.5018")
  const latLngMatch = normalized.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (latLngMatch) {
    const lat = parseFloat(latLngMatch[1]);
    const lng = parseFloat(latLngMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return Promise.resolve({ lat, lng });
    }
  }

  return Promise.resolve(null);
}
