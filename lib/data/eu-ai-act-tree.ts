export type RiskTier = 'unacceptable' | 'high' | 'limited' | 'minimal'

export interface RiskClassification {
  tier: RiskTier
  label: string
  article: string
  description: string
  obligations: string[]
}

const PROHIBITED_PURPOSES = [
  'subliminal manipulation', 'social scoring', 'real-time facial recognition',
  'emotion recognition workplace', 'biometric categorisation', 'predictive policing'
]

const HIGH_RISK_SECTORS = [
  'banking', 'finance', 'bfsi', 'insurance',
  'healthcare', 'medical', 'clinical',
  'public sector', 'government', 'law enforcement', 'border control',
  'hr', 'recruitment', 'employment',
  'education', 'vocational training',
  'critical infrastructure', 'energy', 'water', 'transport'
]

const LIMITED_RISK_PURPOSES = [
  'chatbot', 'content generation', 'synthetic media', 'deepfake',
  'image generation', 'text generation', 'summarisation'
]

export function classifyRisk(purpose: string, sector: string): RiskClassification {
  const combined = `${purpose} ${sector}`.toLowerCase()

  if (PROHIBITED_PURPOSES.some(p => combined.includes(p))) {
    return {
      tier: 'unacceptable',
      label: 'Unacceptable Risk',
      article: 'Art. 5',
      description: 'This AI system is prohibited under the EU AI Act.',
      obligations: [
        'System must not be placed on the market',
        'System must not be put into service',
        'Immediate cessation of any existing deployment'
      ]
    }
  }

  if (HIGH_RISK_SECTORS.some(s => combined.includes(s))) {
    return {
      tier: 'high',
      label: 'High Risk',
      article: 'Art. 6 / Annex III',
      description: 'This AI system is classified as high-risk and requires full compliance under Chapter III.',
      obligations: [
        'Conformity assessment (Art. 43)',
        'Technical documentation (Art. 11)',
        'Risk management system (Art. 9)',
        'Data governance (Art. 10)',
        'Transparency & logging (Art. 12)',
        'Human oversight measures (Art. 14)',
        'Accuracy, robustness & cybersecurity (Art. 15)',
        'CE marking + EU Declaration of Conformity',
        'Registration in EU database (Art. 71)'
      ]
    }
  }

  if (LIMITED_RISK_PURPOSES.some(p => combined.includes(p))) {
    return {
      tier: 'limited',
      label: 'Limited Risk',
      article: 'Art. 50',
      description: 'This AI system has limited risk and is subject to transparency obligations.',
      obligations: [
        'Disclose AI-generated content to users (Art. 50)',
        'Label synthetic media / deepfakes',
        'Notify users when interacting with a chatbot'
      ]
    }
  }

  return {
    tier: 'minimal',
    label: 'Minimal Risk',
    article: 'Art. 69',
    description: 'This AI system presents minimal risk. Voluntary codes of conduct are encouraged.',
    obligations: [
      'Voluntary adherence to codes of conduct (Art. 69)',
      'Best practice alignment with EU AI Act principles'
    ]
  }
}
