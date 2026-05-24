import type { GeoCoordinate, Cluster, ClusterSearchResult, CountryOutbreak } from '@/types';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula. Returns distance in kilometers.
 */
export function calculateDistanceKm(a: GeoCoordinate, b: GeoCoordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const a_ =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));
  return EARTH_RADIUS_KM * c;
}

/**
 * Filters clusters by distance from a user's coordinates within a given radius (km).
 * Returns results sorted by distance ascending.
 */
export function filterClustersByRadius(
  userCoords: GeoCoordinate,
  radiusKm: number,
  clusters: Cluster[],
  countries: CountryOutbreak[]
): ClusterSearchResult[] {
  const results: ClusterSearchResult[] = [];

  for (const cluster of clusters) {
    const distKm = calculateDistanceKm(userCoords, cluster.coordinates);
    if (distKm <= radiusKm) {
      const country = countries.find((c) => c.code === cluster.countryCode);
      if (country) {
        results.push({ cluster, distanceKm: distKm, country });
      }
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Converts a distance in meters to kilometers.
 */
export function metersToKm(meters: number): number {
  return meters / 1000;
}

/**
 * Rounds a distance to a privacy-preserving bucket for logging.
 * E.g., 7.3 km → "5-10km"
 */
export function roundDistanceToBucket(km: number): string {
  if (km < 5) return '<5km';
  if (km < 10) return '5-10km';
  if (km < 25) return '10-25km';
  if (km < 50) return '25-50km';
  return '>50km';
}

/**
 * Determines a rough region label from coordinates for privacy-safe logging.
 * Returns a broad geographic region, never a precise location.
 */
export function getCoordsRegionBucket(coords: GeoCoordinate): string {
  const { lat, lng } = coords;

  if (lat > 23 && lat < 55 && lng > 95 && lng < 150) return 'SE_Asia_East';
  if (lat > 0 && lat < 23 && lng > 95 && lng < 115) return 'SE_Asia';
  if (lat > 20 && lat < 60 && lng > -130 && lng < -60) return 'North_America';
  if (lat > -60 && lat < 15 && lng > -85 && lng < -30) return 'South_America';
  if (lat > 35 && lat < 70 && lng > -10 && lng < 45) return 'Europe';
  if (lat > -35 && lat < 35 && lng > -20 && lng < 55) return 'Africa';
  if (lat > 0 && lat < 55 && lng > 45 && lng < 95) return 'Central_South_Asia';
  if (lat > 55) return 'Northern_Regions';
  if (lat < -35) return 'Southern_Regions';

  return 'Other';
}
