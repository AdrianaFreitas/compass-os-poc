'use server'

import { supabase } from '@/lib/db/supabase'

export async function saveThreatAnswers(
  systemId: string,
  answers: Record<string, { answer: string; notes: string }>
) {
  for (const [questionId, { answer, notes }] of Object.entries(answers)) {
    const { data: existing } = await supabase
      .from('threat_model')
      .select('id')
      .eq('system_id', systemId)
      .eq('question_id', questionId)
      .single()

    if (existing) {
      await supabase
        .from('threat_model')
        .update({ answer, notes })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('threat_model')
        .insert({ system_id: systemId, question_id: questionId, answer, notes })
    }
  }
}
