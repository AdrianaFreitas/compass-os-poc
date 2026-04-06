'use client'

import { useState, useTransition } from 'react'
import { FUNDAMENTAL_RIGHTS } from '@/lib/data/fundamental-rights'
import {
  LIKELIHOOD_OPTIONS,
  INTERFERENCE_OPTIONS,
  SCOPE_OPTIONS,
  MITIGATION_TYPES,
  MITIGATION_STATUS,
  STAKEHOLDER_CATEGORIES,
  DEPLOYMENT_RECOMMENDATIONS,
  calculateFRIAPriority,
  RISK_LEVEL_STYLES,
  type FRIAContext,
  type FRIAScenario,
  type FRIAMitigation,
  type FRIADeployment,
  type FRIAStakeholder,
} from '@/lib/data/fria-utils'
import {
  saveContext,
  saveScenario,
  deleteScenario,
  saveMitigation,
  deleteMitigation,
  saveDeployment,
  saveStakeholder,
  deleteStakeholder,
} from '@/actions/fria'

type Tab = 'context' | 'scenarios' | 'deployment' | 'stakeholders'

interface Props {
  systemId: string
  initialContext: FRIAContext | null
  initialScenarios: FRIAScenario[]
  initialMitigations: FRIAMitigation[]
  initialDeployment: FRIADeployment | null
  initialStakeholders: FRIAStakeholder[]
}

const TAB_LABELS: { id: Tab; label: string; phase: string }[] = [
  { id: 'context', label: 'Phase 1 — Context', phase: 'Who, what, where' },
  { id: 'scenarios', label: 'Phase 2 — Impact', phase: 'Rights & scenarios' },
  { id: 'deployment', label: 'Phase 3 — Decision', phase: 'Deployment recommendation' },
  { id: 'stakeholders', label: 'Phase 5 — Stakeholders', phase: 'Consultation record' },
]

