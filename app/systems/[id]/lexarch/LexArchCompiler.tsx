'use client'

import { useState } from 'react'
import { compileAndSave } from '@/actions/lexarch-save'
import { CONSTITUENT_LABELS, LAYER_LABELS } from '@/lib/data/compass-controls'

interface HistoryItem {
  id: string
  created_at: string
  article_text: string
  layer: string | null
  constituent: string | null
  control_name: string | null
  eoe_items: string[] | null
  poe_items: string[] | null
  maturity_level: string | null
  thesis_ref: string | null
  owasp_ref: string | null
}

interface Props {
  systemId: string
  initialHistory: HistoryItem[]
}

const EXAMPLE_ARTICLES = [
  {
    label: 'EU AI Act Art. 13 — Transparency',
    text: `Article 13 — Transparency and provision of information to deployers

1. High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret the system's output and use it appropriately. An appropriate type and degree of transparency shall be ensured with a view to achieving compliance with the relevant obligations of the provider and deployer set out in Chapter 3.

2. High-risk AI systems shall be accompanied by instructions for use in an appropriate digital format or otherwise that include concise, complete, correct and clear information that is relevant, accessible and comprehensible to deployers.`
  },
  {
    label: 'NIST AI RMF — GOVERN 1.1',
    text: `GOVERN 1.1: Policies, processes, procedures, and practices across the organization related to the mapping, measuring, and managing of AI risks are in place, transparent, and implemented effectively.

Organizations should establish and communicate policies, processes, and procedures for AI risk management. These should be consistent with the organization's broader enterprise risk management approach and should cover the full AI lifecycle, from design through decommission.`
  },
  {
    label: 'ISO 42001 §8.4 — AI System Documentation',
    text: `8.4 Documentation of AI systems

The organization shall document information about the AI system, including:
a) the purpose, intended use and context of use of the AI system;
b) the performance objectives and applicable constraints;
c) the data used for training and testing, including characteristics and provenance;
d) the AI system design, architecture and key decisions made during development;
e) the testing, validation and verification processes and results.`
  },
]

export default function LexArchCompiler({ systemId, initialHistory }: Props) {
  const [articleText, setArticleText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [expanded, setExpanded] = useState<string | null>(history[0]?.id ?? null)

  async function handleCompile() {
    if (!articleText.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await compileAndSave(systemId, articleText.trim())
      setHistory(h => [result, ...h])
      setExpanded(result.id)
      setArticleText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compilation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Try an example:</span>
          {EXAMPLE_ARTICLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => setArticleText(ex.text)}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <textarea
          value={articleText}
          onChange={e => setArticleText(e.target.value)}
          placeholder="Paste a regulatory article here — EU AI Act, NIST AI RMF, ISO 42001, GDPR, OWASP..."
          rows={7}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none font-mono"
        />

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{articleText.length} characters</span>
          <button
            onClick={handleCompile}
            disabled={loading || !articleText.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Compiling...
              </>
            ) : (
              <>
                <span>Compile with LexArch</span>
                <span className="text-purple-300 text-xs">↗ Claude</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results history */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Compiled articles ({history.length})
          </h3>

          {history.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Collapsed header */}
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full flex items-start gap-4 p-4 text-left hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {item.control_name && (
                      <span className="font-medium text-white text-sm">{item.control_name}</span>
                    )}
                    {item.maturity_level && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
                        {item.maturity_level}
                      </span>
                    )}
                    {item.owasp_ref && (
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
                        OWASP {item.owasp_ref}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {item.layer && (
                      <span>{LAYER_LABELS[item.layer as keyof typeof LAYER_LABELS] ?? item.layer}</span>
                    )}
                    {item.constituent && <span>·</span>}
                    {item.constituent && (
                      <span>{CONSTITUENT_LABELS[item.constituent as keyof typeof CONSTITUENT_LABELS] ?? item.constituent}</span>
                    )}
                    {item.thesis_ref && <span>· {item.thesis_ref}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === item.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-4">
                  {/* Article snippet */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Source article</div>
                    <p className="text-xs text-gray-400 font-mono bg-gray-800 rounded-lg p-3 line-clamp-4 whitespace-pre-wrap">
                      {item.article_text}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* EoE items */}
                    {item.eoe_items && (item.eoe_items as string[]).length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                          Evidence of Existence (EoE)
                        </div>
                        <ul className="space-y-1.5">
                          {(item.eoe_items as string[]).map((e, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                              <span className="text-blue-400 mt-0.5 flex-shrink-0">›</span>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* PoE items */}
                    {item.poe_items && (item.poe_items as string[]).length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                          Proof of Execution (PoE)
                        </div>
                        <ul className="space-y-1.5">
                          {(item.poe_items as string[]).map((e, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                              <span className="text-green-400 mt-0.5 flex-shrink-0">›</span>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {history.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-600 text-sm">
          No articles compiled yet. Paste a regulatory article above to get started.
        </div>
      )}
    </div>
  )
}
