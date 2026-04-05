'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function SystemError({
  error, reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-4xl">⚠</div>
      <h1 className="text-xl font-semibold text-white mb-2">Failed to load</h1>
      <p className="text-gray-400 text-sm mb-6 max-w-sm">{error.message ?? 'Could not load this page.'}</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Try again</button>
        <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700">Home</Link>
      </div>
    </div>
  )
}
