import { mockCountries } from '@/data/countries';
import { mockAnnouncements } from '@/data/announcements';
import { mockBreakthroughs } from '@/data/breakthroughs';
import type { CountryOutbreak, HealthAnnouncement, Breakthrough } from '@/types';

export async function fetchCountries(): Promise<CountryOutbreak[]> {
  return Promise.resolve(mockCountries);
}

export async function fetchHealthAnnouncements(): Promise<HealthAnnouncement[]> {
  return Promise.resolve(mockAnnouncements);
}

export async function fetchBreakthroughs(): Promise<Breakthrough[]> {
  return Promise.resolve(mockBreakthroughs);
}

export function getCountryByCode(code: string): CountryOutbreak | undefined {
  return mockCountries.find((c) => c.code === code);
}
