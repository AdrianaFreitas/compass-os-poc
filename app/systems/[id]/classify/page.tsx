import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { classifyRisk } from '@/lib/data/eu-ai-act-tree'
import { OWASP_THREAT_QUESTIONS } from '@/lib/data/owasp-threat-questions'
import ThreatModelForm from './ThreatModelForm'

const TIER_CONFIG = {
  unacceptable: {
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    badge: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: '🚫',
  },
  high: {
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    icon: '⚠️',
  },
  limited: {
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    badge: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    icon: '⚡',
  },
  minimal: {
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    badge: 'bg-green-500/10 border-green-500/30 text-green-400',
    icon: '✅',
  },
}

export default async function ClassifyPage({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const classification = classifyRisk(system.purpose, system.sector)
  const config = TIER_CONFIG[classification.tier]

  const { data: existingAnswers } = await supabase
    .from('threat_model')
    .select('*')
    .eq('system_id', params.id)

  const answersMap: Record<string, { answer: string; notes: string }> = {}
  existingAnswers?.forEach(a => {
    answersMap[a.question_id] = { answer: a.answer ?? '', notes: a.notes ?? '' }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">COMPASS OS</Link>
        <span className="text-gray-700">/</span>
        <Link href={`/systems/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm truncate">{system.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white">Risk Classification</span>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-10">

        {/* EU AI Act Classification */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            EU AI Act — Risk Classification
          </h2>

          <div className={`rounded-xl border p-6 ${config.border} ${config.bg}`}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{config.icon}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className={`text-xl font-bold ${config.color}`}>{classification.label}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-mono ${config.badge}`}>
                    {classification.article}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-4">{classification.description}</p>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Obligations</div>
                  <ul className="space-y-1.5">
                    {classification.obligations.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`mt-0.5 flex-shrink-0 ${config.color}`}>›</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Context summary */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">Purpose</div>
              <div className="text-sm text-white line-clamp-2">{system.purpose}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">Sector</div>
              <div className="text-sm text-white">{system.sector}</div>
            </div>
          </div>
        </section>

        {/* OWASP Threat Model */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              OWASP LLM Top 10 — Threat Model
            </h2>
            <span className="px-2 py-0.5 rounded border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-mono">
              7 vectors
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Answer each threat vector. Responses are saved to your system record and referenced in the compliance dossier.
          </p>

          <ThreatModelForm
            systemId={params.id}
            questions={OWASP_THREAT_QUESTIONS}
            existingAnswers={answersMap}
          />
        </section>

        <div className="flex justify-between pt-4 border-t border-gray-800">
          <Link
            href={`/systems/${params.id}`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <Link
            href={`/systems/${params.id}/matrix`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Jurisdiction Matrix →
          </Link>
        </div>
      </main>
    </div>
  )
}
