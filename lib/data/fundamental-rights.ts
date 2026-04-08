// EU Charter of Fundamental Rights — FRIA reference data
// Source: ECNL/DIHR Fundamental Rights Impact Assessment Guide (Dec 2025)

export const ABSOLUTE_RIGHTS = [
  'Human dignity (Art. 1)',
  'Prohibition of torture and inhuman treatment (Art. 4)',
  'Prohibition of slavery and forced labour (Art. 5)',
  'Legality and proportionality of offences (Art. 49)',
]

export const FUNDAMENTAL_RIGHTS: {
  id: string
  article: string
  name: string
  category: 'dignity' | 'freedoms' | 'equality' | 'solidarity' | 'citizens' | 'justice'
  absolute: boolean
  aiRelevance: string
}[] = [
  {
    id: 'fr_dignity',
    article: 'Art. 1',
    name: 'Human dignity',
    category: 'dignity',
    absolute: true,
    aiRelevance: 'AI systems must not degrade, humiliate, or instrumentalise persons',
  },
  {
    id: 'fr_life',
    article: 'Art. 2',
    name: 'Right to life',
    category: 'dignity',
    absolute: false,
    aiRelevance: 'Safety-critical AI in healthcare, autonomous systems, and law enforcement',
  },
  {
    id: 'fr_integrity',
    article: 'Art. 3',
    name: 'Right to physical and mental integrity',
    category: 'dignity',
    absolute: false,
    aiRelevance: 'AI-assisted medical decisions, mental health monitoring, biometric systems',
  },
  {
    id: 'fr_torture',
    article: 'Art. 4',
    name: 'Prohibition of torture and inhuman treatment',
    category: 'dignity',
    absolute: true,
    aiRelevance: 'AI used in detention, interrogation assistance, or punitive automated decisions',
  },
  {
    id: 'fr_slavery',
    article: 'Art. 5',
    name: 'Prohibition of slavery and forced labour',
    category: 'dignity',
    absolute: true,
    aiRelevance: 'AI-enabled labour exploitation, coercive gig-economy scoring',
  },
  {
    id: 'fr_liberty',
    article: 'Art. 6',
    name: 'Right to liberty and security',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Predictive policing, pre-trial risk assessment, detention decision support',
  },
  {
    id: 'fr_private_life',
    article: 'Art. 7',
    name: 'Respect for private and family life',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Surveillance AI, household profiling, family reunification algorithms',
  },
  {
    id: 'fr_data',
    article: 'Art. 8',
    name: 'Protection of personal data',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Training data, inference outputs, profiling, GDPR Art. 22 automated decisions',
  },
  {
    id: 'fr_marriage',
    article: 'Art. 9',
    name: 'Right to marry and found a family',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Immigration AI, family reunification scoring, social benefits systems',
  },
  {
    id: 'fr_thought',
    article: 'Art. 10',
    name: 'Freedom of thought, conscience, and religion',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Content moderation AI, belief-based profiling, sentiment detection',
  },
  {
    id: 'fr_expression',
    article: 'Art. 11',
    name: 'Freedom of expression and information',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Content moderation, deepfake detection, recommender systems, censorship tools',
  },
  {
    id: 'fr_assembly',
    article: 'Art. 12',
    name: 'Freedom of assembly and association',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Social network analysis, protest monitoring, union activity profiling',
  },
  {
    id: 'fr_arts',
    article: 'Art. 13',
    name: 'Freedom of the arts and sciences',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Generative AI copyright, AI-assisted research, academic integrity tools',
  },
  {
    id: 'fr_education',
    article: 'Art. 14',
    name: 'Right to education',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'AI tutoring systems, automated grading, student tracking, admissions scoring',
  },
  {
    id: 'fr_work',
    article: 'Art. 15',
    name: 'Freedom to choose an occupation and right to engage in work',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Automated CV screening, performance scoring, dismissal recommendation systems',
  },
  {
    id: 'fr_business',
    article: 'Art. 16',
    name: 'Freedom to conduct a business',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Credit scoring, AI-driven market access decisions, procurement automation',
  },
  {
    id: 'fr_property',
    article: 'Art. 17',
    name: 'Right to property',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'AI-based asset valuation, automated enforcement, intellectual property in AI outputs',
  },
  {
    id: 'fr_asylum',
    article: 'Art. 18',
    name: 'Right to asylum',
    category: 'freedoms',
    absolute: false,
    aiRelevance: 'Asylum claim scoring, border management AI, migration risk profiling',
  },
  {
    id: 'fr_equality',
    article: 'Art. 20',
    name: 'Equality before the law',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Algorithmic decision-making in justice, consistent application across populations',
  },
  {
    id: 'fr_discrimination',
    article: 'Art. 21',
    name: 'Non-discrimination',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Bias in training data, disparate impact, protected characteristic proxies',
  },
  {
    id: 'fr_cultural_diversity',
    article: 'Art. 22',
    name: 'Cultural, religious, and linguistic diversity',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Multilingual NLP fairness, cultural bias in generative AI, minority representation',
  },
  {
    id: 'fr_gender_equality',
    article: 'Art. 23',
    name: 'Equality between women and men',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Gender bias in recruitment AI, pay equity models, healthcare diagnostic disparity',
  },
  {
    id: 'fr_child',
    article: 'Art. 24',
    name: 'Rights of the child',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Child safeguarding AI, age verification, content recommendation to minors',
  },
  {
    id: 'fr_elderly',
    article: 'Art. 25',
    name: 'Rights of the elderly',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Elder care AI, social benefit scoring for older populations, accessibility',
  },
  {
    id: 'fr_disability',
    article: 'Art. 26',
    name: 'Integration of persons with disabilities',
    category: 'equality',
    absolute: false,
    aiRelevance: 'Accessibility of AI interfaces, disability scoring in benefit systems',
  },
  {
    id: 'fr_collective_bargaining',
    article: 'Art. 28',
    name: 'Right of collective bargaining and action',
    category: 'solidarity',
    absolute: false,
    aiRelevance: 'Workforce monitoring AI, union activity detection, labour relations platforms',
  },
  {
    id: 'fr_fair_conditions',
    article: 'Art. 31',
    name: 'Fair and just working conditions',
    category: 'solidarity',
    absolute: false,
    aiRelevance: 'Automated task allocation, performance surveillance, gig economy scoring',
  },
  {
    id: 'fr_social_security',
    article: 'Art. 34',
    name: 'Social security and social assistance',
    category: 'solidarity',
    absolute: false,
    aiRelevance: 'Benefits eligibility AI, fraud detection in welfare systems',
  },
  {
    id: 'fr_health',
    article: 'Art. 35',
    name: 'Right to health care',
    category: 'solidarity',
    absolute: false,
    aiRelevance: 'Clinical decision support, triage AI, diagnostic tools, resource allocation',
  },
  {
    id: 'fr_environment',
    article: 'Art. 37',
    name: 'Environmental protection',
    category: 'solidarity',
    absolute: false,
    aiRelevance: 'AI energy consumption, environmental monitoring systems, climate modelling',
  },
  {
    id: 'fr_good_admin',
    article: 'Art. 41',
    name: 'Right to good administration',
    category: 'citizens',
    absolute: false,
    aiRelevance: 'Public sector automated decisions, right to be heard, administrative AI transparency',
  },
  {
    id: 'fr_documents',
    article: 'Art. 42',
    name: 'Right of access to documents',
    category: 'citizens',
    absolute: false,
    aiRelevance: 'Explainability of AI-based public decisions, GDPR Art. 15 access rights',
  },
  {
    id: 'fr_effective_remedy',
    article: 'Art. 47',
    name: 'Right to an effective remedy and fair trial',
    category: 'justice',
    absolute: false,
    aiRelevance: 'Contestability of automated decisions, appeal mechanisms, AI in courts',
  },
  {
    id: 'fr_presumption',
    article: 'Art. 48',
    name: 'Presumption of innocence and rights of defence',
    category: 'justice',
    absolute: false,
    aiRelevance: 'Predictive policing, recidivism scoring, AI evidence in criminal proceedings',
  },
]

export const FRIA_REQUIRED_SECTORS = ['bfsi', 'public']

export function friaRecommended(sector: string, riskTier: string): boolean {
  // Match both stored full strings ('Banking & Finance (BFSI)', 'Public Sector & Government')
  // and legacy lowercase abbreviations
  const s = sector.toLowerCase()
  if (s.includes('bfsi') || s.includes('banking') || s.includes('public')) return true
  if (FRIA_REQUIRED_SECTORS.includes(sector)) return true
  if (riskTier === 'high_risk' || riskTier === 'high') return true
  return false
}
