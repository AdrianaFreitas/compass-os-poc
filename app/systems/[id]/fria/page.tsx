import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { FriaClient } from './FriaClient'

export default async function FRIAPage({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('id, name, fria_opted_in, risk_tier, sector')
    .eq('id', params.id)
    .single()

  if (!system) notFound()
  if (!system.fria_opted_in) redirect(`/systems/${params.id}`)

  const [contextRes, scenariosRes, mitigationsRes, deploymentRes, stakeholdersRes] = await Promise.all([
    supabase.from('fria_context').select('*').eq('system_id', params.id).single(),
    supabase.from('fria_scenarios').select('*').eq('system_id', params.id).order('created_at'),
    supabase.from('fria_mitigations').select('*').eq('system_id', params.id).order('created_at'),
    supabase.from('fria_deployment').select('*').eq('system_id', params.id).single(),
    supabase.from('fria_stakeholders').select('*').eq('system_id', params.id).order('created_at'),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
          COMPASS OS
        </Link>
        <span className="text-gray-700">/</span>
        <Link href={`/systems/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm truncate">
          {system.name}
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white font-medium">FRIA</span>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">Fundamental Rights Impact Assessment</h1>
                <span className="px-2.5 py-0.5 rounded-full border text-xs font-medium bg-rose-500/10 border-rose-500/30 text-rose-400">
                  EU AI Act Art. 27
                </span>
              </div>
              <p className="text-gray-400 text-sm max-w-2xl">
                Assess the impact of this AI system on EU Charter of Fundamental Rights across all 24 rights.
                Based on the ECNL/DIHR FRIA Guide (Dec 2025).
              </p>
            </div>
            <a
              href={`/api/fria-pdf/${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export FRIA Report
            </a>
          </div>
        </div>

        <FriaClient
          systemId={params.id}
          initialContext={contextRes.data ?? null}
          initialScenarios={scenariosRes.data ?? []}
          initialMitigations={mitigationsRes.data ?? []}
          initialDeployment={deploymentRes.data ?? null}
          initialStakeholders={stakeholdersRes.data ?? []}
        />
      </main>
    </div>
  )
}