export function FriaClient({
  systemId,
  initialContext,
  initialScenarios,
  initialMitigations,
  initialDeployment,
  initialStakeholders,
}: Props) {
  const [tab, setTab] = useState<Tab>('context')
  const [context, setContext] = useState<Partial<FRIAContext>>(initialContext ?? {})
  const [scenarios, setScenarios] = useState<FRIAScenario[]>(initialScenarios)
  const [mitigations, setMitigations] = useState<FRIAMitigation[]>(initialMitigations)
  const [deployment, setDeployment] = useState<Partial<FRIADeployment>>(initialDeployment ?? {})
  const [stakeholders, setStakeholders] = useState<FRIAStakeholder[]>(initialStakeholders)

  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function flash(msg: string) {
    setSaved(msg)
    setTimeout(() => setSaved(null), 2500)
  }

  function handleError(e: unknown) {
    setError(e instanceof Error ? e.message : 'An error occurred')
    setTimeout(() => setError(null), 4000)
  }

  // ─── Context tab ─────────────────────────────────────────────────────────────

  function saveContextData() {
    startTransition(async () => {
      try {
        await saveContext({ ...context, system_id: systemId } as FRIAContext)
        flash('Context saved')
      } catch (e) {
        handleError(e)
      }
    })
  }

  // ─── Scenario management ─────────────────────────────────────────────────────

  const [showScenarioForm, setShowScenarioForm] = useState(false)
  const [editingScenario, setEditingScenario] = useState<Partial<FRIAScenario> | null>(null)
  const [selectedRightId, setSelectedRightId] = useState('')
  const [showMitigationForm, setShowMitigationForm] = useState<string | null>(null) // scenarioId
  const [editingMitigation, setEditingMitigation] = useState<Partial<FRIAMitigation> | null>(null)

  function openNewScenario() {
    setEditingScenario({
      system_id: systemId,
      likelihood: 'possible',
      interference_level: 'minor',
      scope: 'individual',
      absolute_right: false,
    })
    setSelectedRightId('')
    setShowScenarioForm(true)
  }

  function openEditScenario(s: FRIAScenario) {
    setEditingScenario({ ...s })
    setSelectedRightId(s.right_id)
    setShowScenarioForm(true)
  }

  function handleRightSelect(rightId: string) {
    const right = FUNDAMENTAL_RIGHTS.find(r => r.id === rightId)
    if (!right) return
    setSelectedRightId(rightId)
    setEditingScenario(prev => ({
      ...prev,
      right_id: right.id,
      right_name: `${right.article} — ${right.name}`,
      absolute_right: right.absolute,
    }))
  }

  function submitScenario() {
    if (!editingScenario?.right_id || !editingScenario.scenario_description) return
    const priority = calculateFRIAPriority(
      editingScenario.likelihood ?? 'possible',
      editingScenario.interference_level ?? 'minor',
    )
    const scenarioData: FRIAScenario = {
      ...editingScenario,
      priority_level: priority,
    } as FRIAScenario

    startTransition(async () => {
      try {
        const id = await saveScenario(scenarioData)
        setScenarios(prev => {
          const existing = prev.find(s => s.id === id)
          if (existing) return prev.map(s => s.id === id ? { ...scenarioData, id } : s)
          return [...prev, { ...scenarioData, id }]
        })
        setShowScenarioForm(false)
        setEditingScenario(null)
        flash('Scenario saved')
      } catch (e) {
        handleError(e)
      }
    })
  }

  function handleDeleteScenario(scenarioId: string) {
    startTransition(async () => {
      try {
        await deleteScenario(scenarioId)
        setScenarios(prev => prev.filter(s => s.id !== scenarioId))
        setMitigations(prev => prev.filter(m => m.scenario_id !== scenarioId))
        flash('Scenario deleted')
      } catch (e) {
        handleError(e)
      }
    })
  }

  function openNewMitigation(scenarioId: string) {
    setEditingMitigation({
      system_id: systemId,
      scenario_id: scenarioId,
      mitigation_type: 'technical',
      status: 'planned',
    })
    setShowMitigationForm(scenarioId)
  }

  function submitMitigation() {
    if (!editingMitigation?.description) return
    startTransition(async () => {
      try {
        const id = await saveMitigation(editingMitigation as FRIAMitigation)
        setMitigations(prev => {
          const existing = prev.find(m => m.id === id)
          if (existing) return prev.map(m => m.id === id ? { ...editingMitigation, id } as FRIAMitigation : m)
          return [...prev, { ...editingMitigation, id } as FRIAMitigation]
        })
        setShowMitigationForm(null)
        setEditingMitigation(null)
        flash('Mitigation saved')
      } catch (e) {
        handleError(e)
      }
    })
  }

  function handleDeleteMitigation(mitigationId: string) {
    startTransition(async () => {
      try {
        await deleteMitigation(mitigationId)
        setMitigations(prev => prev.filter(m => m.id !== mitigationId))
        flash('Mitigation removed')
      } catch (e) {
        handleError(e)
      }
    })
  }

  // ─── Deployment tab ───────────────────────────────────────────────────────────

  function saveDeploymentData() {
    startTransition(async () => {
      try {
        await saveDeployment({ ...deployment, system_id: systemId } as FRIADeployment)
        flash('Deployment decision saved')
      } catch (e) {
        handleError(e)
      }
    })
  }

  // ─── Stakeholders tab ─────────────────────────────────────────────────────────

  const [showStakeholderForm, setShowStakeholderForm] = useState(false)
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<FRIAStakeholder> | null>(null)

  function openNewStakeholder() {
    setEditingStakeholder({ system_id: systemId, category: 'affected_person' })
    setShowStakeholderForm(true)
  }

  function submitStakeholder() {
    if (!editingStakeholder?.name || !editingStakeholder.category) return
    startTransition(async () => {
      try {
        const id = await saveStakeholder(editingStakeholder as FRIAStakeholder)
        setStakeholders(prev => {
          const existing = prev.find(s => s.id === id)
          if (existing) return prev.map(s => s.id === id ? { ...editingStakeholder, id } as FRIAStakeholder : s)
          return [...prev, { ...editingStakeholder, id } as FRIAStakeholder]
        })
        setShowStakeholderForm(false)
        setEditingStakeholder(null)
        flash('Stakeholder saved')
      } catch (e) {
        handleError(e)
      }
    })
  }

  function handleDeleteStakeholder(stakeholderId: string) {
    startTransition(async () => {
      try {
        await deleteStakeholder(stakeholderId)
        setStakeholders(prev => prev.filter(s => s.id !== stakeholderId))
        flash('Stakeholder removed')
      } catch (e) {
        handleError(e)
      }
    })
  }

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const criticalCount = scenarios.filter(s => s.priority_level === 'critical').length
  const highCount = scenarios.filter(s => s.priority_level === 'high').length

  return (
    <div>
      {/* Status toasts */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 text-sm rounded-lg">
          {saved}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Rights assessed', value: scenarios.length.toString() },
          { label: 'Critical risks', value: criticalCount.toString() },
          { label: 'High risks', value: highCount.toString() },
          { label: 'Mitigations', value: mitigations.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
            <div className="text-sm font-medium text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {TAB_LABELS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              tab === t.id
                ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Phase 1: Context ───────────────────────────────────────────────────── */}
      {tab === 'context' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Phase 1 — Context Setting</h2>
            <p className="text-xs text-gray-500">Define the system purpose, affected populations, and assessment ownership.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Purpose description (in plain language)</label>
              <textarea
                rows={3}
                value={context.purpose_description ?? ''}
                onChange={e => setContext(c => ({ ...c, purpose_description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Describe what the system does and how it is used in plain language"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Deployment context</label>
              <textarea
                rows={2}
                value={context.deployment_context ?? ''}
                onChange={e => setContext(c => ({ ...c, deployment_context: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Where and how will it be deployed? Who are the operators?"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Affected populations</label>
              <textarea
                rows={2}
                value={context.affected_populations ?? ''}
                onChange={e => setContext(c => ({ ...c, affected_populations: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Who will be subject to or affected by the system's outputs?"
              />
            </div>
            {[
              { key: 'geographic_scope' as const, label: 'Geographic scope', placeholder: 'e.g. EU-wide, Germany, pilot in 3 cities' },
              { key: 'operator_name' as const, label: 'Deploying organisation', placeholder: 'Legal entity name' },
              { key: 'assessor_name' as const, label: 'FRIA assessor', placeholder: 'Name and role of the person conducting this FRIA' },
              { key: 'assessment_date' as const, label: 'Assessment date', placeholder: '', type: 'date' },
              { key: 'review_date' as const, label: 'Next review date', placeholder: '', type: 'date' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input
                  type={type ?? 'text'}
                  value={(context[key] as string) ?? ''}
                  onChange={e => setContext(c => ({ ...c, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveContextData}
            className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Save context
          </button>
        </div>
      )}

      {/* ── Phase 2: Impact Assessment ─────────────────────────────────────────── */}
      {tab === 'scenarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Phase 2 — Impact Assessment</h2>
              <p className="text-xs text-gray-500 mt-0.5">Map rights to interference scenarios and add mitigations.</p>
            </div>
            <button
              onClick={openNewScenario}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-sm rounded-lg transition-colors"
            >
              + Add scenario
            </button>
          </div>

          {/* Risk matrix legend */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Risk matrix</div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-gray-400 mb-1">
              {['Remote', 'Possible', 'Likely', 'Certain'].map(l => (
                <div key={l}>{l}</div>
              ))}
            </div>
            {['Severe', 'Moderate', 'Minor'].map((interference, ri) => (
              <div key={interference} className="grid grid-cols-4 gap-2 mb-1">
                {[1, 2, 3, 4].map(likelihood => {
                  const iScore = 3 - ri
                  const score = likelihood * iScore
                  const level = score >= 9 ? 'critical' : score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low'
                  return (
                    <div
                      key={likelihood}
                      className={`text-center py-1 rounded text-[10px] font-medium ${RISK_LEVEL_STYLES[level]}`}
                    >
                      {level}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Add/Edit scenario form */}
          {showScenarioForm && editingScenario && (
            <div className="p-5 bg-gray-900 border border-rose-500/30 rounded-xl space-y-4">
              <h3 className="text-sm font-medium text-white">{editingScenario.id ? 'Edit scenario' : 'New scenario'}</h3>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Fundamental right <span className="text-red-400">*</span></label>
                <select
                  value={selectedRightId}
                  onChange={e => handleRightSelect(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                >
                  <option value="">Select right...</option>
                  {['dignity', 'freedoms', 'equality', 'solidarity', 'citizens', 'justice'].map(cat => (
                    <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                      {FUNDAMENTAL_RIGHTS.filter(r => r.category === cat).map(r => (
                        <option key={r.id} value={r.id}>{r.article} — {r.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedRightId && (() => {
                  const right = FUNDAMENTAL_RIGHTS.find(r => r.id === selectedRightId)
                  if (!right) return null
                  return (
                    <p className="mt-1 text-xs text-gray-500">{right.aiRelevance}</p>
                  )
                })()}
                {editingScenario.absolute_right && (
                  <div className="mt-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    Absolute right — any violation is impermissible
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Scenario description <span className="text-red-400">*</span></label>
                <textarea
                  rows={3}
                  value={editingScenario.scenario_description ?? ''}
                  onChange={e => setEditingScenario(s => ({ ...s, scenario_description: e.target.value }))}
                  placeholder="Describe how the AI system could interfere with this right"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Likelihood</label>
                  <select
                    value={editingScenario.likelihood ?? 'possible'}
                    onChange={e => setEditingScenario(s => ({ ...s, likelihood: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    {LIKELIHOOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Interference level</label>
                  <select
                    value={editingScenario.interference_level ?? 'minor'}
                    onChange={e => setEditingScenario(s => ({ ...s, interference_level: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    {INTERFERENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Scope</label>
                  <select
                    value={editingScenario.scope ?? 'individual'}
                    onChange={e => setEditingScenario(s => ({ ...s, scope: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    {SCOPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {editingScenario.likelihood && editingScenario.interference_level && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Computed priority:</span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${
                    RISK_LEVEL_STYLES[calculateFRIAPriority(editingScenario.likelihood, editingScenario.interference_level)]
                  }`}>
                    {calculateFRIAPriority(editingScenario.likelihood, editingScenario.interference_level).toUpperCase()}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Justification / evidence</label>
                <textarea
                  rows={2}
                  value={editingScenario.justification ?? ''}
                  onChange={e => setEditingScenario(s => ({ ...s, justification: e.target.value }))}
                  placeholder="Why is this interference level justified or unjustified?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={submitScenario} className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-sm rounded-lg transition-colors">
                  Save scenario
                </button>
                <button onClick={() => { setShowScenarioForm(false); setEditingScenario(null) }} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Scenario list */}
          {scenarios.length === 0 && !showScenarioForm && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No scenarios yet — click &quot;Add scenario&quot; to assess a right
            </div>
          )}

          {scenarios.map(scenario => {
            const scenarioMitigations = mitigations.filter(m => m.scenario_id === scenario.id)
            const right = FUNDAMENTAL_RIGHTS.find(r => r.id === scenario.right_id)
            return (
              <div key={scenario.id} className={`bg-gray-900 border rounded-xl p-5 ${
                scenario.priority_level === 'critical' ? 'border-red-500/30' :
                scenario.priority_level === 'high' ? 'border-orange-500/30' :
                'border-gray-800'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-white">{scenario.right_name}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${RISK_LEVEL_STYLES[scenario.priority_level as keyof typeof RISK_LEVEL_STYLES]}`}>
                        {scenario.priority_level?.toUpperCase()}
                      </span>
                      {scenario.absolute_right && (
                        <span className="px-2 py-0.5 rounded-full border text-[10px] font-medium bg-red-500/10 border-red-500/30 text-red-400">
                          ABSOLUTE
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{scenario.scope} · {scenario.likelihood} · {scenario.interference_level}</span>
                    </div>
                    <p className="text-xs text-gray-400">{scenario.scenario_description}</p>
                    {right && <p className="text-xs text-gray-600 mt-1">{right.aiRelevance}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEditScenario(scenario)} className="text-xs text-gray-500 hover:text-white transition-colors">Edit</button>
                    <button onClick={() => handleDeleteScenario(scenario.id!)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </div>

                {/* Mitigations for this scenario */}
                <div className="pl-3 border-l border-gray-700 space-y-2">
                  {scenarioMitigations.map(m => (
                    <div key={m.id} className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-400">{m.mitigation_type} — </span>
                        <span className="text-xs text-white">{m.description}</span>
                        {m.owner && <span className="text-xs text-gray-500"> · {m.owner}</span>}
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                          m.status === 'verified' ? 'bg-green-500/10 text-green-400' :
                          m.status === 'implemented' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>{m.status}</span>
                      </div>
                      <button onClick={() => handleDeleteMitigation(m.id!)} className="text-[10px] text-gray-600 hover:text-red-400 flex-shrink-0">×</button>
                    </div>
                  ))}

                  {showMitigationForm === scenario.id && editingMitigation ? (
                    <div className="pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editingMitigation.mitigation_type ?? 'technical'}
                          onChange={e => setEditingMitigation(m => ({ ...m, mitigation_type: e.target.value }))}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                        >
                          {MITIGATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <select
                          value={editingMitigation.status ?? 'planned'}
                          onChange={e => setEditingMitigation(m => ({ ...m, status: e.target.value }))}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                        >
                          {MITIGATION_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={editingMitigation.description ?? ''}
                        onChange={e => setEditingMitigation(m => ({ ...m, description: e.target.value }))}
                        placeholder="Describe the mitigation measure"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingMitigation.owner ?? ''}
                        onChange={e => setEditingMitigation(m => ({ ...m, owner: e.target.value }))}
                        placeholder="Owner (team or role)"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={submitMitigation} className="px-3 py-1 bg-rose-600/70 hover:bg-rose-600 text-white text-xs rounded transition-colors">Save</button>
                        <button onClick={() => { setShowMitigationForm(null); setEditingMitigation(null) }} className="text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openNewMitigation(scenario.id!)}
                      className="text-xs text-gray-500 hover:text-rose-400 transition-colors"
                    >
                      + Add mitigation
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Phase 3: Deployment Decision ──────────────────────────────────────── */}
      {tab === 'deployment' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Phase 3 — Deployment Decision</h2>
            <p className="text-xs text-gray-500">Record the overall deployment recommendation and conditions.</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Deployment recommendation</label>
            <div className="space-y-2">
              {DEPLOYMENT_RECOMMENDATIONS.map(rec => (
                <label
                  key={rec.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    deployment.recommendation === rec.value
                      ? `${rec.style} border-opacity-60`
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="recommendation"
                    value={rec.value}
                    checked={deployment.recommendation === rec.value}
                    onChange={() => setDeployment(d => ({ ...d, recommendation: rec.value }))}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{rec.label}</div>
                    <div className="text-xs text-gray-400">{rec.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Rationale</label>
            <textarea
              rows={3}
              value={deployment.rationale ?? ''}
              onChange={e => setDeployment(d => ({ ...d, rationale: e.target.value }))}
              placeholder="Explain the basis for this recommendation"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Conditions (if any)</label>
            <textarea
              rows={2}
              value={deployment.conditions ?? ''}
              onChange={e => setDeployment(d => ({ ...d, conditions: e.target.value }))}
              placeholder="Conditions that must be met before or during deployment"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Approved by</label>
              <input
                type="text"
                value={deployment.approved_by ?? ''}
                onChange={e => setDeployment(d => ({ ...d, approved_by: e.target.value }))}
                placeholder="Name and role"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Approval date</label>
              <input
                type="date"
                value={deployment.approval_date ?? ''}
                onChange={e => setDeployment(d => ({ ...d, approval_date: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Next review date</label>
              <input
                type="date"
                value={deployment.next_review_date ?? ''}
                onChange={e => setDeployment(d => ({ ...d, next_review_date: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            onClick={saveDeploymentData}
            className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Save decision
          </button>
        </div>
      )}

      {/* ── Phase 5: Stakeholders ──────────────────────────────────────────────── */}
      {tab === 'stakeholders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Phase 5 — Stakeholder Consultation</h2>
              <p className="text-xs text-gray-500 mt-0.5">Record consultations with affected persons and relevant bodies.</p>
            </div>
            <button
              onClick={openNewStakeholder}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-sm rounded-lg transition-colors"
            >
              + Add stakeholder
            </button>
          </div>

          {showStakeholderForm && editingStakeholder && (
            <div className="p-5 bg-gray-900 border border-rose-500/30 rounded-xl space-y-4">
              <h3 className="text-sm font-medium text-white">New stakeholder consultation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select
                    value={editingStakeholder.category ?? 'affected_person'}
                    onChange={e => setEditingStakeholder(s => ({ ...s, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    {STAKEHOLDER_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={editingStakeholder.name ?? ''}
                    onChange={e => setEditingStakeholder(s => ({ ...s, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Organisation</label>
                  <input
                    type="text"
                    value={editingStakeholder.organisation ?? ''}
                    onChange={e => setEditingStakeholder(s => ({ ...s, organisation: e.target.value }))}
                    placeholder="Organisation name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Consultation date</label>
                  <input
                    type="date"
                    value={editingStakeholder.consultation_date ?? ''}
                    onChange={e => setEditingStakeholder(s => ({ ...s, consultation_date: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Role / involvement description</label>
                  <input
                    type="text"
                    value={editingStakeholder.role_description ?? ''}
                    onChange={e => setEditingStakeholder(s => ({ ...s, role_description: e.target.value }))}
                    placeholder="Their role in relation to the AI system"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Feedback summary</label>
                  <textarea
                    rows={2}
                    value={editingStakeholder.feedback_summary ?? ''}
                    onChange={e => setEditingStakeholder(s => ({ ...s, feedback_summary: e.target.value }))}
                    placeholder="Key points raised during consultation"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={submitStakeholder} className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-sm rounded-lg transition-colors">
                  Save
                </button>
                <button onClick={() => { setShowStakeholderForm(false); setEditingStakeholder(null) }} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {stakeholders.length === 0 && !showStakeholderForm && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No stakeholders recorded yet
            </div>
          )}

          {stakeholders.map(stakeholder => {
            const cat = STAKEHOLDER_CATEGORIES.find(c => c.value === stakeholder.category)
            return (
              <div key={stakeholder.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{stakeholder.name}</span>
                      {stakeholder.organisation && (
                        <span className="text-xs text-gray-500">{stakeholder.organisation}</span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-400">
                        {cat?.label ?? stakeholder.category}
                      </span>
                    </div>
                    {stakeholder.role_description && (
                      <p className="text-xs text-gray-400 mb-1">{stakeholder.role_description}</p>
                    )}
                    {stakeholder.feedback_summary && (
                      <p className="text-xs text-gray-500">{stakeholder.feedback_summary}</p>
                    )}
                    {stakeholder.consultation_date && (
                      <p className="text-xs text-gray-600 mt-1">Consulted: {stakeholder.consultation_date}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteStakeholder(stakeholder.id!)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
