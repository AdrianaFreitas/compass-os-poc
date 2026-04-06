'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSystem } from '@/actions/systems'

const SECTORS = [
  'Banking & Finance (BFSI)',
  'Healthcare & Medical',
  'Public Sector & Government',
  'Law Enforcement & Border Control',
  'Human Resources & Recruitment',
  'Education & Vocational Training',
  'Critical Infrastructure',
  'Retail & E-commerce',
  'Legal & Compliance',
  'Media & Content',
  'Technology & Software',
  'Other',
]

const DEPLOYMENT_TYPES = [
  { value: 'type1', label: 'Type 1 — Direct Access', desc: 'ChatGPT, Perplexity — low supply chain risk' },
  { value: 'type2', label: 'Type 2 — Model API', desc: 'Claude, GPT-4, Gemini — medium supply chain risk' },
  { value: 'type3', label: 'Type 3 — Licensed Model', desc: 'M365 Copilot, Salesforce Einstein — medium supply chain risk' },
  { value: 'type4', label: 'Type 4 — Pre-trained + Fine-tuned', desc: 'Fine-tuned third-party model — high supply chain risk' },
  { value: 'type5', label: 'Type 5 — Fine-tuned Proven Model', desc: 'Fine-tuned production model — high supply chain risk' },
  { value: 'type6', label: 'Type 6 — Custom Bespoke Model', desc: 'Fully custom model — critical supply chain risk' },
]

const JURISDICTIONS = [
  { value: 'eu', label: 'European Union', desc: 'EU AI Act + GDPR' },
  { value: 'us', label: 'United States', desc: 'NIST AI RMF + EO 14110' },
  { value: 'cn', label: 'China', desc: 'AIGCS + TC260' },
]

const LAYERS = [
  { value: 'training', label: 'Training', desc: 'Data ingestion, model training pipeline' },
  { value: 'model', label: 'Model', desc: 'Model weights, evaluation, versioning' },
  { value: 'rag', label: 'RAG', desc: 'Retrieval-augmented generation, knowledge base' },
  { value: 'orchestration', label: 'Orchestration', desc: 'Agents, tools, MCP, multi-step workflows' },
  { value: 'runtime', label: 'Runtime', desc: 'Inference, API, end-user interface' },
]

const VENDOR_STATUSES = [
  'Not assessed',
  'Assessment in progress',
  'Assessment complete — self-assessed',
  'Assessment complete — third-party audited (SOC 2 / ISO 27001 / equivalent)',
  'Assessment complete — remediation required',
  'No vendor (internal model)',
]

const STEPS = ['System basics', 'Deployment & layers', 'AI SBoM', 'Vendor info']

const FRIA_REQUIRED_SECTORS = ['Banking & Finance (BFSI)', 'Public Sector & Government']

