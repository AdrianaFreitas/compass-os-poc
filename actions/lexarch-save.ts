'use server'

import { compileArticle } from './lexarch'
import { supabase } from '@/lib/db/supabase'

export async function compileAndSave(systemId: string, articleText: string) {
  const result = await compileArticle(articleText)

  const { data, error } = await supabase
    .from('lexarch_results')
    .insert({
      system_id: systemId,
      article_text: articleText,
      layer: result.layer,
      constituent: result.constituent,
      control_name: result.controlName,
      eoe_items: result.eoeItems,
      poe_items: result.poeItems,
      maturity_level: result.maturityLevel,
      thesis_ref: result.thesisRef,
      owasp_ref: result.owaspRef || null,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to save result')

  return data
}
