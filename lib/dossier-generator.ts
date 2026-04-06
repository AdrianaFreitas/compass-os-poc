import { classifyRisk } from './data/eu-ai-act-tree'
import { CONSTITUENT_LABELS, LAYER_LABELS } from './data/compass-controls'
import { calculateLayerMaturity, isStale } from './utils'
import type { ScoredItem } from './utils'

interface System {
  name: string
  purpose: string
  sector: string
  deployment_type: string
  jurisdictions: string[]
  layers: string[]
  risk_tier: string | null
  risk_article: string | null
  base_model: string | null
  embedding_model: string | null
  vector_db: string | null
  orchestration_framework: string | null
  third_party_plugins: string[] | null
  vendor_name: string | null
  vendor_assessment_status: string | null
  vendor_last_audit: string | null
  maturity_score: string | null
  created_at: string
  fria_opted_in?: boolean
}

interface FRIAScenarioRow {
  right_name: string
  scenario_description: string
  likelihood: string
  interference_level: string
  scope: string
  priority_level: string
  justification: string | null
  absolute_right: boolean
}

interface FRIADeploymentRow {
  recommendation: string
  rationale: string | null
  conditions: string | null
  approved_by: string | null
  approval_date: string | null
  next_review_date: string | null
}

interface FRIAContextRow {
  purpose_description: string | null
  operator_name: string | null
  assessor_name: string | null
  assessment_date: string | null
  affected_populations: string | null
}

interface EvidenceRow {
  constituent: string
  layer: string
  label: string
  checked: boolean
  evidence_type: string
  retest_frequency: string
  last_tested: string | null
  owasp_ref: string | null
  thesis_ref: string | null
}

interface ThreatRow {
  question_id: string
  answer: string | null
  notes: string | null
}

interface LexArchRow {
  control_name: string | null
  layer: string | null
  constituent: string | null
  maturity_level: string | null
  thesis_ref: string | null
  owasp_ref: string | null
}

const JURISDICTION_LABELS: Record<string, string> = {
  eu: 'European Union (EU AI Act + GDPR + CRA)',
  us: 'United States (NIST AI RMF + EO 14110)',
  cn: "People's Republic of China (AIGCS + PIPL + TC260)",
}

const DEPLOYMENT_LABELS: Record<string, string> = {
  type1: 'Type 1 — Direct Access (low supply chain risk)',
  type2: 'Type 2 — Model API (medium supply chain risk)',
  type3: 'Type 3 — Licensed Model (medium supply chain risk)',
  type4: 'Type 4 — Pre-trained + Fine-tuned (high supply chain risk)',
  type5: 'Type 5 — Fine-tuned Proven Model (high supply chain risk)',
  type6: 'Type 6 — Custom Bespoke Model (critical supply chain risk)',
}

const OWASP_LABELS: Record<string, string> = {
  'tq-01': 'Prompt Injection Defence',
  'tq-02': 'MCP / Tool Trust Boundaries',
  'tq-03': 'Insider Threat & Data Poisoning',
  'tq-04': 'Model Weight Exfiltration',
  'tq-05': 'Confabulation / Hallucination',
  'tq-06': 'AI-Enabled Social Engineering',
  'tq-07': 'GenAI Incident Response',
}

