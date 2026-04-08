import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { LAYER_LABELS } from '@/lib/data/compass-controls'
import { calculateSystemMaturity, type ScoredItem } from '@/lib/utils'
import type { Layer } from '@/lib/data/compass-controls'
import { friaRecommended } from '@/lib/data/fundamental-rights'
import { FriaSectionClient } from './FriaSectionClient'

const RISK_TIER_STYLES: Record<string, string> = {
  unacceptable: 'bg-red-500/10 border-red-500/30 text-red-400',
  high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  limited: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  minimal: 'bg-green-500/10 border-green-500/30 text-green-400',
}

const MATURITY_STYLES: Record<string, { badge: string; label: string }> = {
  ml1: { badge: 'bg-red-500/10 border-red-500/30 text-red-400', label: 'ML-1 Initial' },
  ml2: { badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'ML-2 Managed' },
  ml3: { badge: 'bg-green-500/10 border-green-500/30 text-green-400', label: 'ML-3 Defined' },
}

const JURISDICTION_STYLES: Record<string, string> = {
  eu: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  us: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  cn: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
}

export default async function SystemDashboard({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const [evidenceRes, threatRes] = await Promise.all([
    supabase
      .from('evidence')
      .select('checked, constituent, layer, evidence_type, retest_frequency, last_tested')
      .eq('system_id', params.id),
    supabase
      .from('threat_model')
      .select('id')
      .eq('system_id', params.id),
  ])

  const evidenceRows = evidenceRes.data ?? []
  const threatCount = threatRes.data?.length ?? 0

  const total = evidenceRows.length
  const checked = evidenceRows.filter(e => e.checked).length
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0

  // Live maturity computed from evidence (Change 4)
  const liveMaturity = calculateSystemMaturity(evidenceRows as ScoredItem[], system.layers as Layer[])
  const maturityConfig = MATURITY_STYLES[liveMaturity]

  const riskStyle = RISK_TIER_STYLES[system.risk_tier ?? 'minimal']
  const jurisdictions = (system.jurisdictions as string[]) ?? []

  // Threat model badge (Change 3)
  const threatBadge =
    threatCount === 0
      ? { label: 'Threat model pending', style: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }
      : threatCount >= 7
      ? { label: 'Threat model complete', style: 'bg-green-500/10 border-green-500/30 text-green-400' }
      : { label: `${threatCount}/7 answered`, style: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }

  const friaRequired = friaRecommended(system.sector, system.risk_tier ?? 'minimal')
  const friaOptedIn = system.fria_opted_in as boolean

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
          COMPASS OS
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white font-medium truncate">{system.name}</span>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{system.name}</h1>

            {/* EU AI Act risk tier */}
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${riskStyle}`}>
              {system.risk_tier?.replace('_', ' ').toUpperCase() ?? 'UNCLASSIFIED'} · {system.risk_article}
            </span>

            {/* Live maturity badge (Change 4) */}
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${maturityConfig.badge}`}>
              {maturityConfig.label}
            </span>

            {/* Jurisdiction badges (Change 2) */}
            {jurisdictions.map(j => (
              <span
                key={j}
                className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${JURISDICTION_STYLES[j] ?? 'bg-gray-500/10 border-gray-500/30 text-gray-400'}`}
              >
                {j.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">{system.purpose}</p>
        </div>

        {/* System info strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Sector', value: system.sector },
            { label: 'Deployment', value: system.deployment_type?.toUpperCase() },
            {
              label: 'Jurisdictions',
              value: jurisdictions.map(j => j.toUpperCase()).join(' · '),
            },
            { label: 'Evidence', value: `${checked} / ${total} checked (${progress}%)` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              <div className="text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Layers in scope */}
        <div className="mb-8">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Layers in scope</div>
          <div className="flex flex-wrap gap-2">
            {(system.layers as string[])?.map(l => (
              <span key={l} className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs text-gray-300">
                {LAYER_LABELS[l as keyof typeof LAYER_LABELS] ?? l}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence progress bar */}
        {total > 0 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Evidence completion</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Module grid + FRIA card + callout — all managed client-side for optimistic UI */}
        <FriaSectionClient
          systemId={params.id}
          initialFriaOptedIn={friaOptedIn}
          friaRequired={friaRequired}
          threatBadge={threatBadge}
        />

        {/* AI SBoM section */}
        {(system.base_model || system.vendor_name) && (
          <div className="mt-8 p-5 bg-gray-900 border border-gray-800 rounded-xl">
            <h3 className="text-sm font-medium text-gray-300 mb-4">AI Software Bill of Materials</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Base model', value: system.base_model },
                { label: 'Embedding model', value: system.embedding_model },
                { label: 'Vector DB', value: system.vector_db },
                { label: 'Orchestration', value: system.orchestration_framework },
                { label: 'Vendor', value: system.vendor_name },
                { label: 'Vendor assessment', value: system.vendor_assessment_status },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                  <div className="text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
