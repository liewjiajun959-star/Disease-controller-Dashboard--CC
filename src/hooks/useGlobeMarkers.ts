'use client';

import { useMemo } from 'react';
import type { CountryOutbreak, GlobeMarker } from '@/types';
import { getRiskMarkerSize } from '@/utils/riskUtils';

export function useGlobeMarkers(
  countries: CountryOutbreak[],
  selectedCode: string | null
): GlobeMarker[] {
  return useMemo(
    () =>
      countries.map((c) => ({
        id: c.id,
        countryCode: c.code,
        label: c.name,
        coordinates: c.coordinates,
        riskLevel: c.riskLevel,
        caseCount: c.totalCases,
        isSelected: c.code === selectedCode,
        isHighlighted: selectedCode === null || c.code === selectedCode,
      })),
    [countries, selectedCode]
  );
}

// Convert GlobeMarkers to cobe-compatible marker format
export function toCOBEMarkers(
  markers: GlobeMarker[]
): { location: [number, number]; size: number }[] {
  return markers.map((m) => ({
    location: [m.coordinates.lat, m.coordinates.lng],
    size: getRiskMarkerSize(m.caseCount),
  }));
}
