import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import LexArchCompiler from './LexArchCompiler'

export default async function LexArchPage({ params }: { params: { id: string } }) {
  const { data: system } = await supabase
    .from('systems')
    .select('name')
    .eq('id', params.id)
    .single()

  if (!system) notFound()

  const { data: history } = await supabase
    .from('lexarch_results')
    .select('*')
    .eq('system_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">COMPASS OS</Link>
        <span className="text-gray-700">/</span>
        <Link href={`/systems/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm truncate">{system.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-white">LexArch Compiler</span>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">LexArch Compiler</h1>
            <span className="px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono">
              Claude API
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Paste any regulatory article — EU AI Act, NIST, ISO 42001, GDPR — and LexArch maps it to the COMPASS control framework.
          </p>
        </div>

        <LexArchCompiler systemId={params.id} initialHistory={history ?? []} />

        <div className="flex justify-between pt-4 border-t border-gray-800">
          <Link href={`/systems/${params.id}/matrix`} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Jurisdiction Matrix
          </Link>
          <Link href={`/systems/${params.id}/evidence`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            Evidence Checklist →
          </Link>
        </div>
      </main>
    </div>
  )
}
