export interface AIRRisk {
  id: string
  code: string
  title: string
  description: string
  owaspRef: string
  mitigations: string[]
}

export const AIR_2026_RISKS: AIRRisk[] = [
  {
    id: 'r315',
    code: 'R315',
    title: 'MCP Server Policy Abuse',
    description: 'Exploitation of Model Context Protocol servers to bypass security policies, exfiltrate data, or execute unauthorised actions through trusted AI tool integrations.',
    owaspRef: '§2.1',
    mitigations: [
      'MCP server allowlist and policy enforcement',
      'Tool call logging and anomaly detection',
      'Sandbox execution for MCP tool calls',
      'Regular MCP server security audits'
    ]
  },
  {
    id: 'r316',
    code: 'R316',
    title: 'Model Weight Exfiltration',
    description: 'Unauthorised extraction of proprietary model weights through API probing, membership inference, or direct system compromise, enabling IP theft and adversarial exploitation.',
    owaspRef: '§2.5',
    mitigations: [
      'Rate limiting and query monitoring',
      'Watermarking of model outputs',
      'Access controls on model serving infrastructure',
      'Differential privacy in training'
    ]
  },
  {
    id: 'r317',
    code: 'R317',
    title: 'Prompt Injection via Authority Spoofing',
    description: 'Malicious instructions embedded in user inputs or retrieved documents that hijack AI behaviour by impersonating system-level authority, overriding safety constraints.',
    owaspRef: '§1.1',
    mitigations: [
      'Input sanitisation and prompt hardening',
      'Instruction hierarchy enforcement',
      'Output filtering and content moderation',
      'Adversarial prompt testing in CI/CD'
    ]
  },
  {
    id: 'r326',
    code: 'R326',
    title: 'Confabulation / Hallucination at Scale',
    description: 'Systematic generation of plausible but factually incorrect outputs, particularly dangerous in high-stakes domains (medical, legal, financial) where errors compound at scale.',
    owaspRef: '§3.6',
    mitigations: [
      'RAG grounding with authoritative sources',
      'Confidence scoring and uncertainty disclosure',
      'Human review for high-stakes outputs',
      'Regular hallucination benchmarking'
    ]
  },
  {
    id: 'r327',
    code: 'R327',
    title: 'Environmental & Carbon Impact',
    description: 'Disproportionate energy consumption and carbon emissions from large-scale AI training and inference, contributing to climate risk and regulatory exposure under ESG frameworks.',
    owaspRef: '§5.2',
    mitigations: [
      'Carbon footprint measurement and reporting',
      'Renewable energy sourcing for compute',
      'Model efficiency optimisation (distillation, quantisation)',
      'Compute usage governance policies'
    ]
  },
  {
    id: 'r330',
    code: 'R330',
    title: 'Content Homogenisation / Model Collapse',
    description: 'Recursive training on AI-generated content degrades model diversity and quality over generations, producing homogenised outputs that erode cultural diversity and epistemic pluralism.',
    owaspRef: '§4.1',
    mitigations: [
      'Training data provenance tracking',
      'Human-generated content preservation',
      'Output diversity metrics monitoring',
      'Data sourcing policy enforcement'
    ]
  },
  {
    id: 'r337',
    code: 'R337',
    title: 'Neurorights Violation',
    description: 'AI systems that infer, manipulate, or commercialise mental states, cognitive patterns, or neurological data without consent, violating emerging neurorights frameworks.',
    owaspRef: '§5.4',
    mitigations: [
      'Prohibition on neurological data processing without explicit consent',
      'Mental state inference capability disclosure',
      'Data minimisation for affective computing',
      'Legal review against neurorights legislation'
    ]
  },
  {
    id: 'r342',
    code: 'R342',
    title: 'Data Poisoning via Insider Access',
    description: 'Malicious or negligent corruption of training data by insiders with privileged access, causing systematic model misbehaviour that is difficult to detect post-deployment.',
    owaspRef: '§2.3',
    mitigations: [
      'Training data access controls and audit logs',
      'Data integrity checksums and provenance',
      'Insider threat detection programme',
      'Segregation of duties in ML pipeline'
    ]
  },
  {
    id: 'r346',
    code: 'R346',
    title: 'AI Fundamental Rights Impact',
    description: 'Automated decisions that disproportionately affect marginalised groups, infringe on fundamental rights (dignity, equality, free expression), or circumvent legal due process.',
    owaspRef: '§5.1',
    mitigations: [
      'Fundamental rights impact assessment',
      'Bias testing across protected characteristics',
      'Explainability for consequential decisions',
      'Appeals and redress mechanism'
    ]
  }
]
