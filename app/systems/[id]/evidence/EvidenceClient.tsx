'use client'

import { useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/db/supabase'
import {
  toggleEvidence,
  updateEvidenceDate,
  updateEvidenceNotes,
  updateEvidenceFileUrl,
  recalculateSystemMaturity,
} from '@/actions/evidence'
import {
  CONSTITUENT_LABELS,
  LAYER_LABELS,
  type Constituent,
  type Layer,
} from '@/lib/data/compass-controls'
import { buildHeatmap, isStale, type ScoredItem, type MaturityLevel } from '@/lib/utils'

const ALL_CONSTITUENTS: Constituent[] = [
  'data_governance', 'model_security', 'output_integrity', 'human_oversight', 'ethics_fairness',
]
const ALL_LAYERS: Layer[] = ['training', 'model', 'rag', 'orchestration', 'runtime']

const MATURITY_CELL: Record<MaturityLevel, string> = {
  ml1: 'bg-gray-800 text-gray-500',
  ml2: 'bg-blue-500/20 text-blue-300',
  ml3: 'bg-green-500/20 text-green-300',
}
const MATURITY_LABEL: Record<MaturityLevel, string> = {
  ml1: 'ML-1', ml2: 'ML-2', ml3: 'ML-3',
}

interface EvidenceRow {
  id: string
  constituent: string
  layer: string
  control_id: string
  evidence_type: string
  label: string
  checked: boolean
  file_url: string | null
  notes: string | null
  last_tested: string | null
  retest_frequency: string
  owasp_ref: string | null
  thesis_ref: string | null
}

interface Props {
  systemId: string
  initialItems: EvidenceRow[]
  layers: string[]
}

export default function EvidenceClient({ systemId, initialItems, layers }: Props) {
  const [items, setItems] = useState<EvidenceRow[]>(initialItems)
  const [openConstituent, setOpenConstituent] = useState<string | null>(ALL_CONSTITUENTS[0])
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const notesTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const activeLayers = ALL_LAYERS.filter(l => layers.includes(l))

  const heatmap = buildHeatmap(items as ScoredItem[], activeLayers, ALL_CONSTITUENTS)

  function updateItem(id: string, patch: Partial<EvidenceRow>) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  async function handleToggle(item: EvidenceRow) {
    const next = !item.checked
    updateItem(item.id, { checked: next })
    setSaving(s => ({ ...s, [item.id]: true }))
    await toggleEvidence(item.id, next)
    await recalculateSystemMaturity(systemId)
    setSaving(s => ({ ...s, [item.id]: false }))
  }

  async function handleDate(item: EvidenceRow, date: string) {
    updateItem(item.id, { last_tested: date })
    await updateEvidenceDate(item.id, date)
    await recalculateSystemMaturity(systemId)
  }

  function handleNotes(item: EvidenceRow, notes: string) {
    updateItem(item.id, { notes })
    clearTimeout(notesTimers.current[item.id])
    notesTimers.current[item.id] = setTimeout(() => {
      updateEvidenceNotes(item.id, notes)
    }, 800)
  }

  const handleFileUpload = useCallback(async (item: EvidenceRow, file: File) => {
    setSaving(s => ({ ...s, [item.id]: true }))
    const path = `${systemId}/${item.control_id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('evidence-files').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('evidence-files').getPublicUrl(path)
      updateItem(item.id, { file_url: urlData.publicUrl })
      await updateEvidenceFileUrl(item.id, urlData.publicUrl)
    }
    setSaving(s => ({ ...s, [item.id]: false }))
  }, [systemId])

  const total = items.length
  const checked = items.filter(i => i.checked).length
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Evidence Checklist</h1>
            <p className="text-sm text-gray-400">
              {checked} of {total} controls evidenced · {progress}% complete
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />EoE = policies/procedures</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />PoE = logs/tests/metrics</span>
          </div>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Maturity Heatmap */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Maturity Heatmap</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Header row */}
          <div
            className="grid border-b border-gray-800 bg-gray-950"
            style={{ gridTemplateColumns: `160px repeat(${activeLayers.length}, 1fr)` }}
          >
            <div className="p-2.5 text-xs text-gray-600" />
            {activeLayers.map(l => (
              <div key={l} className="p-2.5 text-center text-xs font-medium text-gray-400 border-l border-gray-800">
                {LAYER_LABELS[l]}
              </div>
            ))}
          </div>

          {ALL_CONSTITUENTS.map(constituent => (
            <div
              key={constituent}
              className="grid border-b border-gray-800 last:border-0"
              style={{ gridTemplateColumns: `160px repeat(${activeLayers.length}, 1fr)` }}
            >
              <div className="p-2.5 flex items-center">
                <span className="text-xs text-gray-400 leading-tight">{CONSTITUENT_LABELS[constituent]}</span>
              </div>
              {activeLayers.map(layer => {
                const key = `${constituent}:${layer}`
                const cell = heatmap[key]
                if (!cell) {
                  return (
                    <div key={layer} className="border-l border-gray-800 p-2.5 flex items-center justify-center">
                      <span className="text-xs text-gray-700">—</span>
                    </div>
                  )
                }
                return (
                  <div
                    key={layer}
                    className={`border-l border-gray-800 p-2.5 flex flex-col items-center justify-center gap-0.5 ${MATURITY_CELL[cell.maturity]} ${cell.hasStale ? 'ring-1 ring-inset ring-yellow-500/50' : ''}`}
                  >
                    <span className="text-xs font-bold">{MATURITY_LABEL[cell.maturity]}</span>
                    <span className="text-[10px] opacity-60">{cell.checked}/{cell.total}</span>
                    {cell.hasStale && <span className="text-[9px] text-yellow-400">⚠ stale</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-800" />ML-1 Initial</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/20" />ML-2 Managed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/20" />ML-3 Defined</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded ring-1 ring-yellow-500/50 bg-gray-800" />Stale PoE</span>
        </div>
      </section>

      {/* Evidence checklist by constituent */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Controls by Constituent</h2>

        {ALL_CONSTITUENTS.map(constituent => {
          const constituentItems = items.filter(i => i.constituent === constituent)
          if (constituentItems.length === 0) return null
          const cChecked = constituentItems.filter(i => i.checked).length
          const isOpen = openConstituent === constituent

          return (
            <div key={constituent} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenConstituent(isOpen ? null : constituent)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{CONSTITUENT_LABELS[constituent]}</span>
                  <span className="text-xs text-gray-500">{cChecked}/{constituentItems.length}</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-gray-800 divide-y divide-gray-800">
                  {constituentItems.map(item => {
                    const stale = isStale(item as ScoredItem)
                    return (
                      <div
                        key={item.id}
                        className={`px-5 py-4 ${item.checked ? 'bg-gray-900' : 'bg-gray-950'}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggle(item)}
                            disabled={saving[item.id]}
                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.checked
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-600 hover:border-indigo-500'
                            } ${saving[item.id] ? 'opacity-50' : ''}`}
                          >
                            {item.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className={`text-sm font-medium ${item.checked ? 'text-white' : 'text-gray-400'}`}>
                                {item.label}
                              </span>
                              <span className="text-[10px] font-mono text-gray-600">{item.control_id}</span>

                              {/* Layer badge */}
                              <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 text-[10px]">
                                {LAYER_LABELS[item.layer as Layer]}
                              </span>

                              {/* EoE/PoE badge */}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                item.evidence_type === 'eoe'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-green-500/10 text-green-400'
                              }`}>
                                {item.evidence_type === 'eoe' ? 'EoE' : 'PoE'}
                              </span>

                              {/* OWASP badge */}
                              {item.owasp_ref && (
                                <span className="px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono">
                                  OWASP {item.owasp_ref}
                                </span>
                              )}

                              {/* Stale warning */}
                              {stale && (
                                <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px]">
                                  ⚠ retest overdue
                                </span>
                              )}
                            </div>

                            {item.thesis_ref && (
                              <p className="text-[11px] text-gray-600 mb-2">{item.thesis_ref}</p>
                            )}

                            {/* PoE date picker */}
                            {item.evidence_type === 'poe' && (
                              <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs text-gray-500 flex-shrink-0">Last tested:</label>
                                <input
                                  type="date"
                                  value={item.last_tested ?? ''}
                                  onChange={e => handleDate(item, e.target.value)}
                                  className={`bg-gray-800 border rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                                    stale ? 'border-yellow-500/50' : 'border-gray-700'
                                  }`}
                                />
                                <span className="text-[10px] text-gray-600">({item.retest_frequency})</span>
                              </div>
                            )}

                            {/* EoE file upload */}
                            {item.evidence_type === 'eoe' && (
                              <div className="flex items-center gap-2 mb-2">
                                {item.file_url ? (
                                  <a
                                    href={item.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                                  >
                                    📎 View document
                                  </a>
                                ) : (
                                  <label className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                                    <span>📎 Upload document</span>
                                    <input
                                      type="file"
                                      className="sr-only"
                                      accept=".pdf,.docx,.doc,.xlsx,.pptx,.png,.jpg"
                                      onChange={e => {
                                        const file = e.target.files?.[0]
                                        if (file) handleFileUpload(item, file)
                                      }}
                                    />
                                  </label>
                                )}
                                {saving[item.id] && <span className="text-xs text-gray-500 animate-pulse">uploading...</span>}
                              </div>
                            )}

                            {/* Notes */}
                            <input
                              type="text"
                              value={item.notes ?? ''}
                              onChange={e => handleNotes(item, e.target.value)}
                              placeholder="Add notes..."
                              className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-gray-600 text-xs text-gray-400 placeholder-gray-700 py-0.5 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
