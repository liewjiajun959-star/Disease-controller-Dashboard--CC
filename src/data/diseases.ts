import type { DiseaseConfig, DiseaseType } from '@/types';

export const DISEASE_CONFIGS: Record<DiseaseType, DiseaseConfig> = {
  hantavirus: {
    id: 'hantavirus',
    label: 'Hantavirus',
    shortLabel: 'HANTA',
    icon: '🐭',
    accentColor: '#ef4444',
    globeGlowColor: [0.1, 0.3, 0.8],
    globeMarkerColor: [1, 0.2, 0.2],
  },
  mpox: {
    id: 'mpox',
    label: 'Mpox',
    shortLabel: 'MPOX',
    icon: '⬡',
    accentColor: '#f97316',
    globeGlowColor: [0.4, 0.15, 0.05],
    globeMarkerColor: [1, 0.5, 0.1],
  },
  covid19: {
    id: 'covid19',
    label: 'COVID-19',
    shortLabel: 'COVID',
    icon: '◎',
    accentColor: '#06b6d4',
    globeGlowColor: [0.05, 0.3, 0.4],
    globeMarkerColor: [0.1, 0.8, 1],
  },
  ebola: {
    id: 'ebola',
    label: 'Ebola',
    shortLabel: 'EBOLA',
    icon: '⚠',
    accentColor: '#dc2626',
    globeGlowColor: [0.3, 0.05, 0.05],
    globeMarkerColor: [0.9, 0.1, 0.05],
  },
};

export const defaultDisease: DiseaseType = 'hantavirus';

export const DISEASE_ORDER: DiseaseType[] = ['hantavirus', 'mpox', 'covid19', 'ebola'];
