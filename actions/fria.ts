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
