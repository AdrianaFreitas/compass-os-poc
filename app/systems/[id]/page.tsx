import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { LAYER_LABELS } from '@/lib/data/compass-controls'

const RISK_TIER_STYLES: Record<string, string> = {
  unacceptable: 'bg-red-500/10 border-red-500/30 text-red-400',
  high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  limited: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  minimal: 'bg-green-500/10 border-green-500/30 text-green-400',
}

const MATURITY_STYLES: Record<string, string> = {
  ml1: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
  ml2: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  ml3: 'bg-green-500/10 border-green-500/30 text-green-400',
}

const MODULES = [
  { href: 'classify', label: 'Risk Classification', desc: 'EU AI Act tier + OWASP threat model', icon: '⚖️' },
  { href: 'matrix', label: 'Jurisdiction Matrix', desc: 'EU · US · CN control overlap', icon: '🗺️' },
  { href: 'lexarch', label: 'LexArch Compiler', desc: 'Map regulatory articles to controls', icon: '📜' },
  { href: 'evidence', label: 'Evidence Checklist', desc: 'Maturity scoring across layers', icon: '✅' },
  { href: 'dossier', label: 'Compliance Dossier', desc: 'Export regulator-ready PDF', icon: '📋' },
]

export default async function SystemDashboard({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const { data: evidenceRows } = await supabase
    .from('evidence')
    .select('checked, constituent, layer')
    .eq('system_id', params.id)

  const total = evidenceRows?.length ?? 0
  const checked = evidenceRows?.filter(e => e.checked).length ?? 0
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0

  const riskStyle = RISK_TIER_STYLES[system.risk_tier ?? 'minimal']
  const maturityStyle = MATURITY_STYLES[system.maturity_score ?? 'ml1']

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
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${riskStyle}`}>
              {system.risk_tier?.replace('_', ' ').toUpperCase() ?? 'UNCLASSIFIED'} · {system.risk_article}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${maturityStyle}`}>
              {(system.maturity_score ?? 'ml1').toUpperCase()}
            </span>
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
              value: (system.jurisdictions as string[])?.map(j => j.toUpperCase()).join(' · ')
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

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(m => (
            <Link
              key={m.href}
              href={`/systems/${params.id}/${m.href}`}
              className="group p-5 bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl transition-colors"
            >
              <div className="text-2xl mb-3">{m.icon}</div>
              <div className="font-medium text-white group-hover:text-indigo-400 transition-colors mb-1">
                {m.label}
              </div>
              <div className="text-xs text-gray-500">{m.desc}</div>
            </Link>
          ))}
        </div>

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
                { label: 'Vendor status', value: system.vendor_assessment_status },
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
