'use client'

import { useState } from 'react'

interface Props {
  systemName: string
  maturityScore: string
  riskTier: string
  riskArticle: string
  checkedControls: number
  totalControls: number
  pct: number
  markdown: string
  systemId: string
}

const MATURITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ml1: { label: 'ML-1 Initial', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  ml2: { label: 'ML-2 Managed', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  ml3: { label: 'ML-3 Defined', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
}

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  unacceptable: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  limited: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  minimal: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
}

function markdownToHtml(md: string): string {
  return md
    // h1
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-2">$1</h1>')
    // h2
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-8 mb-3 pb-2 border-b border-gray-700">$1</h2>')
    // h3
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-200 mt-5 mb-2">$1</h3>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    // italic
    .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
    // blockquote lines
    .replace(/^> (.+)$/gm, '<p class="text-sm text-gray-400 leading-relaxed">$1</p>')
    // horizontal rule
    .replace(/^---$/gm, '<hr class="border-gray-700 my-6" />')
    // table header separator
    .replace(/^\|[-| ]+\|$/gm, '')
    // table rows
    .replace(/^\|(.+)\|$/gm, (_, inner) => {
      const cells = inner.split('|').map((c: string) => c.trim())
      return `<tr class="border-b border-gray-800">${cells.map((c: string) =>
        `<td class="px-3 py-2 text-sm text-gray-300">${c}</td>`
      ).join('')}</tr>`
    })
    // wrap consecutive <tr> in a table
    .replace(/(<tr[\s\S]+?<\/tr>\n?)+/g, (match) =>
      `<table class="w-full border-collapse bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-4">${match}</table>`
    )
    // list items
    .replace(/^- (.+)$/gm, '<li class="text-sm text-gray-300 flex gap-2"><span class="text-gray-600 flex-shrink-0">›</span><span>$1</span></li>')
    .replace(/^  - (.+)$/gm, '<li class="text-xs text-gray-500 ml-4 flex gap-2"><span class="text-gray-700 flex-shrink-0">·</span><span>$1</span></li>')
    // wrap consecutive <li> in ul
    .replace(/(<li[\s\S]+?<\/li>\n?)+/g, (match) => `<ul class="space-y-1 mb-3">${match}</ul>`)
    // paragraphs (non-empty lines not already tagged)
    .replace(/^(?!<)(?!\n)(.+)$/gm, '<p class="text-sm text-gray-300 leading-relaxed mb-2">$1</p>')
    // blank lines
    .replace(/^\n$/gm, '')
}

export default function DossierPreview({
  systemName, maturityScore, riskTier, riskArticle,
  checkedControls, totalControls, pct, markdown, systemId
}: Props) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview')

  const maturity = MATURITY_CONFIG[maturityScore] ?? MATURITY_CONFIG.ml1
  const risk = RISK_CONFIG[riskTier] ?? RISK_CONFIG.minimal

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${systemName.replace(/\s+/g, '-').toLowerCase()}-dossier.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function printPdf() {
    window.open(`/api/dossier-pdf/${systemId}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Readiness strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${maturity.border} ${maturity.bg}`}>
          <div className="text-xs text-gray-500 mb-1">Overall maturity</div>
          <div className={`font-bold text-lg ${maturity.color}`}>{maturity.label}</div>
        </div>
        <div className={`p-4 rounded-xl border ${risk.border} ${risk.bg}`}>
          <div className="text-xs text-gray-500 mb-1">Risk tier</div>
          <div className={`font-bold ${risk.color}`}>{riskTier.replace('_', ' ').toUpperCase()}</div>
          <div className="text-xs text-gray-500">{riskArticle}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-700 bg-gray-900">
          <div className="text-xs text-gray-500 mb-1">Evidence</div>
          <div className="font-bold text-white">{checkedControls}/{totalControls}</div>
          <div className="text-xs text-gray-500">{pct}% complete</div>
        </div>
        <div className={`p-4 rounded-xl border ${pct === 100 ? 'border-green-500/30 bg-green-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
          <div className="text-xs text-gray-500 mb-1">Dossier status</div>
          <div className={`font-bold ${pct === 100 ? 'text-green-400' : 'text-amber-400'}`}>
            {pct === 100 ? '✓ Complete' : `${100 - pct}% remaining`}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Evidence completion</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Export bar */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          onClick={printPdf}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PDF
        </button>
        <button
          onClick={downloadMarkdown}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Markdown
        </button>
        <button
          onClick={copyMarkdown}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? '✓ Copied' : 'Copy Markdown'}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-gray-800 print:hidden">
        {(['preview', 'markdown'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              activeTab === tab
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dossier content */}
      {activeTab === 'preview' ? (
        <div
          id="dossier-content"
          className="prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
        />
      ) : (
        <pre className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-xs text-gray-300 font-mono overflow-auto whitespace-pre-wrap">
          {markdown}
        </pre>
      )}
    </div>
  )
}
