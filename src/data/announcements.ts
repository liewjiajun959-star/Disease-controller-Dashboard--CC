import type { HealthAnnouncement } from '@/types';

export const mockAnnouncements: HealthAnnouncement[] = [
  {
    id: 'a-001',
    title: 'Rodent Exposure Prevention: Key Steps for At-Risk Communities',
    source: 'WHO',
    country: null,
    summary:
      'Avoid direct contact with rodents or their droppings. Seal gaps around doors, windows, and pipes. Store food in rodent-proof containers. Use snap traps rather than disturbing nests. If cleaning rodent-contaminated areas, wear N95 mask and latex gloves, use bleach solution, and ventilate the space before entering.',
    recommendationLevel: 'advisory',
    publishedAt: '2025-05-20T08:00:00Z',
    tags: ['prevention', 'rodent_control', 'general_public'],
  },
  {
    id: 'a-002',
    title: 'Safe Cleanup of Rodent-Contaminated Spaces',
    source: 'CDC',
    country: 'United States',
    summary:
      'Do not vacuum or sweep rodent droppings — this can aerosolize the virus. Wet materials with a bleach-and-water solution (1.5 cups bleach per gallon of water) before wiping. Double-bag all waste. Wear rubber, latex, or vinyl gloves. Dispose of gloves after use. Wash hands thoroughly with soap and water.',
    recommendationLevel: 'advisory',
    publishedAt: '2025-05-18T12:00:00Z',
    tags: ['cleanup', 'safety', 'household'],
  },
  {
    id: 'a-003',
    title: 'Recognize Hantavirus Symptoms — Seek Care Early',
    source: 'PAHO',
    country: null,
    summary:
      'Early symptoms include fever, fatigue, and muscle aches — especially in large muscle groups. These may be followed by headaches, dizziness, chills, and abdominal problems. If you have had potential rodent exposure and develop these symptoms, seek medical attention immediately. Do not wait for severe respiratory symptoms. This information is general public health guidance — always consult a qualified healthcare professional.',
    recommendationLevel: 'urgent',
    publishedAt: '2025-05-22T09:00:00Z',
    tags: ['symptoms', 'early_detection', 'seek_care'],
  },
  {
    id: 'a-004',
    title: 'Travel Advisory: Awareness for Visitors to Thailand',
    source: 'ECDC',
    country: 'Thailand',
    summary:
      'Travellers to rural regions of Thailand — particularly Udon Thani and Chiang Rai — should avoid contact with wild rodents, avoid sleeping in rodent-infested areas, and practise careful food storage hygiene. No travel ban is in place. Risk for typical tourists remains low. Verify current advisories with your national health authority before travel.',
    recommendationLevel: 'advisory',
    publishedAt: '2025-05-24T07:00:00Z',
    tags: ['travel', 'thailand', 'prevention'],
  },
  {
    id: 'a-005',
    title: 'General Public Health Guidance: Hantavirus in South America',
    source: 'PAHO',
    country: null,
    summary:
      'Communities in rural areas of Bolivia, Argentina, and Chile should exercise heightened awareness during harvest and camping seasons. Keep living areas clean and sealed. Report unusual rodent die-offs to local health authorities. Community health workers are available in affected provinces. This is general public health information — not personal medical advice.',
    recommendationLevel: 'informational',
    publishedAt: '2025-05-21T14:00:00Z',
    tags: ['south_america', 'community', 'general_guidance'],
  },
];
