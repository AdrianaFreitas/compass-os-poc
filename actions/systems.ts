'use server'

import { supabase } from '@/lib/db/supabase'
import { classifyRisk } from '@/lib/data/eu-ai-act-tree'
import { COMPASS_CONTROLS } from '@/lib/data/compass-controls'

export interface RegisterSystemInput {
  name: string
  purpose: string
  sector: string
  deployment_type: string
  jurisdictions: string[]
  layers: string[]
  base_model: string
  embedding_model: string
  vector_db: string
  orchestration_framework: string
  third_party_plugins: string[]
  vendor_name: string
  vendor_assessment_status: string
  vendor_last_audit: string
  fria_opted_in?: boolean
}

export async function registerSystem(input: RegisterSystemInput): Promise<string> {
  const classification = classifyRisk(input.purpose, input.sector)

  const { data: system, error: sysError } = await supabase
    .from('systems')
    .insert({
      name: input.name,
      purpose: input.purpose,
      sector: input.sector,
      deployment_type: input.deployment_type,
      jurisdictions: input.jurisdictions,
      layers: input.layers,
      risk_tier: classification.tier,
      risk_article: classification.article,
      base_model: input.base_model || null,
      embedding_model: input.embedding_model || null,
      vector_db: input.vector_db || null,
      orchestration_framework: input.orchestration_framework || null,
      third_party_plugins: input.third_party_plugins.length ? input.third_party_plugins : null,
      vendor_name: input.vendor_name || null,
      vendor_assessment_status: input.vendor_assessment_status || null,
      vendor_last_audit: input.vendor_last_audit || null,
      maturity_score: 'ml1',
      fria_opted_in: input.fria_opted_in ?? false,
    })
    .select('id')
    .single()

  if (sysError || !system) {
    throw new Error(sysError?.message ?? 'Failed to create system')
  }

  // Auto-seed evidence rows for all controls matching the selected layers
  const evidenceRows = COMPASS_CONTROLS
    .filter(c => input.layers.includes(c.layer))
    .map(c => ({
      system_id: system.id,
      constituent: c.constituent,
      layer: c.layer,
      control_id: c.id,
      evidence_type: c.evidenceType,
      label: c.label,
      checked: false,
      retest_frequency: c.retestFrequency,
      owasp_ref: c.owaspRef ?? null,
      thesis_ref: c.thesisRef,
    }))

  if (evidenceRows.length > 0) {
    const { error: evError } = await supabase.from('evidence').insert(evidenceRows)
    if (evError) throw new Error(evError.message)
  }

  return system.id
}
