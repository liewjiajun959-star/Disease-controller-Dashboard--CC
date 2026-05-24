import { mockClusters } from '@/data/clusters';
import { mockCountries } from '@/data/countries';
import type { Cluster, ClusterSearchResult, GeoCoordinate } from '@/types';
import { filterClustersByRadius } from '@/utils/distanceUtils';

export async function fetchClusters(): Promise<Cluster[]> {
  return Promise.resolve(mockClusters);
}

/**
 * Detects outbreak clusters within a given radius from the user's location.
 * Pure function — all computation is local, no external API calls.
 */
export async function detectNearbyClusters(
  userCoords: GeoCoordinate,
  radiusKm: number
): Promise<ClusterSearchResult[]> {
  return Promise.resolve(
    filterClustersByRadius(userCoords, radiusKm, mockClusters, mockCountries)
  );
}

export function getClustersByCountry(countryCode: string): Cluster[] {
  return mockClusters.filter((c) => c.countryCode === countryCode);
}
