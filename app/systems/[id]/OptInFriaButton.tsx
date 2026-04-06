'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { optInFria } from '@/actions/fria'

export function OptInFriaButton({ systemId }: { systemId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function handleOptIn() {
    startTransition(async () => {
      await optInFria(systemId)
      setDone(true)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleOptIn}
      disabled={pending || done}
      className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Enabling…' : 'Enable FRIA'}
    </button>
  )
}