export function generateDossierMarkdown(
  system: System,
  evidence: EvidenceRow[],
  threats: ThreatRow[],
  lexarch: LexArchRow[],
  generatedDate: string,
  friaContext?: FRIAContextRow | null,
  friaScenarios?: FRIAScenarioRow[],
  friaDeployment?: FRIADeploymentRow | null,
): string {
  const classification = classifyRisk(system.purpose, system.sector)
  const layers = system.layers as string[]
  const constituents = ['data_governance', 'model_security', 'output_integrity', 'human_oversight', 'ethics_fairness']

  const totalControls = evidence.length
  const checkedControls = evidence.filter(e => e.checked).length
  const pct = totalControls > 0 ? Math.round((checkedControls / totalControls) * 100) : 0
  const staleItems = evidence.filter(e => isStale(e as ScoredItem))
  const maturityLabel = system.maturity_score?.toUpperCase() ?? 'ML-1'

  const lines: string[] = []

  lines.push(`# AI Governance Compliance Dossier`)
  lines.push(`## ${system.name}`)
  lines.push(``)
  lines.push(`> Generated: ${generatedDate}  `)
  lines.push(`> Framework: COMPASS OS v1.0 — EU AI Act Art. 11 Technical Documentation  `)
  lines.push(`> Classification: **${classification.label}** (${classification.article})  `)
  lines.push(`> Overall Maturity: **${maturityLabel}**  `)
  lines.push(`> Evidence Completion: **${checkedControls}/${totalControls} controls (${pct}%)**`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  // Section 1
  lines.push(`## 1. System Overview`)
  lines.push(``)
  lines.push(`| Field | Value |`)
  lines.push(`|---|---|`)
  lines.push(`| System Name | ${system.name} |`)
  lines.push(`| Purpose | ${system.purpose} |`)
  lines.push(`| Sector | ${system.sector} |`)
  lines.push(`| Deployment Type | ${DEPLOYMENT_LABELS[system.deployment_type] ?? system.deployment_type} |`)
  lines.push(`| Registration Date | ${new Date(system.created_at).toLocaleDateString('en-GB')} |`)
  lines.push(``)

  // Section 2
  lines.push(`## 2. EU AI Act Risk Classification`)
  lines.push(``)
  lines.push(`**Tier:** ${classification.label}  `)
  lines.push(`**Article:** ${classification.article}  `)
  lines.push(``)
  lines.push(`${classification.description}`)
  lines.push(``)
  lines.push(`**Compliance Obligations:**`)
  lines.push(``)
  classification.obligations.forEach(o => lines.push(`- ${o}`))
  lines.push(``)

  // Section 3
  lines.push(`## 3. AI System Bill of Materials`)
  lines.push(``)
  if (system.base_model || system.embedding_model || system.vector_db || system.orchestration_framework) {
    lines.push(`| Component | Value |`)
    lines.push(`|---|---|`)
    if (system.base_model) lines.push(`| Base Model | ${system.base_model} |`)
    if (system.embedding_model) lines.push(`| Embedding Model | ${system.embedding_model} |`)
    if (system.vector_db) lines.push(`| Vector Database | ${system.vector_db} |`)
    if (system.orchestration_framework) lines.push(`| Orchestration Framework | ${system.orchestration_framework} |`)
    if (system.third_party_plugins?.length) lines.push(`| Third-party Plugins | ${system.third_party_plugins.join(', ')} |`)
    if (system.vendor_name) lines.push(`| Vendor | ${system.vendor_name} |`)
    if (system.vendor_assessment_status) lines.push(`| Vendor Assessment | ${system.vendor_assessment_status} |`)
  } else {
    lines.push(`_No AI SBoM information recorded._`)
  }
  lines.push(``)

  // Section 4
  lines.push(`## 4. Jurisdiction Coverage`)
  lines.push(``)
  system.jurisdictions.forEach(j => {
    lines.push(`- **${JURISDICTION_LABELS[j] ?? j}**`)
  })
  lines.push(``)
  lines.push(`**Layers in scope:** ${layers.map(l => LAYER_LABELS[l as keyof typeof LAYER_LABELS] ?? l).join(', ')}`)
  lines.push(``)

  // Section 5
  lines.push(`## 5. OWASP LLM Threat Model`)
  lines.push(``)
  if (threats.length === 0) {
    lines.push(`_Threat model not yet completed. Navigate to Risk Classification to answer the 7 OWASP vectors._`)
  } else {
    threats.forEach(t => {
      const label = OWASP_LABELS[t.question_id] ?? t.question_id
      lines.push(`### ${label}`)
      lines.push(``)
      if (t.answer) lines.push(`**Controls in place:** ${t.answer}`)
      if (t.notes) lines.push(`**Notes / Gaps:** ${t.notes}`)
      if (!t.answer && !t.notes) lines.push(`_Not answered._`)
      lines.push(``)
    })
  }

  // Section 6
  lines.push(`## 6. Evidence Maturity Summary`)
  lines.push(``)
  lines.push(`Overall system maturity: **${maturityLabel}**`)
  lines.push(``)
  lines.push(`| Constituent | Layer | Maturity | Checked | Stale |`)
  lines.push(`|---|---|---|---|---|`)

  for (const constituent of constituents) {
    for (const layer of layers) {
      const cell = evidence.filter(e => e.constituent === constituent && e.layer === layer)
      if (cell.length === 0) continue
      const maturity = calculateLayerMaturity(cell as ScoredItem[]).toUpperCase()
      const checked = cell.filter(e => e.checked).length
      const staleCount = cell.filter(e => isStale(e as ScoredItem)).length
      const cLabel = CONSTITUENT_LABELS[constituent as keyof typeof CONSTITUENT_LABELS] ?? constituent
      const lLabel = LAYER_LABELS[layer as keyof typeof LAYER_LABELS] ?? layer
      lines.push(`| ${cLabel} | ${lLabel} | ${maturity} | ${checked}/${cell.length} | ${staleCount > 0 ? `⚠ ${staleCount}` : '—'} |`)
    }
  }
  lines.push(``)

  // Section 7–9: evidence by constituent
  for (const constituent of constituents) {
    const constItems = evidence.filter(e => e.constituent === constituent)
    if (constItems.length === 0) continue
    const cLabel = CONSTITUENT_LABELS[constituent as keyof typeof CONSTITUENT_LABELS] ?? constituent
    const sectionNum = constituents.indexOf(constituent) + 7
    lines.push(`## ${sectionNum}. ${cLabel}`)
    lines.push(``)
    constItems.forEach(e => {
      const status = e.checked ? '✅' : '⬜'
      const staleFlag = isStale(e as ScoredItem) ? ' ⚠ RETEST OVERDUE' : ''
      lines.push(`- ${status} **${e.label}** *(${e.evidence_type.toUpperCase()}, ${LAYER_LABELS[e.layer as keyof typeof LAYER_LABELS] ?? e.layer})*${staleFlag}`)
      if (e.thesis_ref) lines.push(`  - Ref: ${e.thesis_ref}`)
      if (e.owasp_ref) lines.push(`  - OWASP: ${e.owasp_ref}`)
    })
    lines.push(``)
  }

  // Section 10: LexArch results
  lines.push(`## ${constituents.length + 7}. LexArch Compiled Articles`)
  lines.push(``)
  if (lexarch.length === 0) {
    lines.push(`_No articles compiled yet. Use the LexArch compiler to map regulatory articles to this framework._`)
  } else {
    lexarch.forEach((r, i) => {
      lines.push(`### ${i + 1}. ${r.control_name ?? 'Unnamed control'}`)
      if (r.layer) lines.push(`- **Layer:** ${LAYER_LABELS[r.layer as keyof typeof LAYER_LABELS] ?? r.layer}`)
      if (r.constituent) lines.push(`- **Constituent:** ${CONSTITUENT_LABELS[r.constituent as keyof typeof CONSTITUENT_LABELS] ?? r.constituent}`)
      if (r.maturity_level) lines.push(`- **Maturity:** ${r.maturity_level}`)
      if (r.thesis_ref) lines.push(`- **Ref:** ${r.thesis_ref}`)
      if (r.owasp_ref) lines.push(`- **OWASP:** ${r.owasp_ref}`)
      lines.push(``)
    })
  }

  // FRIA section (conditional)
  if (system.fria_opted_in && (friaScenarios?.length || friaContext || friaDeployment)) {
    const friaSectionNum = constituents.length + 8
    lines.push(`## ${friaSectionNum}. Fundamental Rights Impact Assessment (Art. 27)`)
    lines.push(``)
    lines.push(`_This system has undergone a FRIA in accordance with EU AI Act Art. 27._`)
    lines.push(``)

    if (friaContext) {
      if (friaContext.operator_name) lines.push(`**Deploying organisation:** ${friaContext.operator_name}`)
      if (friaContext.assessor_name) lines.push(`**Assessor:** ${friaContext.assessor_name}`)
      if (friaContext.assessment_date) lines.push(`**Assessment date:** ${friaContext.assessment_date}`)
      if (friaContext.affected_populations) lines.push(`**Affected populations:** ${friaContext.affected_populations}`)
      lines.push(``)
    }

    if (friaScenarios && friaScenarios.length > 0) {
      lines.push(`### Rights Assessment`)
      lines.push(``)
      lines.push(`| Right | Likelihood | Interference | Scope | Priority |`)
      lines.push(`|---|---|---|---|---|`)
      friaScenarios.forEach(s => {
        lines.push(`| ${s.right_name} | ${s.likelihood} | ${s.interference_level} | ${s.scope} | **${s.priority_level.toUpperCase()}** |`)
      })
      lines.push(``)

      const critical = friaScenarios.filter(s => s.priority_level === 'critical')
      const high = friaScenarios.filter(s => s.priority_level === 'high')
      if (critical.length > 0) lines.push(`⚠ **${critical.length} critical risk(s) identified** requiring immediate mitigation.`)
      if (high.length > 0) lines.push(`⚠ **${high.length} high risk(s) identified** requiring mitigation before deployment.`)
      lines.push(``)
    }

    if (friaDeployment) {
      lines.push(`### Deployment Decision`)
      lines.push(``)
      lines.push(`**Recommendation:** ${friaDeployment.recommendation?.replace(/_/g, ' ').toUpperCase() ?? '—'}`)
      if (friaDeployment.rationale) lines.push(`**Rationale:** ${friaDeployment.rationale}`)
      if (friaDeployment.conditions) lines.push(`**Conditions:** ${friaDeployment.conditions}`)
      if (friaDeployment.approved_by) lines.push(`**Approved by:** ${friaDeployment.approved_by}`)
      if (friaDeployment.approval_date) lines.push(`**Approval date:** ${friaDeployment.approval_date}`)
      if (friaDeployment.next_review_date) lines.push(`**Next review:** ${friaDeployment.next_review_date}`)
      lines.push(``)
    }
  }

  // Compliance summary
  lines.push(`---`)
  lines.push(``)
  lines.push(`## Compliance Readiness Assessment`)
  lines.push(``)

  if (system.maturity_score === 'ml3') {
    lines.push(`**Status: ML-3 DEFINED ✅**`)
    lines.push(``)
    lines.push(`All layers have achieved ML-3 maturity. The system demonstrates documented, regularly tested, and up-to-date evidence of existence and proof of execution across all in-scope layers.`)
  } else if (system.maturity_score === 'ml2') {
    lines.push(`**Status: ML-2 MANAGED — Gaps identified**`)
    lines.push(``)
    lines.push(`The system has established baseline evidence (ML-2) but has not yet achieved ML-3. To reach ML-3:`)
    lines.push(`- Ensure EoE coverage ≥50% in all layers`)
    lines.push(`- Add at least one PoE item per layer`)
    lines.push(`- Remediate ${staleItems.length} stale PoE item(s) that have exceeded their retest frequency`)
  } else {
    lines.push(`**Status: ML-1 INITIAL — Action required**`)
    lines.push(``)
    lines.push(`No evidence has been collected yet. Begin by checking off policies and procedures (EoE items) in the Evidence Checklist to achieve ML-2, then add test results and logs (PoE items) to progress toward ML-3.`)
  }

  lines.push(``)
  lines.push(`---`)
  lines.push(``)
  lines.push(`*This dossier was generated by COMPASS OS — an AI governance compliance mapping prototype.*`)
  lines.push(`*The governance logic encodes validated research from a Master's thesis on AI regulatory compliance.*`)

  return lines.join('\n')
}
