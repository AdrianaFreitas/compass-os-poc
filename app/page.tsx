import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold tracking-tight text-white">
          COMPASS <span className="text-indigo-400">OS</span>
        </span>
        <span className="text-xs text-gray-500 font-mono">Proof of Concept</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono">
          EU AI Act · NIST AI RMF · ISO 42001 · OWASP LLM Top 10
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          AI Governance,<br />
          <span className="text-indigo-400">mapped and auditable.</span>
        </h1>

        <p className="text-gray-400 text-lg mb-10 max-w-xl">
          Register your AI system, classify its risk tier, map controls across jurisdictions,
          score your evidence maturity, and export a regulator-ready compliance dossier.
        </p>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Register new AI system
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* What it does */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full">
          {[
            {
              title: 'Risk Classification',
              desc: 'EU AI Act tier (Art. 5/6/50) + OWASP LLM threat model across 7 risk vectors.',
            },
            {
              title: 'Jurisdiction Mapping',
              desc: '10 universal + 4 divergent controls across EU, US, and China with artifact reuse.',
            },
            {
              title: 'Evidence Maturity',
              desc: '40+ controls scored ML-1 to ML-3 per IEC 62443 — deterministic, no AI scoring.',
            },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-lg border border-gray-800 bg-gray-900">
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-600">
        COMPASS OS — Master&apos;s thesis proof of concept · AI Governance Framework
      </footer>
    </div>
  )
}
