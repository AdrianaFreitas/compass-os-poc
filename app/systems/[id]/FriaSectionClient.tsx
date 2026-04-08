'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { optInFria } from '@/actions/fria'

interface BadgeConfig {
  label: string
  style: string
}

interface Props {
  systemId: string
  initialFriaOptedIn: boolean
  friaRequired: boolean
  threatBadge: BadgeConfig
}

const MODULE_ICONS: Record<string, string> = {
  classify: '⚖️',
  matrix: '🗺️',
  lexarch: '📜',
  evidence: '✅',
  dossier: '📋',
}

const STATIC_MODULES = [
  { href: 'classify', label: 'Risk Classification', desc: 'EU AI Act tier + OWASP threat model' },
  { href: 'matrix', label: 'Jurisdiction Matrix', desc: 'EU · US · CN control overlap' },
  { href: 'lexarch', label: 'LexArch Compiler', desc: 'Map regulatory articles to controls' },
  { href: 'evidence', label: 'Evidence Checklist', desc: 'Maturity scoring across layers' },
  { href: 'dossier', label: 'Compliance Dossier', desc: 'Export regulator-ready PDF' },
]

export function FriaSectionClient({
  systemId,
  initialFriaOptedIn,
  friaRequired,
  threatBadge,
}: Props) {
  const [friaEnabled, setFriaEnabled] = useState(initialFriaOptedIn)
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleOptIn() {
    // Optimistic update — card appears and callout disappears immediately
    setFriaEnabled(true)
    startTransition(async () => {
      await optInFria(systemId)
      router.refresh()
    })
  }

  return (
    <>
      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATIC_MODULES.map(m => (
          <Link
            key={m.href}
            href={`/systems/${systemId}/${m.href}`}
            className="group p-5 bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl transition-colors"
          >
            <div className="text-2xl mb-3">{MODULE_ICONS[m.href]}</div>
            <div className="font-medium text-white group-hover:text-indigo-400 transition-colors mb-1">
              {m.label}
            </div>
            <div className="text-xs text-gray-500 mb-2">{m.desc}</div>
            {m.href === 'classify' && (
              <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${threatBadge.style}`}>
                {threatBadge.label}
              </span>
            )}
          </Link>
        ))}

        {/* FRIA card — appears optimistically on enable */}
        {friaEnabled && (
          <Link
            href={`/systems/${systemId}/fria`}
            className="group p-5 bg-gray-900 border border-rose-500/30 hover:border-rose-500/60 rounded-xl transition-colors"
          >
            <div className="text-2xl mb-3">⚖️</div>
            <div className="font-medium text-white group-hover:text-rose-400 transition-colors mb-1">
              FRIA
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Fundamental Rights Impact Assessment · EU AI Act Art. 27
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium bg-rose-500/10 border-rose-500/30 text-rose-400">
              Art. 27
            </span>
          </Link>
        )}
      </div>

      {/* FRIA callout — disappears the instant friaEnabled becomes true */}
      {!friaEnabled && friaRequired && (
        <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
          <div className="text-amber-400 text-xl flex-shrink-0">!</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-amber-300 mb-1">
              Fundamental Rights Impact Assessment recommended
            </div>
            <p className="text-xs text-gray-400">
              EU AI Act Art. 27 requires deployers in high-risk sectors to conduct a FRIA before
              deployment. Enable it to assess impacts across 24 EU Charter rights.
            </p>
          </div>
          <button
            onClick={handleOptIn}
            disabled={pending}
            className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Enabling…' : 'Enable FRIA'}
          </button>
        </div>
      )}
    </>
  )
}
