import type { DiseaseType, DiseaseDataset } from '@/types';

import {
  hantavirusCountries,
  hantavirusNews,
  hantavirusClusters,
  hantavirusPatients,
  hantavirusBreakthroughs,
  hantavirusAnnouncements,
} from './hantavirusData';

import {
  mpoxCountries,
  mpoxNews,
  mpoxClusters,
  mpoxPatients,
  mpoxBreakthroughs,
  mpoxAnnouncements,
} from './mpoxData';

import {
  covid19Countries,
  covid19News,
  covid19Clusters,
  covid19Patients,
  covid19Breakthroughs,
  covid19Announcements,
} from './covid19Data';

import {
  ebolaCountries,
  ebolaNews,
  ebolaClusters,
  ebolaPatients,
  ebolaBreakthroughs,
  ebolaAnnouncements,
} from './ebolaData';

export const DISEASE_DATASETS: Record<DiseaseType, DiseaseDataset> = {
  hantavirus: {
    countries: hantavirusCountries,
    news: hantavirusNews,
    clusters: hantavirusClusters,
    patients: hantavirusPatients,
    breakthroughs: hantavirusBreakthroughs,
    announcements: hantavirusAnnouncements,
  },
  mpox: {
    countries: mpoxCountries,
    news: mpoxNews,
    clusters: mpoxClusters,
    patients: mpoxPatients,
    breakthroughs: mpoxBreakthroughs,
    announcements: mpoxAnnouncements,
  },
  covid19: {
    countries: covid19Countries,
    news: covid19News,
    clusters: covid19Clusters,
    patients: covid19Patients,
    breakthroughs: covid19Breakthroughs,
    announcements: covid19Announcements,
  },
  ebola: {
    countries: ebolaCountries,
    news: ebolaNews,
    clusters: ebolaClusters,
    patients: ebolaPatients,
    breakthroughs: ebolaBreakthroughs,
    announcements: ebolaAnnouncements,
  },
};
