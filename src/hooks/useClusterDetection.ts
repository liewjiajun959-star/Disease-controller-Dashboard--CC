'use client';

import { useCallback } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { geocodeAddress } from '@/services/geocodingService';
import { detectNearbyClusters } from '@/services/clusterService';
import {
  validateAddressInput,
  validateDistanceInput,
  isPromptInjectionLikeInput,
  enforceSearchRateLimit,
  REJECTION_MESSAGE,
} from '@/utils/inputValidation';
import { useUsageLogger } from './useUsageLogger';
import { getCoordsRegionBucket } from '@/utils/distanceUtils';

export function useClusterDetection() {
  const { dispatch } = useCluster();
  const { log } = useUsageLogger();

  const search = useCallback(
    async (rawInput: string, radiusKm: number) => {
      // Step 1: Validate and sanitize input
      const addressValidation = validateAddressInput(rawInput);
      if (!addressValidation.valid) {
        log('security_rejection', 'address_search', 'rejected', {
          rejectionReason: 'validation_failed',
          inputLength: rawInput.length,
        });
        dispatch({ type: 'SEARCH_REJECTED', payload: { message: REJECTION_MESSAGE } });
        return;
      }

      // Step 2: Check for injection attempts (belt and suspenders)
      if (isPromptInjectionLikeInput(rawInput)) {
        log('security_rejection', 'address_search', 'rejected', {
          rejectionReason: 'prompt_injection_detected',
          inputLength: rawInput.length,
        });
        dispatch({ type: 'SEARCH_REJECTED', payload: { message: REJECTION_MESSAGE } });
        return;
      }

      // Step 3: Validate distance
      const distanceValidation = validateDistanceInput(radiusKm);
      if (!distanceValidation.valid) {
        dispatch({ type: 'SEARCH_REJECTED', payload: { message: distanceValidation.error ?? 'Invalid distance.' } });
        return;
      }

      // Step 4: Rate limit
      const rateLimit = enforceSearchRateLimit();
      if (!rateLimit.allowed) {
        log('radius_search_rejected', 'address_search', 'rejected', {
          rejectionReason: rateLimit.reason ?? 'rate_limit',
        });
        dispatch({ type: 'RATE_LIMITED' });
        return;
      }

      // Step 5: Search
      dispatch({ type: 'SEARCH_START' });
      log('radius_search_attempted', 'address_search', 'info', { radiusKm, unit: 'km' });

      // Step 6: Geocode (mock — never sends raw input to external APIs)
      const coords = await geocodeAddress(rawInput);
      if (!coords) {
        log('radius_search_rejected', 'address_search', 'rejected', { rejectionReason: 'geocode_failed' });
        dispatch({ type: 'GEOCODE_FAILED' });
        return;
      }

      // Step 7: Detect clusters
      const results = await detectNearbyClusters(coords, radiusKm);

      if (results.length === 0) {
        log('radius_search_succeeded', 'address_search', 'success', {
          radiusKm,
          resultCount: 0,
          regionBucket: getCoordsRegionBucket(coords),
        });
        dispatch({ type: 'NO_RESULTS', payload: { userMarker: coords, radiusKm } });
      } else {
        log('radius_search_succeeded', 'address_search', 'success', {
          radiusKm,
          resultCount: results.length,
          regionBucket: getCoordsRegionBucket(coords),
        });
        log('nearby_cluster_detected', 'address_search', 'success', {
          resultCount: results.length,
        });
        dispatch({ type: 'SEARCH_SUCCESS', payload: { results, userMarker: coords, radiusKm } });
      }
    },
    [dispatch, log]
  );

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, [dispatch]);

  return { search, clear };
}
