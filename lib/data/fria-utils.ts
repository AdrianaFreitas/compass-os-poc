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
  { value: 'technical', label: 'Technical', description: 'Code, model, or infrastructure change' },
  { value: 'procedural', label: 'Procedural', description: 'Process or policy change' },
  { value: 'human_oversight', label: 'Human oversight', description: 'Manual review or approval step' },
  { value: 'transparency', label: 'Transparency', description: 'Disclosure, explanation, or notice' },
  { value: 'access_control', label: 'Access control', description: 'Restrict who can use or be affected by the system' },
]

export const MITIGATION_STATUS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'verified', label: 'Verified' },
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

// ─── Risk matrix ──────────────────────────────────────────────────────────────

const LIKELIHOOD_SCORE: Record<string, number> = {
  remote: 1,
  possible: 2,
  likely: 3,
  certain: 4,
}

const INTERFERENCE_SCORE: Record<string, number> = {
  none: 0,
  minor: 1,
  moderate: 2,
  severe: 3,
  absolute_violation: 4,
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export function calculateFRIAPriority(likelihood: string, interference: string): RiskLevel {
  const l = LIKELIHOOD_SCORE[likelihood] ?? 1
  const i = INTERFERENCE_SCORE[interference] ?? 0

  if (interference === 'absolute_violation') return 'critical'

  const score = l * i
  if (score >= 9) return 'critical'
  if (score >= 5) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
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
