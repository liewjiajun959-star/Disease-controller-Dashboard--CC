'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ClusterSearchResult, GeoCoordinate } from '@/types';

export interface ClusterState {
  searchStatus: 'idle' | 'searching' | 'success' | 'rejected' | 'rate_limited' | 'no_results' | 'geocode_failed';
  results: ClusterSearchResult[];
  userMarker: GeoCoordinate | null;
  errorMessage: string | null;
  lastRadiusKm: number;
}

type ClusterAction =
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: { results: ClusterSearchResult[]; userMarker: GeoCoordinate; radiusKm: number } }
  | { type: 'SEARCH_REJECTED'; payload: { message: string } }
  | { type: 'RATE_LIMITED' }
  | { type: 'GEOCODE_FAILED' }
  | { type: 'NO_RESULTS'; payload: { userMarker: GeoCoordinate; radiusKm: number } }
  | { type: 'CLEAR' };

const initialState: ClusterState = {
  searchStatus: 'idle',
  results: [],
  userMarker: null,
  errorMessage: null,
  lastRadiusKm: 25,
};

function clusterReducer(state: ClusterState, action: ClusterAction): ClusterState {
  switch (action.type) {
    case 'SEARCH_START':
      return { ...state, searchStatus: 'searching', errorMessage: null };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        searchStatus: action.payload.results.length > 0 ? 'success' : 'no_results',
        results: action.payload.results,
        userMarker: action.payload.userMarker,
        lastRadiusKm: action.payload.radiusKm,
        errorMessage: null,
      };
    case 'NO_RESULTS':
      return {
        ...state,
        searchStatus: 'no_results',
        results: [],
        userMarker: action.payload.userMarker,
        lastRadiusKm: action.payload.radiusKm,
      };
    case 'SEARCH_REJECTED':
      return { ...state, searchStatus: 'rejected', errorMessage: action.payload.message, results: [] };
    case 'RATE_LIMITED':
      return { ...state, searchStatus: 'rate_limited', errorMessage: 'Please wait before searching again.' };
    case 'GEOCODE_FAILED':
      return { ...state, searchStatus: 'geocode_failed', errorMessage: 'Location not recognized. Try a city name, country, or lat,lng coordinates.' };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

interface ClusterContextValue {
  state: ClusterState;
  dispatch: React.Dispatch<ClusterAction>;
}

const ClusterContext = createContext<ClusterContextValue | null>(null);

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(clusterReducer, initialState);
  return (
    <ClusterContext.Provider value={{ state, dispatch }}>
      {children}
    </ClusterContext.Provider>
  );
}

export function useCluster(): ClusterContextValue {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error('useCluster must be used within ClusterProvider');
  return ctx;
}
