import { useDashboard } from '@/context/DashboardContext';
import { DISEASE_DATASETS } from '@/data/diseaseDatasets';
import type { DiseaseDataset } from '@/types';

/**
 * Returns the full dataset for the currently-selected disease type.
 * Components should use this instead of directly importing mockCountries,
 * mockNews, etc., so they automatically respond to disease switches.
 */
export function useCurrentDiseaseData(): DiseaseDataset {
  const { state } = useDashboard();
  return DISEASE_DATASETS[state.currentDisease];
}
