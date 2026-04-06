import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { generateDossierMarkdown } from '@/lib/dossier-generator'
import DossierPreview from './DossierPreview'

export default async function DossierPage({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const [evidenceRes, threatRes, lexarchRes, friaContextRes, friaScenariosRes, friaDeploymentRes] = await Promise.all([
    supabase.from('evidence').select('*').eq('system_id', params.id).order('constituent').order('layer'),
    supabase.from('threat_model').select('*').eq('system_id', params.id),
    supabase.from('lexarch_results').select('*').eq('system_id', params.id).order('created_at', { ascending: false }),
    system.fria_opted_in
      ? supabase.from('fria_context').select('*').eq('system_id', params.id).single()
      : Promise.resolve({ data: null }),
    system.fria_opted_in
      ? supabase.from('fria_scenarios').select('*').eq('system_id', params.id).order('created_at')
      : Promise.resolve({ data: [] }),
    system.fria_opted_in
      ? supabase.from('fria_deployment').select('*').eq('system_id', params.id).single()
      : Promise.resolve({ data: null }),
  ])

  const evidence = evidenceRes.data ?? []
  const threats = threatRes.data ?? []
  const lexarch = lexarchRes.data ?? []
  const friaContext = friaContextRes.data ?? null
  const friaScenarios = (friaScenariosRes.data ?? []) as unknown[]
  const friaDeployment = friaDeploymentRes.data ?? null

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const markdown = generateDossierMarkdown(
    system,
    evidence,
    threats,
    lexarch,
    generatedDate,
    friaContext,
    friaScenarios as Parameters<typeof generateDossierMarkdown>[6],
    friaDeployment,
  )

  const totalControls = evidence.length
  const checkedControls = evidence.filter(e => e.checked).length
  const pct = totalControls > 0 ? Math.round((checkedControls / totalControls) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4 print:hidden">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">COMPASS OS</Link>
        <span className="text-gray-700">/</span>
        <Link href={`/systems/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm truncate">{system.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white">Compliance Dossier</span>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <DossierPreview
          systemName={system.name}
          maturityScore={system.maturity_score ?? 'ml1'}
          riskTier={system.risk_tier ?? 'minimal'}
          riskArticle={system.risk_article ?? ''}
          checkedControls={checkedControls}
          totalControls={totalControls}
          pct={pct}
          markdown={markdown}
          systemId={params.id}
        />

        <div className="flex justify-between pt-8 mt-8 border-t border-gray-800 print:hidden">
          <Link href={`/systems/${params.id}/evidence`} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Evidence Checklist
          </Link>
          <Link href={`/systems/${params.id}`} className="text-sm text-gray-400 hover:text-white transition-colors">
            Dashboard →
          </Link>
        </div>
      </main>
    </div>
  )
}