type FormData = {
  name: string
  purpose: string
  sector: string
  deployment_type: string
  jurisdictions: string[]
  layers: string[]
  base_model: string
  embedding_model: string
  vector_db: string
  orchestration_framework: string
  third_party_plugins: string
  vendor_name: string
  vendor_assessment_status: string
  vendor_last_audit: string
  friaOptedIn: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormData>({
    name: '',
    purpose: '',
    sector: '',
    deployment_type: '',
    jurisdictions: ['eu'],
    layers: ['runtime'],
    base_model: '',
    embedding_model: '',
    vector_db: '',
    orchestration_framework: '',
    third_party_plugins: '',
    vendor_name: '',
    vendor_assessment_status: '',
    vendor_last_audit: '',
    friaOptedIn: false,
  })

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggle(field: 'jurisdictions' | 'layers', value: string) {
    setForm(f => {
      const arr = f[field] as string[]
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function canNext() {
    if (step === 0) return form.name.trim() && form.purpose.trim() && form.sector
    if (step === 1) return form.deployment_type && form.jurisdictions.length > 0 && form.layers.length > 0
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const id = await registerSystem({
        ...form,
        third_party_plugins: form.third_party_plugins
          ? form.third_party_plugins.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        fria_opted_in: form.friaOptedIn,
      })
      router.push(`/systems/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← COMPASS OS
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-gray-300">Register AI system</span>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                  i < step ? 'bg-indigo-600 text-white' :
                  i === step ? 'bg-indigo-500 text-white' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-700 mx-1" />}
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            {/* Step 0: System basics */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white">System basics</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">System name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Customer Support AI"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Purpose / description <span className="text-red-400">*</span></label>
                  <textarea
                    value={form.purpose}
                    onChange={e => set('purpose', e.target.value)}
                    placeholder="Describe what this AI system does and how it is used"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Sector <span className="text-red-400">*</span></label>
                  <select
                    value={form.sector}
                    onChange={e => set('sector', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">Select sector...</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* FRIA opt-in */}
                {form.sector && (
                  <div className={`p-4 rounded-lg border ${
                    FRIA_REQUIRED_SECTORS.includes(form.sector)
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        id="fria-opt-in"
                        type="checkbox"
                        checked={form.friaOptedIn}
                        onChange={e => setForm(f => ({ ...f, friaOptedIn: e.target.checked }))}
                        className="mt-0.5 accent-rose-500 w-4 h-4 flex-shrink-0"
                      />
                      <label htmlFor="fria-opt-in" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white">Enable Fundamental Rights Impact Assessment (FRIA)</span>
                          {FRIA_REQUIRED_SECTORS.includes(form.sector) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Required — EU AI Act Art. 27
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {FRIA_REQUIRED_SECTORS.includes(form.sector)
                            ? 'Deployers in BFSI and public sector must conduct a FRIA before deployment under EU AI Act Art. 27.'
                            : 'Recommended for high-risk systems. Assesses impact on EU Charter rights across 24 fundamental rights.'}
                        </p>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Deployment & layers */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white">Deployment & layers</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Deployment type <span className="text-red-400">*</span></label>
                  <div className="space-y-2">
                    {DEPLOYMENT_TYPES.map(dt => (
                      <label key={dt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form.deployment_type === dt.value
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="deployment_type"
                          value={dt.value}
                          checked={form.deployment_type === dt.value}
                          onChange={() => set('deployment_type', dt.value)}
                          className="mt-0.5 accent-indigo-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{dt.label}</div>
                          <div className="text-xs text-gray-400">{dt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Jurisdictions <span className="text-red-400">*</span></label>
                  <div className="flex gap-3">
                    {JURISDICTIONS.map(j => (
                      <label key={j.value} className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                        form.jurisdictions.includes(j.value)
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.jurisdictions.includes(j.value)}
                          onChange={() => toggle('jurisdictions', j.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-white">{j.label}</span>
                        <span className="text-xs text-gray-400">{j.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">AI layers in scope <span className="text-red-400">*</span></label>
                  <div className="space-y-2">
                    {LAYERS.map(l => (
                      <label key={l.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form.layers.includes(l.value)
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.layers.includes(l.value)}
                          onChange={() => toggle('layers', l.value)}
                          className="accent-indigo-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-white">{l.label}</span>
                          <span className="text-xs text-gray-400 ml-2">{l.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: AI SBoM */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Software Bill of Materials</h2>
                  <p className="text-sm text-gray-400 mt-1">Optional but recommended for supply chain risk assessment.</p>
                </div>
                {[
                  { field: 'base_model' as const, label: 'Base model', placeholder: 'e.g. claude-sonnet-4-5, gpt-4o, llama-3' },
                  { field: 'embedding_model' as const, label: 'Embedding model', placeholder: 'e.g. text-embedding-3-large' },
                  { field: 'vector_db' as const, label: 'Vector database', placeholder: 'e.g. Pinecone, Weaviate, pgvector' },
                  { field: 'orchestration_framework' as const, label: 'Orchestration framework', placeholder: 'e.g. LangChain, LlamaIndex, custom' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={form[field]}
                      onChange={e => set(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Third-party plugins / integrations</label>
                  <input
                    type="text"
                    value={form.third_party_plugins}
                    onChange={e => set('third_party_plugins', e.target.value)}
                    placeholder="Comma-separated, e.g. Zapier, Slack, Salesforce"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Vendor info */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Vendor information</h2>
                  <p className="text-sm text-gray-400 mt-1">For third-party or licensed AI systems.</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Vendor name</label>
                  <input
                    type="text"
                    value={form.vendor_name}
                    onChange={e => set('vendor_name', e.target.value)}
                    placeholder="e.g. Anthropic, OpenAI, Microsoft"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Vendor assessment status</label>
                  <select
                    value={form.vendor_assessment_status}
                    onChange={e => set('vendor_assessment_status', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">Select status...</option>
                    {VENDOR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Last vendor audit date</label>
                  <input
                    type="date"
                    value={form.vendor_last_audit}
                    onChange={e => set('vendor_last_audit', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Registering...
                    </>
                  ) : 'Register system →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
