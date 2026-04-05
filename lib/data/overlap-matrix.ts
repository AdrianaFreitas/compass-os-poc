export type Jurisdiction = 'eu' | 'us' | 'cn'

export interface UniversalRisk {
  id: string
  name: string
  description: string
  eu: string
  us: string
  cn: string
  artifactReuse: string[]
}

export interface DivergentControl {
  id: string
  name: string
  jurisdictions: Jurisdiction[]
  note: string
}

export const UNIVERSAL_RISKS: UniversalRisk[] = [
  {
    id: 'privacy',
    name: 'Privacy',
    description: 'Protection of personal data and right to privacy',
    eu: 'GDPR + AI Act Art. 10',
    us: 'NIST AI RMF GOVERN 1.6',
    cn: 'PIPL + TC260',
    artifactReuse: ['GDPR DPIA', 'Data Governance Artifacts']
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Cybersecurity and robustness of AI systems',
    eu: 'AI Act Art. 15 + CRA',
    us: 'NIST CSF + EO 14110',
    cn: 'MLSA + TC260',
    artifactReuse: ['Security Robustness Evidence', 'Penetration Test Reports']
  },
  {
    id: 'non-discrimination',
    name: 'Non-discrimination',
    description: 'Fairness and prevention of discriminatory outputs',
    eu: 'AI Act Art. 10(2)(f)',
    us: 'NIST AI RMF BIAS',
    cn: 'AIGCS Art. 4',
    artifactReuse: ['Bias Audit Reports', 'Fairness Testing Evidence']
  },
  {
    id: 'transparency',
    name: 'Transparency',
    description: 'Explainability and disclosure of AI involvement',
    eu: 'AI Act Art. 13 / Art. 50',
    us: 'NIST AI RMF GOVERN 4',
    cn: 'AIGCS Art. 7',
    artifactReuse: ['Explainability Documentation', 'Traceable Decision Log']
  },
  {
    id: 'human-oversight',
    name: 'Human Oversight',
    description: 'Meaningful human control over AI decisions',
    eu: 'AI Act Art. 14',
    us: 'NIST AI RMF MANAGE 2',
    cn: 'AIGCS Art. 5',
    artifactReuse: ['Human Review Procedures', 'Override Mechanism Evidence']
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Prevention of harm to persons and the environment',
    eu: 'AI Act Art. 9',
    us: 'NIST AI RMF MANAGE 1',
    cn: 'MLSA Art. 6',
    artifactReuse: ['Risk Management System', 'Safety Testing Reports']
  },
  {
    id: 'accountability',
    name: 'Accountability',
    description: 'Clear responsibility and liability for AI outcomes',
    eu: 'AI Act Art. 16–29',
    us: 'NIST AI RMF GOVERN 6',
    cn: 'AIGCS Art. 9',
    artifactReuse: ['EU AI Act Technical Dossier', 'Responsibility Assignment Matrix']
  },
  {
    id: 'fraud-deception',
    name: 'Fraud / Deception',
    description: 'Prevention of AI-enabled fraud and deceptive practices',
    eu: 'AI Act Art. 5(1)(b)',
    us: 'FTC Guidelines + EO 14110',
    cn: 'AIGCS Art. 4(4)',
    artifactReuse: ['Content Authenticity Evidence', 'Watermarking Logs']
  },
  {
    id: 'misrepresentation',
    name: 'Misrepresentation',
    description: 'Accuracy of information and prevention of confabulation',
    eu: 'AI Act Art. 50(4)',
    us: 'NIST AI RMF MEASURE 2.5',
    cn: 'AIGCS Art. 8',
    artifactReuse: ['Hallucination Testing Reports', 'Output Accuracy Metrics']
  },
  {
    id: 'sensitive-information',
    name: 'Sensitive Information',
    description: 'Handling of special categories of personal data',
    eu: 'GDPR Art. 9 + AI Act Art. 10',
    us: 'NIST SP 800-53',
    cn: 'PIPL Art. 28',
    artifactReuse: ['GDPR DPIA', 'Data Classification Policy']
  }
]

export const DIVERGENT_CONTROLS: DivergentControl[] = [
  {
    id: 'labour-rights',
    name: 'Labour Rights',
    jurisdictions: ['eu', 'cn'],
    note: 'EU AI Act Annex III §4 (employment) + CN Labour Law. Not addressed in US federal AI policy.'
  },
  {
    id: 'political-manipulation',
    name: 'Political Manipulation',
    jurisdictions: ['eu', 'us'],
    note: 'EU AI Act Art. 5(1)(a) + US EO 14110 election integrity. CN has partial controls under AIGCS but with different framing.'
  },
  {
    id: 'social-order',
    name: 'Social Order / Stability',
    jurisdictions: ['cn'],
    note: 'China-specific requirement under AIGCS Art. 4(1) — AI must not subvert state power or social stability. No EU/US equivalent.'
  },
  {
    id: 'flops-threshold',
    name: 'FLOPs Threshold (GPAI)',
    jurisdictions: ['eu'],
    note: 'EU AI Act Art. 51 — GPAI models above 10²⁵ FLOPs require systemic risk assessment. EU-only requirement.'
  }
]

export const ARTIFACT_REUSE_MAPPINGS: Record<string, string[]> = {
  'EU AI Act Technical Dossier': ['EU AI Act Art. 11', 'NIST AI RMF', 'ISO/IEC 42001'],
  'Traceable Decision Log': ['EU Art. 12', 'EU Art. 50', 'China TC260'],
  'Security Robustness Evidence': ['EU CRA', 'US EO 14110', 'NIST CSF'],
  'Data Governance Artifacts': ['GDPR DPIA', 'OWASP AI-DSPM', 'CN PIPL']
}
