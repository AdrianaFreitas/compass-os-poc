'use server'

import { supabase } from '@/lib/db/supabase'
import type {
  FRIAContext,
  FRIAScenario,
  FRIAMitigation,
  FRIADeployment,
  FRIAStakeholder,
} from '@/lib/data/fria-utils'

export async function optInFria(systemId: string): Promise<void> {
  const { error } = await supabase
    .from('systems')
    .update({ fria_opted_in: true })
    .eq('id', systemId)
  if (error) throw new Error(error.message)
}

export async function saveContext(data: FRIAContext): Promise<string> {
  const { system_id, ...fields } = data

  // Upsert — one context record per system
  const { data: existing } = await supabase
    .from('fria_context')
    .select('id')
    .eq('system_id', system_id)
    .single()

  if (existing?.id) {
    const { error } = await supabase
      .from('fria_context')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
    return existing.id
  }

  const { data: row, error } = await supabase
    .from('fria_context')
    .insert({ system_id, ...fields })
    .select('id')
    .single()
  if (error || !row) throw new Error(error?.message ?? 'Failed to save context')
  return row.id
}

export async function saveScenario(data: FRIAScenario): Promise<string> {
  const { id, ...fields } = data

  if (id) {
    const { error } = await supabase
      .from('fria_scenarios')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return id
  }

  const { data: row, error } = await supabase
    .from('fria_scenarios')
    .insert(fields)
    .select('id')
    .single()
  if (error || !row) throw new Error(error?.message ?? 'Failed to save scenario')
  return row.id
}

export async function deleteScenario(scenarioId: string): Promise<void> {
  const { error } = await supabase
    .from('fria_scenarios')
    .delete()
    .eq('id', scenarioId)
  if (error) throw new Error(error.message)
}

export async function saveMitigation(data: FRIAMitigation): Promise<string> {
  const { id, ...fields } = data

  if (id) {
    const { error } = await supabase
      .from('fria_mitigations')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return id
  }

  const { data: row, error } = await supabase
    .from('fria_mitigations')
    .insert(fields)
    .select('id')
    .single()
  if (error || !row) throw new Error(error?.message ?? 'Failed to save mitigation')
  return row.id
}

export async function deleteMitigation(mitigationId: string): Promise<void> {
  const { error } = await supabase
    .from('fria_mitigations')
    .delete()
    .eq('id', mitigationId)
  if (error) throw new Error(error.message)
}

export async function saveDeployment(data: FRIADeployment): Promise<string> {
  const { system_id, id, ...fields } = data

  if (id) {
    const { error } = await supabase
      .from('fria_deployment')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return id
  }

  // Upsert — one deployment record per system
  const { data: existing } = await supabase
    .from('fria_deployment')
    .select('id')
    .eq('system_id', system_id)
    .single()

  if (existing?.id) {
    const { error } = await supabase
      .from('fria_deployment')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
    return existing.id
  }

  const { data: row, error } = await supabase
    .from('fria_deployment')
    .insert({ system_id, ...fields })
    .select('id')
    .single()
  if (error || !row) throw new Error(error?.message ?? 'Failed to save deployment decision')
  return row.id
}

export async function saveStakeholder(data: FRIAStakeholder): Promise<string> {
  const { id, ...fields } = data

  if (id) {
    const { error } = await supabase
      .from('fria_stakeholders')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return id
  }

  const { data: row, error } = await supabase
    .from('fria_stakeholders')
    .insert(fields)
    .select('id')
    .single()
  if (error || !row) throw new Error(error?.message ?? 'Failed to save stakeholder')
  return row.id
}

export async function deleteStakeholder(stakeholderId: string): Promise<void> {
  const { error } = await supabase
    .from('fria_stakeholders')
    .delete()
    .eq('id', stakeholderId)
  if (error) throw new Error(error.message)
}

export async function saveScenarioGroup(
  systemId: string,
  base: {
    scenario_description: string
    likelihood: string
    interference_level: string
    scope: string
    justification: string
    priority_level: string
    affected_group?: string
    driving_factors?: string
    scenario_label?: string
    gravity_of_impact?: string
    irreversibility?: string
    power_imbalance?: string
  },
  rights: { rightId: string; rightName: string; absoluteRight: boolean }[],
  mitigationDrafts: { mitigation_type: string; description: string; status: string }[],
): Promise<{ scenarios: FRIAScenario[]; newMitigations: FRIAMitigation[] }> {
  // Get next scenario_number for this system
  const { data: maxRow } = await supabase
    .from('fria_scenarios')
    .select('scenario_number')
    .eq('system_id', systemId)
    .not('scenario_number', 'is', null)
    .order('scenario_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const scenarioNumber = (maxRow?.scenario_number ?? 0) + 1

  const rows = rights.map(r => ({
    system_id: systemId,
    right_id: r.rightId,
    right_name: r.rightName,
    absolute_right: r.absoluteRight,
    scenario_description: base.scenario_description,
    likelihood: base.likelihood,
    interference_level: base.interference_level,
    scope: base.scope,
    priority_level: base.priority_level,
    justification: base.justification,
    scenario_number: scenarioNumber,
    affected_group: base.affected_group || null,
    driving_factors: base.driving_factors || null,
    scenario_label: base.scenario_label || null,
    gravity_of_impact: base.gravity_of_impact || null,
    irreversibility: base.irreversibility || null,
    power_imbalance: base.power_imbalance || null,
  }))

  const { data: inserted, error } = await supabase
    .from('fria_scenarios')
    .insert(rows)
    .select('*')

  if (error || !inserted?.length) throw new Error(error?.message ?? 'Failed to save scenario group')

  let newMitigations: FRIAMitigation[] = []
  const validDrafts = mitigationDrafts.filter(m => m.description.trim())
  if (validDrafts.length > 0) {
    const firstId = inserted[0].id
    const mitRows = validDrafts.map(m => ({
      system_id: systemId,
      scenario_id: firstId,
      mitigation_type: m.mitigation_type,
      description: m.description,
      status: m.status,
    }))
    const { data: mitInserted, error: mitError } = await supabase
      .from('fria_mitigations')
      .insert(mitRows)
      .select('*')
    if (mitError) throw new Error(mitError.message)
    newMitigations = (mitInserted ?? []) as FRIAMitigation[]
  }

  return { scenarios: inserted as FRIAScenario[], newMitigations }
}

export async function deleteScenarioGroup(
  systemId: string,
  scenarioNumber: number | null,
  fallbackId: string,
): Promise<void> {
  if (scenarioNumber != null) {
    const { error } = await supabase
      .from('fria_scenarios')
      .delete()
      .eq('system_id', systemId)
      .eq('scenario_number', scenarioNumber)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('fria_scenarios')
      .delete()
      .eq('id', fallbackId)
    if (error) throw new Error(error.message)
  }
}
