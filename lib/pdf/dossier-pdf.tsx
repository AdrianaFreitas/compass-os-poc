import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { CONSTITUENT_LABELS, LAYER_LABELS } from '@/lib/data/compass-controls'
import type { Constituent, Layer } from '@/lib/data/compass-controls'
import { calculateLayerMaturity, isStale } from '@/lib/utils'
import type { ScoredItem } from '@/lib/utils'
import { OWASP_THREAT_QUESTIONS } from '@/lib/data/owasp-threat-questions'
import { classifyRisk } from '@/lib/data/eu-ai-act-tree'

// ─── Data types ────────────────────────────────────────────────────────────────

export interface PDFSystem {
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

export interface PDFEvidence {
  constituent: string
  layer: string
  label: string
  checked: boolean
  evidence_type: string
  retest_frequency: string | null
  last_tested: string | null
  owasp_ref: string | null
  thesis_ref: string | null
}

export interface PDFThreat {
  question_id: string
  answer: string | null
  notes: string | null
}

export interface PDFLexArch {
  article_text: string
  control_name: string | null
  layer: string | null
  constituent: string | null
  maturity_level: string | null
  thesis_ref: string | null
  owasp_ref: string | null
}

export interface PDFFRIAContext {
  purpose_description: string | null
  operator_name: string | null
  assessor_name: string | null
  assessment_date: string | null
  affected_populations: string | null
}

export interface PDFFRIAScenario {
  right_name: string
  scenario_description: string
  likelihood: string
  interference_level: string
  scope: string
  priority_level: string
  absolute_right: boolean
}

export interface PDFFRIADeployment {
  recommendation: string | null
  rationale: string | null
  conditions: string | null
  approved_by: string | null
  approval_date: string | null
}

export interface DossierPDFData {
  system: PDFSystem
  evidence: PDFEvidence[]
  threats: PDFThreat[]
  lexarch: PDFLexArch[]
  friaContext?: PDFFRIAContext | null
  friaScenarios?: PDFFRIAScenario[]
  friaDeployment?: PDFFRIADeployment | null
  generatedDate: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CONSTITUENTS: Constituent[] = [
  'data_governance',
  'model_security',
  'output_integrity',
  'human_oversight',
  'ethics_fairness',
]

const DEPLOYMENT_LABELS: Record<string, string> = {
  type1: 'Type 1 — Direct Access (low supply chain risk)',
  type2: 'Type 2 — Model API (medium supply chain risk)',
  type3: 'Type 3 — Licensed Model (medium supply chain risk)',
  type4: 'Type 4 — Pre-trained + Fine-tuned (high supply chain risk)',
  type5: 'Type 5 — Fine-tuned Proven Model (high supply chain risk)',
  type6: 'Type 6 — Custom Bespoke Model (critical supply chain risk)',
}

const JURISDICTION_LABELS: Record<string, string> = {
  eu: 'European Union (EU AI Act + GDPR + CRA)',
  us: 'United States (NIST AI RMF + EO 14110)',
  cn: "People's Republic of China (AIGCS + PIPL + TC260)",
}

const owaspQuestionMap: Record<string, string> = Object.fromEntries(
  OWASP_THREAT_QUESTIONS.map(q => [q.id, q.question])
)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getMaturityColors(level: string): { bg: string; text: string } {
  const l = level?.toLowerCase().replace('-', '')
  if (l === 'ml3') return { bg: '#d4edda', text: '#155724' }
  if (l === 'ml2') return { bg: '#fff3cd', text: '#856404' }
  return { bg: '#f8d7da', text: '#721c24' }
}

function getRiskColors(tier: string): { bg: string; text: string } {
  if (tier === 'high') return { bg: '#fff3cd', text: '#856404' }
  if (tier === 'unacceptable') return { bg: '#f8d7da', text: '#721c24' }
  if (tier === 'limited') return { bg: '#fff3cd', text: '#856404' }
  return { bg: '#d4edda', text: '#155724' }
}

function getFRIARecommendationColors(rec: string): { bg: string; text: string } {
  if (rec === 'proceed') return { bg: '#d4edda', text: '#155724' }
  if (rec === 'proceed_with_conditions') return { bg: '#fff3cd', text: '#856404' }
  if (rec === 'do_not_deploy') return { bg: '#f8d7da', text: '#721c24' }
  return { bg: '#fff3cd', text: '#856404' }
}

function maturityLabel(level: string): string {
  const l = level?.toLowerCase().replace('-', '')
  if (l === 'ml3') return 'ML-3 Defined'
  if (l === 'ml2') return 'ML-2 Managed'
  return 'ML-1 Initial'
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Pages
  coverPage: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  page: {
    paddingTop: 52,
    paddingBottom: 44,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },

  // ── Fixed header (content pages)
  header: {
    position: 'absolute',
    top: 16,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  headerText: {
    fontSize: 8,
    color: '#999999',
    fontFamily: 'Helvetica',
  },

  // ── Fixed footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 7,
    color: '#bbbbbb',
    fontFamily: 'Helvetica',
  },

  // ── Cover
  coverLogo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#0f6e56',
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#555555',
    fontFamily: 'Helvetica',
    marginBottom: 18,
  },
  coverSystemName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  coverRule: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 18,
  },
  coverMetaLabel: {
    fontSize: 9,
    color: '#666666',
    fontFamily: 'Helvetica',
    marginBottom: 2,
  },
  coverMetaValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },

  // ── Metric cards grid
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 12,
    marginRight: 8,
  },
  metricCardLast: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 12,
  },
  metricLabel: {
    fontSize: 8,
    color: '#666666',
    fontFamily: 'Helvetica',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },

  // ── Section headers
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    marginTop: 18,
    marginBottom: 8,
  },
  subsectionHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 5,
  },

  // ── Body text
  body: {
    fontSize: 10,
    color: '#1a1a1a',
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  muted: {
    fontSize: 8,
    color: '#666666',
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  italic: {
    fontSize: 10,
    color: '#888888',
    fontFamily: 'Helvetica-Oblique',
  },

  // ── Table
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    backgroundColor: '#fafafa',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tdLabel: {
    width: '30%',
    padding: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
    borderRightStyle: 'solid',
  },
  tdValue: {
    width: '70%',
    padding: 6,
  },
  thText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
  },
  tdText: {
    fontSize: 9,
    color: '#1a1a1a',
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },

  // ── Wide table cells (for maturity summary)
  tdWide: {
    flex: 1,
    padding: 5,
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
    borderRightStyle: 'solid',
  },
  tdWideLast: {
    flex: 1,
    padding: 5,
  },

  // ── Badge
  badge: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // ── OWASP badge
  owaspBadge: {
    backgroundColor: '#d1e7dd',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  owaspBadgeText: {
    fontSize: 8,
    color: '#0f5132',
    fontFamily: 'Helvetica',
  },

  // ── Bullet list (teal bullets)
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: '#0f6e56',
    fontFamily: 'Helvetica-Bold',
    flexShrink: 0,
    marginTop: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#1a1a1a',
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },

  // ── Evidence items
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 2,
  },
  evidenceCheck: {
    width: 14,
    fontSize: 10,
    fontFamily: 'Helvetica',
    flexShrink: 0,
    color: '#1a1a1a',
    marginTop: 1,
  },
  evidenceContent: {
    flex: 1,
  },
  evidenceName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  evidenceNameChecked: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#155724',
    lineHeight: 1.4,
  },
  evidenceType: {
    fontSize: 8,
    color: '#666666',
    fontFamily: 'Helvetica',
    marginTop: 1,
  },
  evidenceRef: {
    fontSize: 8,
    color: '#888888',
    fontFamily: 'Helvetica',
    marginTop: 1,
  },

  // ── OWASP threat answer badges
  answerYes: { backgroundColor: '#d4edda', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  answerNo: { backgroundColor: '#f8d7da', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  answerPartial: { backgroundColor: '#fff3cd', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  answerUnknown: { backgroundColor: '#f5f5f5', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  answerYesText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#155724' },
  answerNoText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#721c24' },
  answerPartialText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#856404' },
  answerUnknownText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#555555' },

  // ── FRIA
  friaRecommendationBox: {
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },

  // ── Compliance readiness box
  complianceBox: {
    backgroundColor: '#f0faf5',
    borderWidth: 1,
    borderColor: '#0f6e56',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 14,
    marginTop: 14,
  },
  complianceTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f6e56',
    marginBottom: 6,
  },

  // ── LexArch card
  lexarchCard: {
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  lexarchTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  lexarchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  lexarchSnippet: {
    fontSize: 8,
    color: '#888888',
    fontFamily: 'Helvetica-Oblique',
    marginTop: 4,
    lineHeight: 1.4,
  },
})

// ─── Small reusable components ─────────────────────────────────────────────────

function SectionTitle({ children, first = false }: { children: string; first?: boolean }) {
  return (
    <Text style={[s.sectionHeader, first ? { marginTop: 0 } : {}]}>
      {children}
    </Text>
  )
}

function LabelValueTable({
  rows,
}: {
  rows: { label: string; value: string }[]
}) {
  return (
    <View style={s.table}>
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1
        const isAlt = i % 2 === 1
        return (
          <View
            key={i}
            style={isLast ? s.tableRowLast : isAlt ? s.tableRowAlt : s.tableRow}
          >
            <View style={s.tdLabel}>
              <Text style={[s.thText]}>{row.label}</Text>
            </View>
            <View style={s.tdValue}>
              <Text style={s.tdText}>{row.value || '—'}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

function BulletItem({ children }: { children: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  )
}

function AnswerBadge({ answer }: { answer: string | null }) {
  const a = (answer ?? '').toLowerCase().trim()
  if (a === 'yes') return (
    <View style={s.answerYes}><Text style={s.answerYesText}>Yes</Text></View>
  )
  if (a === 'no') return (
    <View style={s.answerNo}><Text style={s.answerNoText}>No</Text></View>
  )
  if (a === 'partial') return (
    <View style={s.answerPartial}><Text style={s.answerPartialText}>Partial</Text></View>
  )
  if (!answer) return (
    <View style={s.answerUnknown}><Text style={s.answerUnknownText}>Not answered</Text></View>
  )
  return (
    <View style={s.answerUnknown}><Text style={s.answerUnknownText}>{answer}</Text></View>
  )
}

// ─── Cover Page ────────────────────────────────────────────────────────────────

function CoverPage({
  system,
  evidence,
  generatedDate,
  classification,
}: {
  system: PDFSystem
  evidence: PDFEvidence[]
  generatedDate: string
  classification: ReturnType<typeof classifyRisk>
}) {
  const totalControls = evidence.length
  const checkedControls = evidence.filter(e => e.checked).length
  const pct = totalControls > 0 ? Math.round((checkedControls / totalControls) * 100) : 0
  const maturity = system.maturity_score ?? 'ml1'
  const { text: matText } = getMaturityColors(maturity)
  const { text: riskText } = getRiskColors(system.risk_tier ?? 'minimal')

  return (
    <Page size="A4" style={s.coverPage}>
      {/* Logo */}
      <Text style={s.coverLogo}>COMPASS OS</Text>
      <Text style={s.coverSubtitle}>AI Governance Compliance Dossier</Text>

      {/* System name */}
      <Text style={s.coverSystemName}>{system.name}</Text>

      {/* Horizontal rule */}
      <View style={s.coverRule} />

      {/* 2×2 Metric cards */}
      <View style={s.metricsRow}>
        <View style={s.metricCard}>
          <Text style={s.metricLabel}>Overall Maturity</Text>
          <Text style={[s.metricValue, { color: matText }]}>{maturityLabel(maturity)}</Text>
        </View>
        <View style={s.metricCardLast}>
          <Text style={s.metricLabel}>Risk Tier</Text>
          <Text style={[s.metricValue, { color: riskText }]}>
            {(system.risk_tier ?? 'MINIMAL').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={s.metricsRow}>
        <View style={s.metricCard}>
          <Text style={s.metricLabel}>Evidence</Text>
          <Text style={s.metricValue}>{checkedControls}/{totalControls} controls</Text>
          <Text style={s.metricLabel}>{pct}% complete</Text>
        </View>
        <View style={s.metricCardLast}>
          <Text style={s.metricLabel}>Generated</Text>
          <Text style={[s.metricValue, { fontSize: 11 }]}>{generatedDate}</Text>
        </View>
      </View>

      {/* Horizontal rule */}
      <View style={s.coverRule} />

      {/* Framework + classification lines */}
      <Text style={s.coverMetaLabel}>Framework</Text>
      <Text style={[s.coverMetaValue, { marginBottom: 10 }]}>
        COMPASS OS v1.0 — EU AI Act Art. 11 Technical Documentation
      </Text>
      <Text style={s.coverMetaLabel}>Classification</Text>
      <Text style={s.coverMetaValue}>
        {classification.label} ({classification.article})
      </Text>
    </Page>
  )
}

// ─── Main document ─────────────────────────────────────────────────────────────

function DossierPDFDocument({
  system,
  evidence,
  threats,
  lexarch,
  friaContext,
  friaScenarios,
  friaDeployment,
  generatedDate,
}: DossierPDFData) {
  const classification = classifyRisk(system.purpose, system.sector)
  const layers = system.layers as Layer[]

  const friaEnabled = system.fria_opted_in && friaDeployment

  return (
    <Document>
      {/* ── Cover page ── */}
      <CoverPage
        system={system}
        evidence={evidence}
        generatedDate={generatedDate}
        classification={classification}
      />

      {/* ── Content pages ── */}
      <Page size="A4" style={s.page}>
        {/* Fixed header — every content page */}
        <View style={s.header} fixed>
          <Text style={s.headerText}>COMPASS OS — AI Governance Compliance Dossier</Text>
          <Text style={s.headerText}>{system.name}</Text>
        </View>

        {/* Fixed footer — every content page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Generated by COMPASS OS v1.0 — EU AI Act Art. 11 Technical Documentation
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber - 1} of ${totalPages - 1}`
            }
          />
        </View>

        {/* ── Section 1: System Overview ── */}
        <SectionTitle first>1. System Overview</SectionTitle>
        <LabelValueTable
          rows={[
            { label: 'System Name', value: system.name },
            { label: 'Purpose', value: system.purpose },
            { label: 'Sector', value: system.sector },
            {
              label: 'Deployment Type',
              value: DEPLOYMENT_LABELS[system.deployment_type] ?? system.deployment_type,
            },
            {
              label: 'Jurisdictions',
              value: system.jurisdictions
                .map(j => JURISDICTION_LABELS[j] ?? j.toUpperCase())
                .join(', '),
            },
            {
              label: 'Layers in scope',
              value: layers
                .map(l => LAYER_LABELS[l] ?? l)
                .join(', '),
            },
            {
              label: 'Registration date',
              value: new Date(system.created_at).toLocaleDateString('en-GB'),
            },
          ]}
        />

        {/* ── Section 2: EU AI Act Classification ── */}
        <SectionTitle>2. EU AI Act Risk Classification</SectionTitle>
        <LabelValueTable
          rows={[
            { label: 'Risk Tier', value: classification.label },
            { label: 'Article', value: classification.article },
          ]}
        />
        <Text style={[s.body, { marginBottom: 8 }]}>{classification.description}</Text>
        <Text style={[s.muted, { marginBottom: 4, fontFamily: 'Helvetica-Bold', color: '#333333' }]}>
          Compliance Obligations
        </Text>
        {classification.obligations.map((ob, i) => (
          <BulletItem key={i}>{ob}</BulletItem>
        ))}

        {/* ── FRIA section (if opted in) ── */}
        {friaEnabled && (
          <View>
            <SectionTitle>FRIA — Fundamental Rights Impact Assessment (Art. 27)</SectionTitle>

            {friaContext && (
              <LabelValueTable
                rows={[
                  ...(friaContext.operator_name ? [{ label: 'Deploying organisation', value: friaContext.operator_name }] : []),
                  ...(friaContext.assessor_name ? [{ label: 'Assessor', value: friaContext.assessor_name }] : []),
                  ...(friaContext.assessment_date ? [{ label: 'Assessment date', value: friaContext.assessment_date }] : []),
                  ...(friaContext.affected_populations ? [{ label: 'Affected populations', value: friaContext.affected_populations }] : []),
                ]}
              />
            )}

            {friaDeployment?.recommendation && (() => {
              const { bg, text } = getFRIARecommendationColors(friaDeployment.recommendation)
              const label = friaDeployment.recommendation
                .replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase())
              return (
                <View>
                  <Text style={[s.muted, { marginBottom: 4, fontFamily: 'Helvetica-Bold', color: '#333333' }]}>
                    Deployment Decision
                  </Text>
                  <View style={[s.friaRecommendationBox, { backgroundColor: bg }]}>
                    <Text style={[s.badgeText, { fontSize: 10, color: text }]}>{label}</Text>
                  </View>
                  {friaDeployment.rationale && (
                    <Text style={[s.body, { marginBottom: 4 }]}>
                      {friaDeployment.rationale}
                    </Text>
                  )}
                  {friaDeployment.conditions && (
                    <Text style={[s.muted, { marginBottom: 4 }]}>
                      Conditions: {friaDeployment.conditions}
                    </Text>
                  )}
                </View>
              )
            })()}

            {friaScenarios && friaScenarios.length > 0 && (
              <View>
                <Text style={[s.muted, { marginBottom: 6, marginTop: 6, fontFamily: 'Helvetica-Bold', color: '#333333' }]}>
                  Rights Assessment ({friaScenarios.length} scenarios)
                </Text>
                <View style={s.table}>
                  <View style={s.tableHeaderRow}>
                    {['Right', 'Likelihood', 'Interference', 'Scope', 'Priority'].map((h, i) => (
                      <View key={i} style={[s.tdWide, i === 4 ? { borderRightWidth: 0 } : {}]}>
                        <Text style={s.thText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                  {friaScenarios.map((sc, i) => {
                    const isLast = i === friaScenarios.length - 1
                    const isAlt = i % 2 === 1
                    return (
                      <View key={i} style={isLast ? s.tableRowLast : isAlt ? s.tableRowAlt : s.tableRow}>
                        <View style={s.tdWide}>
                          <Text style={[s.tdText, { fontSize: 8 }]}>{sc.right_name}</Text>
                        </View>
                        <View style={s.tdWide}>
                          <Text style={[s.tdText, { fontSize: 8 }]}>{sc.likelihood}</Text>
                        </View>
                        <View style={s.tdWide}>
                          <Text style={[s.tdText, { fontSize: 8 }]}>{sc.interference_level}</Text>
                        </View>
                        <View style={s.tdWide}>
                          <Text style={[s.tdText, { fontSize: 8 }]}>{sc.scope}</Text>
                        </View>
                        <View style={[s.tdWideLast]}>
                          {(() => {
                            const lvl = sc.priority_level
                            const bg = lvl === 'critical' ? '#f8d7da' : lvl === 'high' ? '#fff3cd' : lvl === 'medium' ? '#fff3cd' : '#d4edda'
                            const tc = lvl === 'critical' ? '#721c24' : lvl === 'high' ? '#856404' : lvl === 'medium' ? '#856404' : '#155724'
                            return (
                              <View style={[s.badge, { backgroundColor: bg }]}>
                                <Text style={[s.badgeText, { color: tc }]}>{lvl?.toUpperCase()}</Text>
                              </View>
                            )
                          })()}
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Section 3: AI SBoM ── */}
        <SectionTitle>3. AI Software Bill of Materials</SectionTitle>
        {(system.base_model || system.embedding_model || system.vector_db || system.orchestration_framework || system.vendor_name) ? (
          <LabelValueTable
            rows={[
              ...(system.base_model ? [{ label: 'Base Model', value: system.base_model }] : []),
              ...(system.embedding_model ? [{ label: 'Embedding Model', value: system.embedding_model }] : []),
              ...(system.vector_db ? [{ label: 'Vector Database', value: system.vector_db }] : []),
              ...(system.orchestration_framework ? [{ label: 'Orchestration Framework', value: system.orchestration_framework }] : []),
              ...(system.third_party_plugins?.length ? [{ label: 'Third-party Plugins', value: system.third_party_plugins.join(', ') }] : []),
              ...(system.vendor_name ? [{ label: 'Vendor', value: system.vendor_name }] : []),
              ...(system.vendor_assessment_status ? [{ label: 'Vendor Assessment', value: system.vendor_assessment_status }] : []),
              ...(system.vendor_last_audit ? [{ label: 'Last Vendor Audit', value: system.vendor_last_audit }] : []),
            ]}
          />
        ) : (
          <Text style={s.italic}>No AI SBoM information recorded.</Text>
        )}

        {/* ── Section 4: Jurisdiction Coverage ── */}
        <SectionTitle>4. Jurisdiction Coverage</SectionTitle>
        {system.jurisdictions.map((j, i) => (
          <BulletItem key={i}>{JURISDICTION_LABELS[j] ?? j.toUpperCase()}</BulletItem>
        ))}
        <Text style={[s.muted, { marginTop: 6 }]}>
          Layers in scope: {layers.map(l => LAYER_LABELS[l] ?? l).join(' · ')}
        </Text>

        {/* ── Section 5: OWASP Threat Model ── */}
        <SectionTitle>5. OWASP LLM Threat Model</SectionTitle>
        {threats.length === 0 ? (
          <Text style={s.italic}>
            Threat model not yet completed. Navigate to Risk Classification to answer the 7 OWASP vectors.
          </Text>
        ) : (
          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <View style={[s.tdLabel, { width: '55%' }]}>
                <Text style={s.thText}>Threat Vector</Text>
              </View>
              <View style={[s.tdLabel, { width: '15%' }]}>
                <Text style={s.thText}>Answer</Text>
              </View>
              <View style={[s.tdValue, { width: '30%', borderRightWidth: 0 }]}>
                <Text style={s.thText}>Notes</Text>
              </View>
            </View>
            {threats.map((t, i) => {
              const isLast = i === threats.length - 1
              const isAlt = i % 2 === 1
              const question = owaspQuestionMap[t.question_id] ?? t.question_id
              const shortQ = question.length > 80 ? question.slice(0, 77) + '…' : question
              return (
                <View key={i} style={isLast ? s.tableRowLast : isAlt ? s.tableRowAlt : s.tableRow} wrap={false}>
                  <View style={[s.tdLabel, { width: '55%' }]}>
                    <Text style={[s.tdText, { fontSize: 8 }]}>{shortQ}</Text>
                  </View>
                  <View style={[s.tdLabel, { width: '15%' }]}>
                    <AnswerBadge answer={t.answer} />
                  </View>
                  <View style={[s.tdValue, { width: '30%' }]}>
                    <Text style={[s.tdText, { fontSize: 8 }]}>{t.notes ?? ''}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* ── Section 6: Evidence Maturity Summary ── */}
        <SectionTitle>6. Evidence Maturity Summary</SectionTitle>
        <Text style={[s.muted, { marginBottom: 6 }]}>
          Overall system maturity: {maturityLabel(system.maturity_score ?? 'ml1')}
        </Text>
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            {['Constituent', 'Layer', 'Maturity', 'Checked', 'Stale'].map((h, i) => (
              <View key={i} style={[s.tdWide, i === 4 ? { borderRightWidth: 0 } : {}]}>
                <Text style={s.thText}>{h}</Text>
              </View>
            ))}
          </View>
          {(() => {
            const rows: React.ReactElement[] = []
            let rowIdx = 0
            for (const constituent of CONSTITUENTS) {
              for (const layer of layers) {
                const cell = evidence.filter(
                  e => e.constituent === constituent && e.layer === layer
                )
                if (cell.length === 0) continue
                const maturity = calculateLayerMaturity(cell as ScoredItem[])
                const checked = cell.filter(e => e.checked).length
                const staleCount = cell.filter(e => isStale(e as ScoredItem)).length
                const cLabel = CONSTITUENT_LABELS[constituent as Constituent] ?? constituent
                const lLabel = LAYER_LABELS[layer as Layer] ?? layer
                const { bg, text } = getMaturityColors(maturity)
                const isAlt = rowIdx % 2 === 1
                rowIdx++
                rows.push(
                  <View key={`${constituent}-${layer}`} style={isAlt ? s.tableRowAlt : s.tableRow} wrap={false}>
                    <View style={s.tdWide}>
                      <Text style={[s.tdText, { fontSize: 8 }]}>{cLabel}</Text>
                    </View>
                    <View style={s.tdWide}>
                      <Text style={[s.tdText, { fontSize: 8 }]}>{lLabel}</Text>
                    </View>
                    <View style={s.tdWide}>
                      <View style={[s.badge, { backgroundColor: bg }]}>
                        <Text style={[s.badgeText, { color: text }]}>{maturity.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={s.tdWide}>
                      <Text style={[s.tdText, { fontSize: 8 }]}>{checked}/{cell.length}</Text>
                    </View>
                    <View style={s.tdWideLast}>
                      {staleCount > 0 ? (
                        <Text style={[s.tdText, { fontSize: 8, color: '#856404' }]}>⚠ {staleCount}</Text>
                      ) : (
                        <Text style={[s.tdText, { fontSize: 8, color: '#666666' }]}>—</Text>
                      )}
                    </View>
                  </View>
                )
              }
            }
            return rows
          })()}
        </View>

        {/* ── Sections 7-11: Evidence by constituent ── */}
        {CONSTITUENTS.map((constituent, ci) => {
          const items = evidence.filter(e => e.constituent === constituent)
          if (items.length === 0) return null
          const cLabel = CONSTITUENT_LABELS[constituent as Constituent] ?? constituent
          const sectionNum = ci + 7
          return (
            <View key={constituent}>
              <SectionTitle>{`${sectionNum}. ${cLabel}`}</SectionTitle>
              {items.map((item, ii) => {
                const layerLabel = LAYER_LABELS[item.layer as Layer] ?? item.layer
                const stale = isStale(item as ScoredItem)
                return (
                  <View key={ii} style={s.evidenceItem} wrap={false}>
                    <Text style={s.evidenceCheck}>{item.checked ? '✓' : '○'}</Text>
                    <View style={s.evidenceContent}>
                      <Text style={item.checked ? s.evidenceNameChecked : s.evidenceName}>
                        {item.label}
                        {stale ? ' ⚠' : ''}
                      </Text>
                      <Text style={s.evidenceType}>
                        {item.evidence_type.toUpperCase()} · {layerLabel}
                        {stale ? ' — RETEST OVERDUE' : ''}
                      </Text>
                      {item.thesis_ref && (
                        <Text style={s.evidenceRef}>Ref: {item.thesis_ref}</Text>
                      )}
                      {item.owasp_ref && (
                        <View style={s.owaspBadge}>
                          <Text style={s.owaspBadgeText}>OWASP {item.owasp_ref}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}

        {/* ── Section 12: LexArch compiled articles ── */}
        <SectionTitle>{`${CONSTITUENTS.length + 7}. LexArch Compiled Articles`}</SectionTitle>
        {lexarch.length === 0 ? (
          <Text style={s.italic}>
            No articles compiled yet. Use the LexArch compiler to map regulatory articles to this framework.
          </Text>
        ) : (
          lexarch.map((r, i) => (
            <View key={i} style={s.lexarchCard} wrap={false}>
              <Text style={s.lexarchTitle}>{r.control_name ?? 'Unnamed control'}</Text>
              <View style={s.lexarchMeta}>
                {r.layer && (
                  <View style={[s.badge, { backgroundColor: '#e8f0fe' }]}>
                    <Text style={[s.badgeText, { color: '#1a56db' }]}>
                      {LAYER_LABELS[r.layer as Layer] ?? r.layer}
                    </Text>
                  </View>
                )}
                {r.constituent && (
                  <View style={[s.badge, { backgroundColor: '#f3e8ff' }]}>
                    <Text style={[s.badgeText, { color: '#6b21a8' }]}>
                      {CONSTITUENT_LABELS[r.constituent as Constituent] ?? r.constituent}
                    </Text>
                  </View>
                )}
                {r.maturity_level && (() => {
                  const { bg, text } = getMaturityColors(r.maturity_level)
                  return (
                    <View style={[s.badge, { backgroundColor: bg }]}>
                      <Text style={[s.badgeText, { color: text }]}>{r.maturity_level}</Text>
                    </View>
                  )
                })()}
                {r.owasp_ref && (
                  <View style={s.owaspBadge}>
                    <Text style={s.owaspBadgeText}>OWASP {r.owasp_ref}</Text>
                  </View>
                )}
              </View>
              {r.thesis_ref && (
                <Text style={s.muted}>Ref: {r.thesis_ref}</Text>
              )}
              {r.article_text && (
                <Text style={s.lexarchSnippet}>
                  {r.article_text.slice(0, 200)}{r.article_text.length > 200 ? '…' : ''}
                </Text>
              )}
            </View>
          ))
        )}

        {/* ── Compliance Readiness Assessment ── */}
        <View style={s.complianceBox} wrap={false}>
          <Text style={s.complianceTitle}>Compliance Readiness Assessment</Text>
          {(() => {
            const score = system.maturity_score ?? 'ml1'
            const staleItems = evidence.filter(e => isStale(e as ScoredItem))
            if (score === 'ml3') {
              return (
                <View>
                  <Text style={[s.body, { color: '#155724', fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
                    Status: ML-3 DEFINED ✓
                  </Text>
                  <Text style={s.body}>
                    All layers have achieved ML-3 maturity. The system demonstrates documented,
                    regularly tested, and up-to-date evidence across all in-scope layers.
                  </Text>
                </View>
              )
            }
            if (score === 'ml2') {
              return (
                <View>
                  <Text style={[s.body, { color: '#856404', fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
                    Status: ML-2 MANAGED — Gaps identified
                  </Text>
                  <Text style={[s.body, { marginBottom: 6 }]}>
                    The system has established baseline evidence (ML-2) but has not yet achieved ML-3.
                    To reach ML-3:
                  </Text>
                  <BulletItem>Ensure EoE coverage ≥50% in all layers</BulletItem>
                  <BulletItem>Add at least one PoE item per layer</BulletItem>
                  {staleItems.length > 0 && (
                    <BulletItem>
                      {`Remediate ${staleItems.length} stale PoE item(s) that have exceeded their retest frequency`}
                    </BulletItem>
                  )}
                </View>
              )
            }
            return (
              <View>
                <Text style={[s.body, { color: '#721c24', fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
                  Status: ML-1 INITIAL — Action required
                </Text>
                <Text style={s.body}>
                  No evidence has been collected yet. Begin by checking off policies and procedures
                  (EoE items) in the Evidence Checklist to achieve ML-2, then add test results and
                  logs (PoE items) to progress toward ML-3.
                </Text>
              </View>
            )
          })()}
        </View>
      </Page>
    </Document>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export async function generateDossierPDF(data: DossierPDFData): Promise<Buffer> {
  const buffer = await renderToBuffer(<DossierPDFDocument {...data} />)
  return Buffer.from(buffer)
}
