export type Layer = 'training' | 'model' | 'rag' | 'orchestration' | 'runtime'
export type Constituent =
  | 'data_governance'
  | 'model_security'
  | 'output_integrity'
  | 'human_oversight'
  | 'ethics_fairness'
export type EvidenceType = 'eoe' | 'poe'
export type MaturityTier = 'tier1' | 'tier2' | 'tier3'
export type RetestFrequency = 'monthly' | 'quarterly' | 'annually'

export interface ControlItem {
  id: string
  constituent: Constituent
  layer: Layer
  label: string
  evidenceType: EvidenceType
  maturityTier: MaturityTier
  requiresFile: boolean
  requiresDate: boolean
  retestFrequency: RetestFrequency
  thesisRef: string
  owaspRef?: string
}

export const COMPASS_CONTROLS: ControlItem[] = [
  // DATA GOVERNANCE — TRAINING
  {
    id: 'DG-TR-01', constituent: 'data_governance', layer: 'training',
    label: 'Training Data Provenance & Lineage Policy',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 10 / ISO 42001 §6.1'
  },
  {
    id: 'DG-TR-02', constituent: 'data_governance', layer: 'training',
    label: 'Training Dataset Bias & Representativeness Audit',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: true, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 10(2)(f) / NIST AI RMF BIAS-1'
  },
  {
    id: 'DG-TR-03', constituent: 'data_governance', layer: 'training',
    label: 'Data Minimisation & Purpose Limitation Procedure',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'GDPR Art. 5(1)(b)(c) / EU AI Act Art. 10(3)'
  },
  {
    id: 'DG-TR-04', constituent: 'data_governance', layer: 'training',
    label: 'Special Category Data Handling Evidence',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'annually',
    thesisRef: 'GDPR Art. 9 / EU AI Act Art. 10(5)'
  },

  // DATA GOVERNANCE — MODEL
  {
    id: 'DG-MO-01', constituent: 'data_governance', layer: 'model',
    label: 'Model Card & AI System Factsheet',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 11 / ISO 42001 §8.4'
  },
  {
    id: 'DG-MO-02', constituent: 'data_governance', layer: 'model',
    label: 'AI Software Bill of Materials (SBoM)',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU CRA Art. 13 / NIST SSDF'
  },

  // DATA GOVERNANCE — RAG
  {
    id: 'DG-RA-01', constituent: 'data_governance', layer: 'rag',
    label: 'RAG Knowledge Base Data Governance Policy',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 10 / OWASP AI-DSPM',
    owaspRef: '§2.2'
  },
  {
    id: 'DG-RA-02', constituent: 'data_governance', layer: 'rag',
    label: 'Retrieval Source Accuracy & Freshness Metrics',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'monthly',
    thesisRef: 'NIST AI RMF MEASURE 2.5',
    owaspRef: '§3.6'
  },

  // DATA GOVERNANCE — ORCHESTRATION
  {
    id: 'DG-OR-01', constituent: 'data_governance', layer: 'orchestration',
    label: 'Agent Tool Access Policy & Permissions Register',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'quarterly',
    thesisRef: 'EU AI Act Art. 9 / OWASP LLM08',
    owaspRef: '§2.1'
  },

  // DATA GOVERNANCE — RUNTIME
  {
    id: 'DG-RT-01', constituent: 'data_governance', layer: 'runtime',
    label: 'Inference Data Logging & Retention Policy',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 12 / GDPR Art. 30'
  },
  {
    id: 'DG-RT-02', constituent: 'data_governance', layer: 'runtime',
    label: 'PII Detection & Redaction in Outputs Log',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'monthly',
    thesisRef: 'GDPR Art. 25 / EU AI Act Art. 10',
    owaspRef: '§3.2'
  },

  // MODEL SECURITY — TRAINING
  {
    id: 'MS-TR-01', constituent: 'model_security', layer: 'training',
    label: 'Training Pipeline Access Controls & Audit Log',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'IEC 62443 §3.3 / EU CRA Art. 13',
    owaspRef: '§2.3'
  },
  {
    id: 'MS-TR-02', constituent: 'model_security', layer: 'training',
    label: 'Data Poisoning Detection Test Results',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'NIST AI RMF MANAGE 2.2',
    owaspRef: '§2.3'
  },

  // MODEL SECURITY — MODEL
  {
    id: 'MS-MO-01', constituent: 'model_security', layer: 'model',
    label: 'Model Weight Access Controls & Encryption',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU CRA Art. 13 / NIST SP 800-53',
    owaspRef: '§2.5'
  },
  {
    id: 'MS-MO-02', constituent: 'model_security', layer: 'model',
    label: 'Adversarial Robustness Benchmark Results',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'EU AI Act Art. 15 / NIST AI RMF MEASURE 2.6'
  },
  {
    id: 'MS-MO-03', constituent: 'model_security', layer: 'model',
    label: 'Model Versioning & Rollback Procedure',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'ISO 42001 §8.4 / EU AI Act Art. 9'
  },

  // MODEL SECURITY — RAG
  {
    id: 'MS-RA-01', constituent: 'model_security', layer: 'rag',
    label: 'RAG Injection Attack Test Results',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'OWASP LLM01',
    owaspRef: '§1.1'
  },

  // MODEL SECURITY — ORCHESTRATION
  {
    id: 'MS-OR-01', constituent: 'model_security', layer: 'orchestration',
    label: 'MCP Server Security Policy & Configuration',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'quarterly',
    thesisRef: 'OWASP LLM08 / AIR R315',
    owaspRef: '§2.1'
  },
  {
    id: 'MS-OR-02', constituent: 'model_security', layer: 'orchestration',
    label: 'Tool Call Anomaly Detection Log',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'monthly',
    thesisRef: 'OWASP LLM08 / AIR R315',
    owaspRef: '§2.1'
  },

  // MODEL SECURITY — RUNTIME
  {
    id: 'MS-RT-01', constituent: 'model_security', layer: 'runtime',
    label: 'Rate Limiting & Query Monitoring Configuration',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'quarterly',
    thesisRef: 'OWASP LLM10 / AIR R316',
    owaspRef: '§2.5'
  },
  {
    id: 'MS-RT-02', constituent: 'model_security', layer: 'runtime',
    label: 'Penetration Test Report (AI System Scope)',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 15 / EU CRA'
  },

  // OUTPUT INTEGRITY — TRAINING
  {
    id: 'OI-TR-01', constituent: 'output_integrity', layer: 'training',
    label: 'Training Objective Alignment Documentation',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 9 / ISO 42001 §6.2'
  },

  // OUTPUT INTEGRITY — MODEL
  {
    id: 'OI-MO-01', constituent: 'output_integrity', layer: 'model',
    label: 'Hallucination Benchmark Test Results',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'NIST AI RMF MEASURE 2.5 / AIR R326',
    owaspRef: '§3.6'
  },
  {
    id: 'OI-MO-02', constituent: 'output_integrity', layer: 'model',
    label: 'Output Watermarking / Content Provenance Evidence',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'EU AI Act Art. 50 / C2PA Standard'
  },

  // OUTPUT INTEGRITY — RAG
  {
    id: 'OI-RA-01', constituent: 'output_integrity', layer: 'rag',
    label: 'Grounding Accuracy Measurement Log',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'monthly',
    thesisRef: 'NIST AI RMF MEASURE 2.5',
    owaspRef: '§3.6'
  },

  // OUTPUT INTEGRITY — ORCHESTRATION
  {
    id: 'OI-OR-01', constituent: 'output_integrity', layer: 'orchestration',
    label: 'Prompt Injection Defence Test Results',
    evidenceType: 'poe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'OWASP LLM01 / AIR R317',
    owaspRef: '§1.1'
  },

  // OUTPUT INTEGRITY — RUNTIME
  {
    id: 'OI-RT-01', constituent: 'output_integrity', layer: 'runtime',
    label: 'Content Moderation & Output Filtering Configuration',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'quarterly',
    thesisRef: 'EU AI Act Art. 9 / NIST AI RMF MANAGE 1'
  },
  {
    id: 'OI-RT-02', constituent: 'output_integrity', layer: 'runtime',
    label: 'AI Disclosure Notice to End Users',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 50'
  },

  // HUMAN OVERSIGHT — TRAINING
  {
    id: 'HO-TR-01', constituent: 'human_oversight', layer: 'training',
    label: 'Human Review of Training Data Sampling Procedure',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 10 / ISO 42001 §8.3'
  },

  // HUMAN OVERSIGHT — MODEL
  {
    id: 'HO-MO-01', constituent: 'human_oversight', layer: 'model',
    label: 'Model Evaluation & Sign-off Process',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 14 / ISO 42001 §8.4'
  },
  {
    id: 'HO-MO-02', constituent: 'human_oversight', layer: 'model',
    label: 'Model Override & Shutdown Capability Evidence',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'EU AI Act Art. 14(4)'
  },

  // HUMAN OVERSIGHT — ORCHESTRATION
  {
    id: 'HO-OR-01', constituent: 'human_oversight', layer: 'orchestration',
    label: 'Human-in-the-Loop Workflow Documentation',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 14 / NIST AI RMF GOVERN 3'
  },

  // HUMAN OVERSIGHT — RUNTIME
  {
    id: 'HO-RT-01', constituent: 'human_oversight', layer: 'runtime',
    label: 'Escalation & Human Review Trigger Log',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'monthly',
    thesisRef: 'EU AI Act Art. 14 / ISO 42001 §8.7'
  },
  {
    id: 'HO-RT-02', constituent: 'human_oversight', layer: 'runtime',
    label: 'User Appeals & Redress Mechanism',
    evidenceType: 'eoe', maturityTier: 'tier1',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 14(5) / Charter of Fundamental Rights Art. 47'
  },

  // ETHICS FAIRNESS — TRAINING
  {
    id: 'EF-TR-01', constituent: 'ethics_fairness', layer: 'training',
    label: 'Fairness Metrics & Bias Testing Report',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: true, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 10(2)(f) / AIR R346'
  },

  // ETHICS FAIRNESS — MODEL
  {
    id: 'EF-MO-01', constituent: 'ethics_fairness', layer: 'model',
    label: 'Fundamental Rights Impact Assessment',
    evidenceType: 'eoe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 9(9) / Charter of Fundamental Rights / AIR R346'
  },
  {
    id: 'EF-MO-02', constituent: 'ethics_fairness', layer: 'model',
    label: 'Explainability & Interpretability Documentation',
    evidenceType: 'eoe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 13 / GDPR Art. 22'
  },

  // ETHICS FAIRNESS — RAG
  {
    id: 'EF-RA-01', constituent: 'ethics_fairness', layer: 'rag',
    label: 'Knowledge Base Diversity & Representativeness Audit',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: true, requiresDate: true, retestFrequency: 'annually',
    thesisRef: 'EU AI Act Art. 10 / AIR R330'
  },

  // ETHICS FAIRNESS — RUNTIME
  {
    id: 'EF-RT-01', constituent: 'ethics_fairness', layer: 'runtime',
    label: 'Discrimination Complaint & Monitoring Log',
    evidenceType: 'poe', maturityTier: 'tier2',
    requiresFile: false, requiresDate: true, retestFrequency: 'quarterly',
    thesisRef: 'EU AI Act Art. 9 / AIR R346'
  },
  {
    id: 'EF-RT-02', constituent: 'ethics_fairness', layer: 'runtime',
    label: 'AI Ethics Board / Review Committee Evidence',
    evidenceType: 'eoe', maturityTier: 'tier3',
    requiresFile: true, requiresDate: false, retestFrequency: 'annually',
    thesisRef: 'ISO 42001 §5.1 / EU AI Act Art. 9'
  }
]

export const CONSTITUENT_LABELS: Record<Constituent, string> = {
  data_governance: 'Data Governance',
  model_security: 'Model Security',
  output_integrity: 'Output & Content Integrity',
  human_oversight: 'Operational & Human Oversight',
  ethics_fairness: 'Ethics, Rights & Fairness'
}

export const LAYER_LABELS: Record<Layer, string> = {
  training: 'Training',
  model: 'Model',
  rag: 'RAG',
  orchestration: 'Orchestration',
  runtime: 'Runtime'
}
