# COMPASS OS — AI Governance Proof of Concept

> A prototype that maps AI systems against the EU AI Act, NIST AI RMF, ISO 42001, and OWASP LLM Top 10 — and generates a regulator-ready compliance dossier.

**Live demo:** https://compass-alpha-mocha.vercel.app

---

## What is COMPASS OS?

COMPASS OS is a governance compliance tool for AI systems. It encodes a validated research framework from a Master's thesis on AI regulatory compliance mapping.

You register an AI system, work through five governance modules, and export a structured compliance dossier per EU AI Act Article 11.

---

## The 8 Screens

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/register` | Multi-step system registration (4 steps) |
| `/systems/[id]` | System dashboard — hub for all modules |
| `/systems/[id]/classify` | EU AI Act risk tier + OWASP threat model |
| `/systems/[id]/matrix` | Jurisdiction overlap matrix (EU · US · CN) |
| `/systems/[id]/lexarch` | LexArch regulatory article compiler (Claude API) |
| `/systems/[id]/evidence` | Evidence checklist + maturity heatmap |
| `/systems/[id]/dossier` | Compliance dossier + PDF/Markdown export |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Storage) |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| Hosting | Vercel |

---

## Governance Framework

### 5 Constituents × 5 Layers = 40+ Controls

**Constituents:** Data Governance · Model Security · Output & Content Integrity · Operational & Human Oversight · Ethics, Rights & Fairness

**Layers:** Training · Model · RAG · Orchestration · Runtime

### Maturity Scoring (IEC 62443 §5.4)

| Level | Criteria |
|---|---|
| ML-1 Initial | No evidence collected |
| ML-2 Managed | ≥1 EoE item checked per layer |
| ML-3 Defined | EoE ≥50% + ≥1 PoE checked + no stale PoE |
| ML-4 | Blocked — requires 12 months prior ML-3 |

Scoring is **deterministic** — no AI involved. Maturity is calculated from evidence state only.

### Regulatory Mappings

- **EU AI Act** — risk classification (Art. 5/6/50), obligations (Art. 9–15), technical documentation (Art. 11)
- **NIST AI RMF** — GOVERN, MAP, MEASURE, MANAGE functions
- **ISO/IEC 42001** — §6.1, §8.3, §8.4, §8.7
- **GDPR** — Art. 5, 9, 10, 22, 25, 30
- **OWASP LLM Top 10** — 7 threat vectors mapped to AIR 2026 risk codes
- **AIR 2026** — R315–R346 emerging AI risks

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/AdrianaFreitas/compass-os-poc.git
cd compass-os-poc

# 2. Install
npm install

# 3. Environment variables — create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Database — run supabase/schema.sql in Supabase SQL Editor

# 5. Storage — create a public bucket called 'evidence-files' in Supabase Storage

# 6. Run
npm run dev
```

---

## Architecture

```
compass-os-poc/
├── app/
│   ├── page.tsx                      ← Landing
│   ├── register/page.tsx             ← Multi-step registration
│   └── systems/[id]/
│       ├── page.tsx                  ← Dashboard
│       ├── classify/                 ← EU AI Act + OWASP threat model
│       ├── matrix/                   ← Jurisdiction overlap (EU/US/CN)
│       ├── lexarch/                  ← Regulatory article compiler
│       ├── evidence/                 ← Checklist + maturity heatmap
│       └── dossier/                  ← PDF/Markdown export
├── actions/
│   ├── systems.ts                    ← Register + evidence seed
│   ├── evidence.ts                   ← Evidence CRUD + maturity recalc
│   ├── threat.ts                     ← Threat model upsert
│   ├── lexarch.ts                    ← Claude API call (ONLY AI call)
│   └── lexarch-save.ts               ← Compile + persist to Supabase
├── lib/
│   ├── db/supabase.ts                ← Supabase client
│   ├── utils.ts                      ← Maturity scoring (deterministic)
│   ├── dossier-generator.ts          ← Markdown dossier builder
│   └── data/
│       ├── eu-ai-act-tree.ts         ← Risk classification tree
│       ├── overlap-matrix.ts         ← 10 universal + 4 divergent controls
│       ├── risk-taxonomy.ts          ← AIR 2026 emerging risks
│       ├── compass-controls.ts       ← 40+ evidence controls
│       └── owasp-threat-questions.ts ← 7 OWASP LLM threat vectors
└── supabase/
    └── schema.sql                    ← 4 tables + RLS policies
```

---

## Key Design Decisions

**No AI for scoring.** Maturity is calculated deterministically from evidence state. Only LexArch calls the Claude API — everything else is pure logic. This keeps governance auditable.

**Static thesis data is sacred.** The constants in `lib/data/` encode validated research. They are not modified at runtime.

**ML-4 is blocked.** IEC 62443 §5.4 requires 12 months of prior ML-3. The scoring function enforces this hard limit.

**HCD — Highest Common Denominator.** Evidence artifacts satisfy multiple jurisdictions simultaneously. Collect once, apply everywhere.

---

## OWASP Integration

Each evidence control with an OWASP reference displays a teal `OWASP §x.x` badge. The 7 threat model questions map directly to the OWASP LLM Top 10 and AIR 2026 risk codes.

| Threat Vector | OWASP | AIR Code |
|---|---|---|
| Prompt Injection | LLM01 | R317 |
| MCP Server Abuse | LLM08 | R315 |
| Data Poisoning | LLM03 | R342 |
| Model Exfiltration | LLM10 | R316 |
| Hallucination | LLM09 | R326 |
| Social Engineering | LLM02 | R317 |
| Incident Response | LLM07 | R315/316/317 |

---

*COMPASS OS — Master's thesis proof of concept on AI governance compliance mapping.*
