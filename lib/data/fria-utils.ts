// FRIA utility types and helpers
// Source: ECNL/DIHR FRIA Guide (Dec 2025), EU AI Act Art. 27

import type { FUNDAMENTAL_RIGHTS } from './fundamental-rights'

// ─── Option sets ──────────────────────────────────────────────────────────────

export const LIKELIHOOD_OPTIONS = [
  { value: 'remote', label: 'Remote', description: 'Unlikely to occur under normal use' },
  { value: 'possible', label: 'Possible', description: 'Could occur in some circumstances' },
  { value: 'likely', label: 'Likely', description: 'Expected to occur in many cases' },
  { value: 'certain', label: 'Certain', description: 'Will occur in standard operation' },
]

export const INTERFERENCE_OPTIONS = [
  { value: 'none', label: 'None', description: 'No interference with the right' },
  { value: 'minor', label: 'Minor', description: 'Limited, proportionate restriction' },
  { value: 'moderate', label: 'Moderate', description: 'Significant restriction requiring justification' },
  { value: 'severe', label: 'Severe', description: 'Serious impairment of the right' },
  { value: 'absolute_violation', label: 'Absolute violation', description: 'Infringes an absolute right — deployment must stop' },
]

export const SCOPE_OPTIONS = [
  { value: 'individual', label: 'Individual', description: 'Affects specific identified persons' },
  { value: 'group', label: 'Group', description: 'Affects a defined sub-population or category' },
  { value: 'regional', label: 'Regional', description: 'Affects persons within a geographic region' },
  { value: 'broad', label: 'Broad', description: 'Affects a large or undefined population' },
]

export const LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const MITIGATION_TYPES = [
  { value: 'organisational', label: 'Organisational', description: 'Policy, process, or governance change' },
  { value: 'technical', label: 'Technical', description: 'Code, model, or infrastructure change' },
  { value: 'contractual', label: 'Contractual', description: 'Binding obligation on deployer or provider' },
]

export const MITIGATION_STATUS = [
  { value: 'planned', label: 'Planned' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'monitored', label: 'Monitored' },
]

export const GRAVITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Limited or reversible harm' },
  { value: 'medium', label: 'Medium', description: 'Material or moderate psychological harm' },
  { value: 'high', label: 'High', description: 'Physical harm or severe psychological harm' },
]

export const IRREVERSIBILITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Easily reversed — situation can be restored' },
  { value: 'medium', label: 'Medium', description: 'Reversible with significant effort or time' },
  { value: 'high', label: 'High', description: 'Permanent or very difficult to reverse' },
]

export const POWER_IMBALANCE_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Roughly equal standing between parties' },
  { value: 'medium', label: 'Medium', description: 'Noticeable power difference' },
  { value: 'high', label: 'High', description: 'e.g. state authority vs welfare recipient, bank vs loan applicant' },
]

export const SCENARIO_LABEL_OPTIONS = [
  { value: 'typical', label: 'Typical', description: 'Expected conditions of use' },
  { value: 'worst_case', label: 'Worst case', description: 'Unexpected or cumulative impacts' },
]

export const STAKEHOLDER_CATEGORIES = [
  { value: 'deployer', label: 'Deployer', description: 'Organisation deploying the system' },
  { value: 'affected_person', label: 'Affected person', description: 'Natural person subject to the AI system' },
  { value: 'civil_society', label: 'Civil society', description: 'NGOs, advocacy groups, community organisations' },
  { value: 'regulator', label: 'Regulator', description: 'Competent authority or supervisory body' },
  { value: 'dpa', label: 'Data protection authority', description: 'National DPA or supervisory authority' },
  { value: 'employee_rep', label: 'Employee representative', description: 'Works council, trade union, or equivalent' },
  { value: 'expert', label: 'Independent expert', description: 'External specialist (legal, technical, ethics)' },
]

export const DEPLOYMENT_RECOMMENDATIONS = [
  {
    value: 'proceed',
    label: 'Proceed',
    description: 'No fundamental rights concerns — deployment approved',
    style: 'bg-green-500/10 border-green-500/30 text-green-400',
  },
  {
    value: 'proceed_with_conditions',
    label: 'Proceed with conditions',
    description: 'Deployment approved subject to stated mitigations being in place',
    style: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    value: 'suspend_pending_mitigations',
    label: 'Suspend pending mitigations',
    description: 'Do not deploy until identified mitigations are verified',
    style: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  },
  {
    value: 'do_not_deploy',
    label: 'Do not deploy',
    description: 'Fundamental rights impact is disproportionate — deployment must not proceed',
    style: 'bg-red-500/10 border-red-500/30 text-red-400',
  },
]

// ─── Risk matrix — ECNL/DIHR FRIA formula ────────────────────────────────────

const INTERFERENCE_SCORE: Record<string, number> = {
  none: 0,
  minor: 1,
  moderate: 2,
  severe: 3,
  absolute_violation: 4,
}

const SCOPE_SCORE: Record<string, number> = {
  individual: 1,
  group: 2,
  regional: 2,
  broad: 3,
}

const LEVEL_SCORE: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * ECNL/DIHR FRIA Guide (Dec 2025) priority formula.
 * F = extent of interference score.
 * additionalSum = scope + gravity + irreversibility + power imbalance scores.
 */
export function calculateFRIAPriority(
  interference: string,
  scope: string,
  gravity: string,
  irreversibility: string,
  powerImbalance: string,
): RiskLevel {
  if (interference === 'absolute_violation') return 'critical'

  const F = INTERFERENCE_SCORE[interference] ?? 0
  const additionalSum =
    (SCOPE_SCORE[scope] ?? 0) +
    (LEVEL_SCORE[gravity] ?? 0) +
    (LEVEL_SCORE[irreversibility] ?? 0) +
    (LEVEL_SCORE[powerImbalance] ?? 0)

  if (F === 3) return 'high'
  if (additionalSum > 9) return 'high'
  if (F === 1 && additionalSum >= 1 && additionalSum <= 4) return 'low'
  return 'medium'
}

export const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  low: 'bg-green-500/10 border-green-500/30 text-green-400',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  high: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  critical: 'bg-red-500/10 border-red-500/30 text-red-400',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type FundamentalRight = (typeof FUNDAMENTAL_RIGHTS)[number]

export interface FRIAContext {
  id?: string
  system_id: string
  purpose_description: string
  deployment_context: string
  affected_populations: string
  geographic_scope: string
  operator_name: string
  assessor_name: string
  assessment_date: string
  review_date: string
}

export interface FRIAScenario {
  id?: string
  system_id: string
  right_id: string
  right_name: string
  scenario_description: string
  likelihood: string
  interference_level: string
  scope: string
  priority_level: string
  justification: string
  absolute_right: boolean
  scenario_number?: number | null
  // Art. 27 / ECNL template fields
  affected_group?: string | null
  driving_factors?: string | null
  scenario_label?: string | null
  gravity_of_impact?: string | null
  irreversibility?: string | null
  power_imbalance?: string | null
}

export interface FRIAMitigation {
  id?: string
  system_id: string
  scenario_id: string
  mitigation_type: string
  description: string
  owner: string
  deadline: string
  status: string
  verification_method: string
}

export interface FRIADeployment {
  id?: string
  system_id: string
  recommendation: string
  rationale: string
  conditions: string
  approved_by: string
  approval_date: string
  next_review_date: string
}

export interface FRIAStakeholder {
  id?: string
  system_id: string
  category: string
  name: string
  organisation: string
  role_description: string
  consultation_date: string
  feedback_summary: string
}
