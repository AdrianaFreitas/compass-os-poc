import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'

// ─── Data types ────────────────────────────────────────────────────────────────

export interface FRIAPDFContext {
  purpose_description: string | null
  deployment_context: string | null
  affected_populations: string | null
  geographic_scope: string | null
  operator_name: string | null
  assessor_name: string | null
  assessment_date: string | null
  review_date: string | null
}

export interface FRIAPDFScenario {
  id: string
  right_name: string
  scenario_description: string
  likelihood: string
  interference_level: string
  scope: string
  priority_level: string
  justification: string | null
  absolute_right: boolean
  scenario_number: number | null
}

export interface FRIAPDFMitigation {
  scenario_id: string
  mitigation_type: string
  description: string
  owner: string | null
  status: string
}

export interface FRIAPDFDeployment {
  recommendation: string | null
  rationale: string | null
  conditions: string | null
  approved_by: string | null
  approval_date: string | null
  next_review_date: string | null
}

export interface FRIAPDFStakeholder {
  category: string
  name: string
  organisation: string | null
  role_description: string | null
  consultation_date: string | null
  feedback_summary: string | null
}

export interface FRIAPDFData {
  systemName: string
  generatedDate: string
  context: FRIAPDFContext | null
  scenarios: FRIAPDFScenario[]
  mitigations: FRIAPDFMitigation[]
  deployment: FRIAPDFDeployment | null
  stakeholders: FRIAPDFStakeholder[]
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 50,
    paddingRight: 50,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1pt solid #E5E7EB',
    paddingBottom: 8,
  },
  headerText: { fontSize: 8, color: '#9CA3AF' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: '#9CA3AF' },

  // Cover
  coverPage: {
    backgroundColor: '#FFFFFF',
    paddingTop: 80,
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 60,
  },
  coverBadge: {
    backgroundColor: '#FFF1F2',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  coverBadgeText: { fontSize: 9, color: '#BE123C', fontFamily: 'Helvetica-Bold' },
  coverTitle: { fontSize: 28, color: '#111827', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  coverSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 6 },
  coverSystem: { fontSize: 11, color: '#374151', marginBottom: 32 },
  coverMeta: { fontSize: 9, color: '#9CA3AF', marginBottom: 40 },

  metricGrid: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    border: '1pt solid #E5E7EB',
    borderRadius: 6,
    padding: 12,
  },
  metricLabel: { fontSize: 8, color: '#6B7280', marginBottom: 4 },
  metricValue: { fontSize: 20, color: '#111827', fontFamily: 'Helvetica-Bold' },

  // Sections
  sectionHeader: {
    backgroundColor: '#FFF1F2',
    borderLeft: '3pt solid #E11D48',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 11, color: '#111827', fontFamily: 'Helvetica-Bold' },
  sectionSubtitle: { fontSize: 8, color: '#6B7280', marginTop: 2 },

  // Table
  table: { border: '1pt solid #E5E7EB', borderRadius: 4, marginBottom: 10 },
  tableRow: { flexDirection: 'row', borderBottom: '1pt solid #F3F4F6' },
  tableRowLast: { flexDirection: 'row' },
  tableLabel: { width: '35%', backgroundColor: '#F9FAFB', padding: '6 8', fontSize: 8, color: '#6B7280' },
  tableValue: { flex: 1, padding: '6 8', fontSize: 8, color: '#111827' },

  // Scenario card
  scenarioCard: {
    border: '1pt solid #E5E7EB',
    borderRadius: 4,
    marginBottom: 10,
    padding: 10,
  },
  scenarioCardCritical: {
    border: '1pt solid #FECACA',
    backgroundColor: '#FFF5F5',
    borderRadius: 4,
    marginBottom: 10,
    padding: 10,
  },
  scenarioCardHigh: {
    border: '1pt solid #FED7AA',
    backgroundColor: '#FFFBF5',
    borderRadius: 4,
    marginBottom: 10,
    padding: 10,
  },
  scenarioRightRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4, flexWrap: 'wrap' },
  scenarioRightName: { fontSize: 9, color: '#111827', fontFamily: 'Helvetica-Bold' },
  absoluteBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 7,
    color: '#991B1B',
  },
  priorityBadge: {
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  scenarioMeta: { fontSize: 8, color: '#6B7280', marginBottom: 4 },
  scenarioDesc: { fontSize: 8, color: '#374151', marginBottom: 4 },
  scenarioJustif: { fontSize: 7, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 4 },

  // Mitigation
  mitigationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 3,
    borderTop: '1pt solid #F3F4F6',
  },
  mitigationBullet: { fontSize: 8, color: '#E11D48', marginTop: 1 },
  mitigationText: { flex: 1, fontSize: 7, color: '#374151' },
  statusBadge: {
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 7,
  },

  // Stakeholder
  stakeholderCard: {
    border: '1pt solid #E5E7EB',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  stakeholderName: { fontSize: 9, color: '#111827', fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  stakeholderMeta: { fontSize: 8, color: '#6B7280', marginBottom: 2 },
  stakeholderFeedback: { fontSize: 7, color: '#374151', fontStyle: 'italic' },

  // Deployment decision
  deploymentBox: {
    border: '1pt solid #E5E7EB',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  deploymentRec: { fontSize: 12, color: '#111827', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  deploymentText: { fontSize: 8, color: '#374151', marginBottom: 6 },
  deploymentMeta: { fontSize: 8, color: '#6B7280' },

  // Generic
  bodyText: { fontSize: 8, color: '#374151', marginBottom: 6 },
  smallText: { fontSize: 7, color: '#9CA3AF' },
  divider: { borderBottom: '1pt solid #F3F4F6', marginVertical: 8 },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityStyle(level: string): Record<string, string | number> {
  switch (level) {
    case 'critical': return { backgroundColor: '#FEE2E2', color: '#991B1B' }
    case 'high': return { backgroundColor: '#FFEDD5', color: '#9A3412' }
    case 'medium': return { backgroundColor: '#FEF9C3', color: '#713F12' }
    default: return { backgroundColor: '#DCFCE7', color: '#14532D' }
  }
}

function statusStyle(status: string): Record<string, string | number> {
  switch (status) {
    case 'verified': return { backgroundColor: '#DCFCE7', color: '#14532D' }
    case 'implemented': return { backgroundColor: '#DBEAFE', color: '#1E3A8A' }
    case 'in_progress': return { backgroundColor: '#FEF9C3', color: '#713F12' }
    default: return { backgroundColor: '#F3F4F6', color: '#6B7280' }
  }
}

function deploymentStyle(rec: string): Record<string, string | number> {
  switch (rec) {
    case 'proceed': return { borderLeft: '3pt solid #16A34A', backgroundColor: '#F0FDF4' }
    case 'proceed_with_conditions': return { borderLeft: '3pt solid #D97706', backgroundColor: '#FFFBEB' }
    case 'suspend_pending_mitigations': return { borderLeft: '3pt solid #EA580C', backgroundColor: '#FFF7ED' }
    case 'do_not_deploy': return { borderLeft: '3pt solid #DC2626', backgroundColor: '#FEF2F2' }
    default: return {}
  }
}

function deploymentLabel(rec: string): string {
  switch (rec) {
    case 'proceed': return 'Proceed'
    case 'proceed_with_conditions': return 'Proceed with conditions'
    case 'suspend_pending_mitigations': return 'Suspend pending mitigations'
    case 'do_not_deploy': return 'Do not deploy'
    default: return rec
  }
}

function groupScenarios(scenarios: FRIAPDFScenario[]): FRIAPDFScenario[][] {
  const groups = new Map<string, FRIAPDFScenario[]>()
  for (const s of scenarios) {
    const key = s.scenario_number != null ? `sn-${s.scenario_number}` : `id-${s.id}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }
  return Array.from(groups.values())
}

function getGroupPriority(group: FRIAPDFScenario[]): string {
  const order = ['low', 'medium', 'high', 'critical']
  return group.reduce((max, s) => {
    return order.indexOf(s.priority_level) > order.indexOf(max) ? s.priority_level : max
  }, 'low')
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

function PageWrapper({ children, systemName, generatedDate, pageNumber }: {
  children: React.ReactNode
  systemName: string
  generatedDate: string
  pageNumber?: number
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <Text style={styles.headerText}>COMPASS OS — Fundamental Rights Impact Assessment</Text>
        <Text style={styles.headerText}>{systemName}</Text>
      </View>
      {children}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>EU AI Act Art. 27 · ECNL/DIHR FRIA Guide (Dec 2025)</Text>
        <Text style={styles.footerText}>
          {pageNumber !== undefined ? `Page ${pageNumber}` : ''}
          {'  '}Generated {generatedDate}
        </Text>
      </View>
    </Page>
  )
}

// ─── Cover page ───────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: FRIAPDFData }) {
  const scenarioGroups = groupScenarios(data.scenarios)
  const criticalCount = scenarioGroups.filter(g => getGroupPriority(g) === 'critical').length

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBadge}>
        <Text style={styles.coverBadgeText}>EU AI ACT ART. 27</Text>
      </View>

      <Text style={styles.coverTitle}>Fundamental Rights</Text>
      <Text style={styles.coverTitle}>Impact Assessment</Text>
      <View style={{ marginBottom: 4 }} />
      <Text style={styles.coverSubtitle}>{data.systemName}</Text>
      <Text style={styles.coverMeta}>
        Generated {data.generatedDate}{'  '}·{'  '}ECNL/DIHR FRIA Guide (Dec 2025)
      </Text>

      {/* Metric cards */}
      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Scenarios assessed</Text>
          <Text style={styles.metricValue}>{scenarioGroups.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Rights examined</Text>
          <Text style={styles.metricValue}>{data.scenarios.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Critical risks</Text>
          <Text style={[styles.metricValue, { color: criticalCount > 0 ? '#DC2626' : '#111827' }]}>
            {criticalCount}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Mitigations</Text>
          <Text style={styles.metricValue}>{data.mitigations.length}</Text>
        </View>
      </View>

      {/* Deployment recommendation on cover */}
      {data.deployment?.recommendation && (
        <View style={{ marginTop: 20, ...deploymentStyle(data.deployment.recommendation), borderRadius: 4, padding: 12 }}>
          <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 4 }}>Deployment decision</Text>
          <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'Helvetica-Bold' }}>
            {deploymentLabel(data.deployment.recommendation)}
          </Text>
          {data.deployment.approved_by && (
            <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 4 }}>
              Approved by: {data.deployment.approved_by}
              {data.deployment.approval_date ? `  ·  ${data.deployment.approval_date}` : ''}
            </Text>
          )}
        </View>
      )}

      {/* Assessor info */}
      {(data.context?.assessor_name || data.context?.assessment_date) && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.smallText}>
            Assessor: {data.context?.assessor_name ?? '—'}
            {'  '}·{'  '}
            Assessment date: {data.context?.assessment_date ?? '—'}
            {'  '}·{'  '}
            Next review: {data.context?.review_date ?? '—'}
          </Text>
        </View>
      )}
    </Page>
  )
}

// ─── Context section ──────────────────────────────────────────────────────────

function ContextSection({ ctx }: { ctx: FRIAPDFContext }) {
  const rows = [
    { label: 'Purpose description', value: ctx.purpose_description },
    { label: 'Deployment context', value: ctx.deployment_context },
    { label: 'Affected populations', value: ctx.affected_populations },
    { label: 'Geographic scope', value: ctx.geographic_scope },
    { label: 'Deploying organisation', value: ctx.operator_name },
    { label: 'FRIA assessor', value: ctx.assessor_name },
    { label: 'Assessment date', value: ctx.assessment_date },
    { label: 'Next review date', value: ctx.review_date },
  ].filter(r => r.value)

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phase 1 — Context Setting</Text>
        <Text style={styles.sectionSubtitle}>System purpose, affected populations, and assessment ownership</Text>
      </View>
      <View style={styles.table}>
        {rows.map((row, i) => (
          <View key={row.label} style={i < rows.length - 1 ? styles.tableRow : styles.tableRowLast}>
            <Text style={styles.tableLabel}>{row.label}</Text>
            <Text style={styles.tableValue}>{row.value ?? '—'}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Scenarios section ────────────────────────────────────────────────────────

function ScenariosSection({ scenarios, mitigations }: { scenarios: FRIAPDFScenario[]; mitigations: FRIAPDFMitigation[] }) {
  const groups = groupScenarios(scenarios)

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phase 2 — Impact Assessment</Text>
        <Text style={styles.sectionSubtitle}>
          {groups.length} scenario{groups.length !== 1 ? 's' : ''} assessed across {scenarios.length} fundamental right{scenarios.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {groups.map((group, gi) => {
        const first = group[0]
        const priority = getGroupPriority(group)
        const groupMitigations = mitigations.filter(m => group.some(s => s.id === m.scenario_id))
        const cardStyle = priority === 'critical' ? styles.scenarioCardCritical :
          priority === 'high' ? styles.scenarioCardHigh : styles.scenarioCard

        return (
          <View key={gi} style={cardStyle}>
            {/* Rights */}
            <View style={styles.scenarioRightRow}>
              {group.map((s, si) => (
                <View key={si} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.scenarioRightName}>{s.right_name}</Text>
                  {s.absolute_right && (
                    <Text style={styles.absoluteBadge}>ABSOLUTE</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Priority + metadata */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Text style={[styles.priorityBadge, priorityStyle(priority)]}>
                {priority.toUpperCase()}
              </Text>
              <Text style={styles.scenarioMeta}>
                {first.scope} · {first.likelihood} likelihood · {first.interference_level} interference
              </Text>
            </View>

            <Text style={styles.scenarioDesc}>{first.scenario_description}</Text>
            {first.justification && (
              <Text style={styles.scenarioJustif}>{first.justification}</Text>
            )}

            {/* Mitigations */}
            {groupMitigations.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 3, fontFamily: 'Helvetica-Bold' }}>
                  Mitigation measures ({groupMitigations.length})
                </Text>
                {groupMitigations.map((m, mi) => (
                  <View key={mi} style={styles.mitigationRow}>
                    <Text style={styles.mitigationBullet}>›</Text>
                    <Text style={styles.mitigationText}>
                      [{m.mitigation_type}] {m.description}
                      {m.owner ? `  · ${m.owner}` : ''}
                    </Text>
                    <Text style={[styles.statusBadge, statusStyle(m.status)]}>
                      {m.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ─── Deployment section ───────────────────────────────────────────────────────

function DeploymentSection({ dep }: { dep: FRIAPDFDeployment }) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phase 3 — Deployment Decision</Text>
        <Text style={styles.sectionSubtitle}>Overall deployment recommendation and conditions</Text>
      </View>

      {dep.recommendation && (
        <View style={[styles.deploymentBox, deploymentStyle(dep.recommendation)]}>
          <Text style={styles.deploymentRec}>{deploymentLabel(dep.recommendation)}</Text>
          {dep.rationale && <Text style={styles.deploymentText}>{dep.rationale}</Text>}
          {dep.conditions && (
            <View>
              <Text style={{ fontSize: 8, color: '#6B7280', fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>
                Conditions:
              </Text>
              <Text style={styles.deploymentText}>{dep.conditions}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <Text style={styles.deploymentMeta}>
            Approved by: {dep.approved_by ?? '—'}
            {'  '}·{'  '}
            Approval date: {dep.approval_date ?? '—'}
            {'  '}·{'  '}
            Next review: {dep.next_review_date ?? '—'}
          </Text>
        </View>
      )}
      {!dep.recommendation && (
        <Text style={styles.bodyText}>No deployment decision recorded.</Text>
      )}
    </View>
  )
}

// ─── Stakeholders section ──────────────────────────────────────────────────────

function StakeholdersSection({ stakeholders }: { stakeholders: FRIAPDFStakeholder[] }) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phase 5 — Stakeholder Consultation</Text>
        <Text style={styles.sectionSubtitle}>{stakeholders.length} consultation{stakeholders.length !== 1 ? 's' : ''} recorded</Text>
      </View>

      {stakeholders.length === 0 && (
        <Text style={styles.bodyText}>No stakeholder consultations recorded.</Text>
      )}

      {stakeholders.map((s, i) => (
        <View key={i} style={styles.stakeholderCard}>
          <Text style={styles.stakeholderName}>
            {s.name}
            {s.organisation ? `  ·  ${s.organisation}` : ''}
          </Text>
          <Text style={styles.stakeholderMeta}>
            {s.category}
            {s.consultation_date ? `  ·  Consulted ${s.consultation_date}` : ''}
          </Text>
          {s.role_description && (
            <Text style={styles.stakeholderMeta}>{s.role_description}</Text>
          )}
          {s.feedback_summary && (
            <Text style={styles.stakeholderFeedback}>{s.feedback_summary}</Text>
          )}
        </View>
      ))}
    </View>
  )
}

// ─── Main document ────────────────────────────────────────────────────────────

function FRIAPDFDocument({ data }: { data: FRIAPDFData }) {
  return (
    <Document
      title={`FRIA — ${data.systemName}`}
      author="COMPASS OS"
      subject="Fundamental Rights Impact Assessment"
    >
      <CoverPage data={data} />

      <PageWrapper systemName={data.systemName} generatedDate={data.generatedDate}>
        {data.context && <ContextSection ctx={data.context} />}
        {data.scenarios.length > 0 && (
          <ScenariosSection scenarios={data.scenarios} mitigations={data.mitigations} />
        )}
        {data.deployment && <DeploymentSection dep={data.deployment} />}
        {data.stakeholders.length > 0 && (
          <StakeholdersSection stakeholders={data.stakeholders} />
        )}
      </PageWrapper>
    </Document>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function generateFRIAPDF(data: FRIAPDFData): Promise<Buffer> {
  return renderToBuffer(<FRIAPDFDocument data={data} />) as Promise<Buffer>
}
