import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import EvidenceClient from './EvidenceClient'

export default async function EvidencePage({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('name, layers, jurisdictions')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const { data: evidence } = await supabase
    .from('evidence')
    .select('*')
    .eq('system_id', params.id)
    .order('constituent')
    .order('layer')

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">COMPASS OS</Link>
        <span className="text-gray-700">/</span>
        <Link href={`/systems/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm truncate">{system.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white">Evidence Checklist</span>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <EvidenceClient
          systemId={params.id}
          initialItems={evidence ?? []}
          layers={system.layers as string[]}
        />

        <div className="flex justify-between pt-8 mt-8 border-t border-gray-800">
          <Link href={`/systems/${params.id}/lexarch`} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← LexArch Compiler
          </Link>
          <Link href={`/systems/${params.id}/dossier`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            Compliance Dossier →
          </Link>
        </div>
      </main>
    </div>
  )
}
