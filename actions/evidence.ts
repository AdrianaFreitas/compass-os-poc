'use server'

import { supabase } from '@/lib/db/supabase'
import { calculateSystemMaturity } from '@/lib/utils'
import type { Layer } from '@/lib/data/compass-controls'

export async function toggleEvidence(id: string, checked: boolean) {
  await supabase.from('evidence').update({ checked, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function updateEvidenceDate(id: string, last_tested: string) {
  await supabase.from('evidence').update({ last_tested, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function updateEvidenceNotes(id: string, notes: string) {
  await supabase.from('evidence').update({ notes, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function updateEvidenceFileUrl(id: string, file_url: string) {
  await supabase.from('evidence').update({ file_url, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function recalculateSystemMaturity(systemId: string) {
  const { data: system } = await supabase
    .from('systems')
    .select('layers')
    .eq('id', systemId)
    .single()

  if (!system) return

  const { data: items } = await supabase
    .from('evidence')
    .select('evidence_type, retest_frequency, checked, last_tested, layer, constituent')
    .eq('system_id', systemId)

  if (!items) return

  const maturity = calculateSystemMaturity(items, system.layers as Layer[])
  await supabase.from('systems').update({ maturity_score: maturity }).eq('id', systemId)
}
