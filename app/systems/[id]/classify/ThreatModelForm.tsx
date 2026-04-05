'use client'

import { useState } from 'react'
import { saveThreatAnswers } from '@/actions/threat'
import type { ThreatQuestion } from '@/lib/data/owasp-threat-questions'

interface Props {
  systemId: string
  questions: ThreatQuestion[]
  existingAnswers: Record<string, { answer: string; notes: string }>
}

export default function ThreatModelForm({ systemId, questions, existingAnswers }: Props) {
  const [answers, setAnswers] = useState<Record<string, { answer: string; notes: string }>>(() => {
    const init: Record<string, { answer: string; notes: string }> = {}
    questions.forEach(q => {
      init[q.id] = existingAnswers[q.id] ?? { answer: '', notes: '' }
    })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setField(id: string, field: 'answer' | 'notes', value: string) {
    setAnswers(a => ({ ...a, [id]: { ...a[id], [field]: value } }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await saveThreatAnswers(systemId, answers)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const answered = Object.values(answers).filter(a => a.answer.trim()).length

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const ans = answers[q.id]
        const hasAnswer = ans?.answer?.trim()
        return (
          <div
            key={q.id}
            className={`rounded-xl border p-5 transition-colors ${
              hasAnswer ? 'border-gray-700 bg-gray-900' : 'border-gray-800 bg-gray-900/50'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center font-mono">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-teal-400 border border-teal-500/30 bg-teal-500/10 px-1.5 py-0.5 rounded">
                    OWASP {q.owaspRef}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{q.airRef}</span>
                  <span className="text-xs text-gray-500">{q.category}</span>
                </div>
                <p className="text-sm text-white font-medium">{q.question}</p>
                <p className="text-xs text-gray-500 mt-1">{q.guidance}</p>
              </div>
            </div>

            <div className="space-y-3 ml-9">
              <textarea
                value={ans?.answer ?? ''}
                onChange={e => setField(q.id, 'answer', e.target.value)}
                placeholder="Describe your current controls and mitigations..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />
              <textarea
                value={ans?.notes ?? ''}
                onChange={e => setField(q.id, 'notes', e.target.value)}
                placeholder="Additional notes, gaps, or action items (optional)"
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 text-sm resize-none"
              />
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-gray-500">
          {answered} of {questions.length} vectors addressed
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving...
            </>
          ) : saved ? '✓ Saved' : 'Save answers'}
        </button>
      </div>
    </div>
  )
}
