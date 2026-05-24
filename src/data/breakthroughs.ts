import type { Breakthrough } from '@/types';

export const mockBreakthroughs: Breakthrough[] = [
  {
    id: 'b-001',
    title: 'Novel Hantavirus Strain in Thailand: Preliminary Genomic Sequencing Results',
    source: 'Thailand Department of Medical Sciences',
    summary:
      'Preliminary genomic analysis of the Bangkok strain suggests it is a previously uncharacterized orthohantavirus with approximately 78% similarity to Seoul Virus. Full phylogenetic analysis is ongoing. Results have been submitted to GISAID. This is preliminary data — not peer-reviewed.',
    confidenceLevel: 'preliminary',
    publishedAt: '2025-05-23T10:00:00Z',
    relatedRegion: 'Thailand',
    type: 'surveillance',
  },
  {
    id: 'b-002',
    title: 'Rapid Diagnostic Test for Hantavirus IgM Achieves 94% Sensitivity in Field Trials',
    source: 'Fiocruz / Brazilian Ministry of Health',
    summary:
      'A newly validated lateral flow assay for Hantavirus IgM detection demonstrated 94% sensitivity and 97% specificity in a multi-site field trial across Brazil. The test requires no laboratory infrastructure and provides results in 15 minutes. Regulatory review is in progress. These are preliminary results and not yet approved for clinical use.',
    confidenceLevel: 'medium',
    publishedAt: '2025-05-19T08:00:00Z',
    relatedRegion: 'Brazil',
    type: 'diagnostic',
  },
  {
    id: 'b-003',
    title: 'Candidate mRNA Vaccine for Andes Virus Shows Promise in Animal Models',
    source: 'Universidad de Chile / FONDECYT',
    summary:
      'A candidate mRNA-based vaccine targeting the Andes Virus glycoprotein demonstrated robust neutralizing antibody responses in Syrian golden hamster models. Hamsters vaccinated 28 days prior to challenge showed 100% survival vs. 20% in controls. Human trials have not commenced. These results are from preclinical animal studies only.',
    confidenceLevel: 'preliminary',
    publishedAt: '2025-05-15T06:00:00Z',
    relatedRegion: 'South America',
    type: 'vaccine',
  },
  {
    id: 'b-004',
    title: 'Environmental DNA Monitoring Detects Hantavirus in Rodent Populations Before Human Cases',
    source: 'Helmholtz Centre for Infection Research (HZI)',
    summary:
      'A surveillance study in Germany demonstrated that environmental DNA (eDNA) sampling from water sources can detect Puumala Virus in bank vole populations approximately 4-6 weeks before human cases emerge. This could enable earlier public health warnings. The method is being piloted in three European countries.',
    confidenceLevel: 'medium',
    publishedAt: '2025-05-10T09:00:00Z',
    relatedRegion: 'Europe',
    type: 'surveillance',
  },
  {
    id: 'b-005',
    title: 'Ribavirin Combination Therapy Shows Improved Outcomes in Hantavirus Cardiopulmonary Syndrome',
    source: 'University of New Mexico Health Sciences',
    summary:
      'A retrospective analysis of 48 HCPS cases treated with ribavirin plus supportive care showed reduced ICU duration compared to historical controls. No randomized controlled trial data available. Findings presented at the 2025 American Society for Microbiology meeting. Clinical application requires physician evaluation — this is observational data only.',
    confidenceLevel: 'preliminary',
    publishedAt: '2025-05-06T14:00:00Z',
    relatedRegion: 'United States',
    type: 'treatment',
  },
  {
    id: 'b-006',
    title: 'Climate Change Linked to Expanding Hantavirus Geographic Range — Epidemiological Modelling',
    source: 'Stockholm Environment Institute',
    summary:
      'Epidemiological modelling incorporating climate projections suggests that warming temperatures may expand the geographic range of key Hantavirus reservoir rodent species by 15-30% by 2050 in Central Asia and Southeast Asia. Results are based on modelling assumptions and carry significant uncertainty. Published in a peer-reviewed environmental health journal.',
    confidenceLevel: 'medium',
    publishedAt: '2025-05-01T07:00:00Z',
    relatedRegion: 'Global',
    type: 'epidemiology',
  },
];
