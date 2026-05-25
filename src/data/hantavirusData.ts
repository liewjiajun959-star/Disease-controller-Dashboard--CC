// Re-exports existing hantavirus mock data as a unified dataset entry point.
// This keeps the DISEASE_DATASETS registry clean and avoids duplicating data.

export { mockCountries as hantavirusCountries } from './countries';
export { mockNews as hantavirusNews } from './news';
export { mockClusters as hantavirusClusters } from './clusters';
export { mockPatients as hantavirusPatients } from './patients';
export { mockBreakthroughs as hantavirusBreakthroughs } from './breakthroughs';
export { mockAnnouncements as hantavirusAnnouncements } from './announcements';
