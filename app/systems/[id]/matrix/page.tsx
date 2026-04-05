import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { UNIVERSAL_RISKS, DIVERGENT_CONTROLS, ARTIFACT_REUSE_MAPPINGS } from '@/lib/data/overlap-matrix'

const J_LABELS: Record<string, string> = { eu: 'EU', us: 'US', cn: 'CN' }
const J_COLORS: Record<string, string> = {
  eu: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  us: 'bg-red-500/10 border-red-500/30 text-red-400',
  cn: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
}
const J_DOT: Record<string, string> = {
  eu: 'bg-blue-400',
  us: 'bg-red-400',
  cn: 'bg-yellow-400',
}

export default async function MatrixPage({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('name, jurisdictions')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const jurisdictions = (system.jurisdictions as string[]) ?? ['eu']

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">COMPASS OS</Link>
        <span className="text-gray-700">/</span>
        <Link href={`/systems/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm truncate">{system.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white">Jurisdiction Matrix</span>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-10">

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-white">Jurisdiction Overlap Matrix</h1>
            <div className="flex gap-2">
              {jurisdictions.map(j => (
                <span key={j} className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${J_COLORS[j]}`}>
                  {J_LABELS[j]}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            HCD — Highest Common Denominator controls that satisfy multiple jurisdictions simultaneously. Evidence collected once, applied across all applicable frameworks.
          </p>
        </div>

        {/* Universal risks table */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Universal Controls
            </h2>
            <span className="px-2 py-0.5 rounded border border-gray-700 text-gray-400 text-xs">
              10 controls · identical across all jurisdictions
            </span>
          </div>

          <div className="rounded-xl border border-gray-800 overflow-hidden">
            {/* Table header */}
            <div className="grid bg-gray-900 border-b border-gray-800 px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <span>Control</span>
              <span className="text-blue-400">EU</span>
              <span className="text-red-400">US</span>
              <span className="text-yellow-400">CN</span>
            </div>

            {UNIVERSAL_RISKS.map((risk, i) => (
              <div
                key={risk.id}
                className={`grid px-4 py-3.5 text-sm gap-4 ${i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/50'} border-b border-gray-800/50 last:border-0`}
                style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}
              >
                <div>
                  <div className="font-medium text-white">{risk.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{risk.description}</div>
                </div>
                <div className={`text-xs font-mono ${jurisdictions.includes('eu') ? 'text-blue-400' : 'text-gray-600'}`}>
                  {risk.eu}
                </div>
                <div className={`text-xs font-mono ${jurisdictions.includes('us') ? 'text-red-400' : 'text-gray-600'}`}>
                  {risk.us}
                </div>
                <div className={`text-xs font-mono ${jurisdictions.includes('cn') ? 'text-yellow-400' : 'text-gray-600'}`}>
                  {risk.cn}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divergent controls */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Divergent Controls
            </h2>
            <span className="px-2 py-0.5 rounded border border-gray-700 text-gray-400 text-xs">
              4 controls · jurisdiction-specific
            </span>
          </div>

          <div className="space-y-3">
            {DIVERGENT_CONTROLS.map(control => {
              const isInScope = control.jurisdictions.some(j => jurisdictions.includes(j))
              return (
                <div
                  key={control.id}
                  className={`rounded-xl border p-4 ${isInScope ? 'border-gray-700 bg-gray-900' : 'border-gray-800 bg-gray-900/30 opacity-50'}`}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">{control.name}</span>
                        {!isInScope && (
                          <span className="text-xs text-gray-500 italic">not in scope for your jurisdictions</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{control.note}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {(['eu', 'us', 'cn'] as const).map(j => {
                        const applies = control.jurisdictions.includes(j)
                        return (
                          <div
                            key={j}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${
                              applies
                                ? J_COLORS[j]
                                : 'border-gray-800 text-gray-700'
                            }`}
                          >
                            {J_LABELS[j]}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Artifact reuse */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Artifact Reuse Mappings
            </h2>
            <span className="px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs">
              collect once, apply everywhere
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(ARTIFACT_REUSE_MAPPINGS).map(([artifact, satisfies]) => (
              <div key={artifact} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="font-medium text-white text-sm mb-2">{artifact}</div>
                <div className="text-xs text-gray-500 mb-2.5">Also satisfies:</div>
                <div className="flex flex-wrap gap-1.5">
                  {satisfies.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HCD summary for selected jurisdictions */}
        {jurisdictions.length > 1 && (
          <section>
            <div className="bg-gray-900 border border-indigo-500/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">
                HCD Efficiency for your selection ({jurisdictions.map(j => J_LABELS[j]).join(' + ')})
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                All 10 universal controls apply across your selected jurisdictions. A single evidence artifact satisfying one framework simultaneously satisfies the others.
              </p>
              <div className="flex flex-wrap gap-2">
                {jurisdictions.map(j => (
                  <div key={j} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${J_DOT[j]}`} />
                    <span className="text-xs text-gray-400">{J_LABELS[j]} — {
                      j === 'eu' ? 'EU AI Act + GDPR + CRA' :
                      j === 'us' ? 'NIST AI RMF + EO 14110' :
                      'AIGCS + PIPL + TC260'
                    }</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-between pt-4 border-t border-gray-800">
          <Link href={`/systems/${params.id}/classify`} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Risk Classification
          </Link>
          <Link href={`/systems/${params.id}/lexarch`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            LexArch Compiler →
          </Link>
        </div>
      </main>
    </div>
  )
}
