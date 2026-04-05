export interface ThreatQuestion {
  id: string
  question: string
  owaspRef: string
  airRef: string
  category: string
  guidance: string
}

export const OWASP_THREAT_QUESTIONS: ThreatQuestion[] = [
  {
    id: 'tq-01',
    question: 'Can the system detect and neutralise harmful or malicious LLM inputs (prompt injection, jailbreaks)?',
    owaspRef: 'OWASP LLM01',
    airRef: 'R317',
    category: 'Prompt Injection',
    guidance: 'Describe input validation, content filtering, and adversarial prompt detection mechanisms in place.'
  },
  {
    id: 'tq-02',
    question: 'Are LLM trust boundaries secured — particularly connections to databases, APIs, and external systems via tools or MCP?',
    owaspRef: 'OWASP LLM08',
    airRef: 'R315',
    category: 'MCP Server Policy Abuse',
    guidance: 'Describe how tool calls and external integrations are sandboxed, logged, and policy-controlled.'
  },
  {
    id: 'tq-03',
    question: 'Is insider threat mitigation in place to prevent shadow AI use and unauthorised training data manipulation?',
    owaspRef: 'OWASP LLM03',
    airRef: 'R342',
    category: 'Data Poisoning via Insider Access',
    guidance: 'Describe access controls, audit logging, and segregation of duties in the ML pipeline.'
  },
  {
    id: 'tq-04',
    question: 'Is unauthorised model access and weight exfiltration prevented (IP protection, rate limiting, query monitoring)?',
    owaspRef: 'OWASP LLM10',
    airRef: 'R316',
    category: 'Model Weight Exfiltration',
    guidance: 'Describe rate limiting, query anomaly detection, output watermarking, and access controls on model serving.'
  },
  {
    id: 'tq-05',
    question: 'Can the system prevent generation of harmful, inaccurate, or inappropriate content (hallucination, confabulation)?',
    owaspRef: 'OWASP LLM09',
    airRef: 'R326',
    category: 'Confabulation / Hallucination',
    guidance: 'Describe RAG grounding, confidence scoring, output filtering, and human review processes.'
  },
  {
    id: 'tq-06',
    question: 'How could GenAI capabilities be weaponised against your customers — spoofing, social engineering, or impersonation?',
    owaspRef: 'OWASP LLM02',
    airRef: 'R317',
    category: 'AI-Enabled Social Engineering',
    guidance: 'Describe mitigations against AI-generated phishing, deepfake impersonation, and customer manipulation scenarios.'
  },
  {
    id: 'tq-07',
    question: 'Has the Incident Response Plan been updated to address GenAI-specific incidents (prompt injection breach, model exfiltration, poisoned outputs)?',
    owaspRef: 'OWASP LLM07',
    airRef: 'R315/R316/R317',
    category: 'Incident Response',
    guidance: 'Describe IR playbooks specific to GenAI incidents, escalation paths, and breach notification procedures.'
  }
]
