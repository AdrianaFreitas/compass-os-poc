# COMPASS OS — Claude Code Project Brief
## Proof of Concept Prototype

---

## BEFORE YOU WRITE A SINGLE LINE OF CODE — ACCOUNTS & TOOLS

Set these up first. All are free. The build cannot start without them.

### Accounts to create (in this order)

**1. GitHub — github.com**
Where your code lives. Free account. You need this before everything else.
- Create account → New repository → name it `compass-os-poc` → Public → no template
- Install Git if not already on your machine: git-scm.com/downloads

**2. Supabase — supabase.com**
Your database and file storage. Free tier is more than enough.
- Create account (sign in with GitHub — fastest) → New project
- Pick a region close to you (eu-west-1 if you are in Spain)
- Set a strong database password and save it somewhere safe
- Once the project is created, go to: Project Settings → API and copy:
  - `Project URL` → this becomes `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → this becomes `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**3. Anthropic — console.anthropic.com**
For the LexArch Claude API calls. Free trial credits available.
- Create account → API Keys → Create key → copy it immediately (shown once only)
- This becomes `ANTHROPIC_API_KEY`
- Add $5 of credits — enough for all prototype development

**4. Vercel — vercel.com**
Deployment and hosting. Free tier. Connects directly to GitHub.
- Create account (sign in with GitHub — it links automatically)
- You will connect your repo here later during the build

### Tools to install on your machine

**Node.js** — nodejs.org/en/download
Download the LTS version (v20 or higher). This also installs npm.
After installing, open Terminal and verify: `node --version` and `npm --version`

**Claude Code** — claude.ai/code or via the Claude desktop app
This is what you use to build. It reads the `CLAUDE.md` file in your project
on every session so it always has full context without you re-explaining anything.

**Git** — git-scm.com/downloads
Already installed on most Macs. Check with `git --version` in Terminal.

### Your three environment variables

You will need these in two places: a local `.env.local` file, and Vercel's dashboard.

```
NEXT_PUBLIC_SUPABASE_URL=        ← from Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← from Supabase → Project Settings → API
ANTHROPIC_API_KEY=               ← from console.anthropic.com → API Keys
```

---

## READ THIS BEFORE STARTING THE BUILD

You are building the **COMPASS Proof of Concept** — a web application that operationalises
the COMPASS thesis (Compliance Overlap & Mapping of Policies for AI Security Standards).
The thesis is a Master's research project by Adriana Freitas that manually solved a hard
governance problem over 93 days. This prototype automates the core of that work.

**The thesis already contains all the data.** The overlap matrix, the control library, the
risk taxonomy, the EU AI Act decision tree — all of it is documented in the research and
encoded in this brief as TypeScript constants. You do not need to invent any governance
logic. You encode what the thesis proved.

**How to work with this brief.** You work through the numbered steps below at whatever
pace suits you. There are no day labels — some steps take an hour, some take a whole
session. When you open Claude Code each time, it reads `CLAUDE.md` and picks up
exactly where you left off. Tell Claude Code which step number you want to work on.

---

## Project Identity

```
Name:        COMPASS OS — Proof of Concept
Stack:       Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase
AI:          Anthropic Claude API (claude-sonnet-4-5) via server actions only
Hosting:     Vercel (free tier)
Auth:        None for prototype — single user, no login required
Repo name:   compass-os-poc
```

---

## The 8 Screens

The app has a single flow: register an AI system → work through governance checks → export a compliance dossier.

```
1. /                       → Landing page + "Register new AI system" CTA
2. /register               → System registration form (multi-step)
3. /systems/[id]           → System dashboard (hub for all modules)
4. /systems/[id]/classify  → EU AI Act risk classification + OWASP threat model
5. /systems/[id]/matrix    → Jurisdiction overlap matrix
6. /systems/[id]/lexarch   → LexArch article compiler (the Claude API call)
7. /systems/[id]/evidence  → Evidence checklist + maturity scorer
8. /systems/[id]/dossier   → Dossier preview + export
```

---

## File Structure

```
compass-os-poc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          ← landing
│   ├── register/page.tsx                 ← multi-step registration
│   └── systems/[id]/
│       ├── page.tsx                      ← system dashboard
│       ├── classify/page.tsx
│       ├── matrix/page.tsx
│       ├── lexarch/page.tsx
│       ├── evidence/page.tsx
│       └── dossier/page.tsx
├── components/
│   ├── ui/                               ← Button, Card, Badge, Progress
│   ├── MaturityHeatmap.tsx
│   ├── OverlapMatrix.tsx
│   ├── EvidenceChecklist.tsx
│   └── DossierPreview.tsx
├── lib/
│   ├── data/
│   │   ├── compass-controls.ts           ← evidence items per constituent/layer
│   │   ├── overlap-matrix.ts             ← jurisdiction HCD matrix
│   │   ├── risk-taxonomy.ts              ← AIR 2026 emerging risks
│   │   ├── eu-ai-act-tree.ts             ← classification decision tree
│   │   └── owasp-threat-questions.ts     ← 7 OWASP threat model questions
│   ├── db/supabase.ts                    ← Supabase client
│   └── utils.ts                          ← maturity scoring + dossier generator
├── actions/lexarch.ts                    ← Claude API server action (only AI call)
├── supabase/schema.sql                   ← run this in Supabase SQL editor
├── CLAUDE.md                             ← Claude Code reads this every session
└── .env.local                            ← never commit, add to .gitignore
```

---

## CLAUDE.md

Create this file at the project root. Claude Code reads it at the start of every session.

```markdown
# COMPASS OS — Proof of Concept

## What this is
A web application operationalising the COMPASS academic framework for AI governance.
The framework maps regulatory obligations across EU AI Act, NIST AI RMF, and
China GB/T 45654-2025 to technical controls and generates compliance evidence dossiers.

## The thesis source
All governance logic comes from: "COMPASS — Compliance Overlap & Mapping of
Policies for AI Security Standards" by Adriana Freitas (Master's in Business Security,
March 2026). Do not invent governance rules. Use the TypeScript constants in lib/data/.

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (Postgres) for persistence
- Anthropic Claude API (claude-sonnet-4-5) for LexArch only — server actions only
- Vercel deployment

## Critical rules
1. All Claude API calls go through server actions in actions/lexarch.ts — never client-side
2. The ANTHROPIC_API_KEY env var is set in Vercel and .env.local — never hardcode it
3. Never modify lib/data/ constants — they encode validated thesis research
4. All governance scoring is deterministic from the constants — no LLM calls for scoring
5. The maturity score is calculated from evidence completeness only
6. ML-4 cannot be claimed — enforce IEC 62443 §5.4 (requires 12 months of prior ML-3)
7. Tailwind only — no CSS modules, no styled-components
8. App Router only — no pages/ directory

## Key terminology
- EoE: Evidence of Existence — policies, procedures, templates (what you have documented)
- PoE: Proof of Execution — logs, test results, metrics (what you have actually done)
- HCD: Highest Common Denominator — controls satisfying multiple jurisdictions at once
- Five layers: Training | Model | RAG | Orchestration | Runtime
- Five constituents: Data Governance | Model Security | Output & Content Integrity |
  Operational & Human Oversight | Ethics, Rights & Fairness

## Environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=

## Commands
npm run dev       → local development (http://localhost:3000)
npm run build     → production build — run before deploying
vercel --prod     → deploy to production
```

---

## Database Schema

Run this once in Supabase: Dashboard → SQL Editor → New query → paste and run.

```sql
create table systems (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  purpose text not null,
  sector text not null,
  deployment_type text not null,
  jurisdictions text[] not null default array['eu'],
  layers text[] not null,
  risk_tier text,
  risk_article text,
  base_model text,
  embedding_model text,
  vector_db text,
  orchestration_framework text,
  third_party_plugins text[],
  vendor_name text,
  vendor_assessment_status text,
  vendor_last_audit date,
  maturity_score text default 'ml1'
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  system_id uuid references systems(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constituent text not null,
  layer text not null,
  control_id text not null,
  evidence_type text not null,
  label text not null,
  checked boolean default false,
  file_url text,
  notes text,
  last_tested date,
  retest_frequency text,
  owasp_ref text,
  thesis_ref text
);

create table threat_model (
  id uuid primary key default gen_random_uuid(),
  system_id uuid references systems(id) on delete cascade,
  created_at timestamptz default now(),
  question_id text not null,
  answer text,
  notes text,
  air_risk_ref text
);

create table lexarch_results (
  id uuid primary key default gen_random_uuid(),
  system_id uuid references systems(id) on delete cascade,
  created_at timestamptz default now(),
  article_text text not null,
  layer text,
  constituent text,
  control_name text,
  eoe_items jsonb,
  poe_items jsonb,
  maturity_level text,
  thesis_ref text,
  owasp_ref text
);

alter table systems enable row level security;
alter table evidence enable row level security;
alter table threat_model enable row level security;
alter table lexarch_results enable row level security;

create policy "allow all" on systems for all using (true);
create policy "allow all" on evidence for all using (true);
create policy "allow all" on threat_model for all using (true);
create policy "allow all" on lexarch_results for all using (true);
```

---

## Data Constants

### `lib/data/eu-ai-act-tree.ts`

```typescript
export type RiskTier = 'unacceptable' | 'high_risk' | 'limited' | 'minimal';

export interface ClassificationResult {
  tier: RiskTier;
  label: string;
  article: string;
  description: string;
  obligations: string[];
}

export function classifySystem(sector: string, purpose: string): ClassificationResult {
  const p = purpose.toLowerCase();

  const prohibited = ['subliminal manipulation', 'exploit vulnerability', 'social scoring',
    'real-time biometric', 'emotion recognition', 'scrape facial'];
  if (prohibited.some(x => p.includes(x))) {
    return { tier: 'unacceptable', label: 'Unacceptable risk', article: 'EU AI Act Art. 5',
      description: 'This AI system falls within the prohibited practices list. Deployment is not permitted in the EU.',
      obligations: ['Immediate cessation of deployment', 'Notify national supervisory authority'] };
  }

  const highRiskSectors: Record<string, string[]> = {
    bfsi: ['credit', 'loan', 'insurance', 'scoring', 'fraud', 'trading', 'underwriting'],
    healthcare: ['diagnosis', 'triage', 'treatment', 'clinical', 'medical', 'patient', 'drug'],
    public: ['benefit', 'welfare', 'immigration', 'asylum', 'law enforcement', 'police',
             'criminal', 'court', 'judicial', 'voting', 'election'],
    hr: ['hiring', 'recruitment', 'screening', 'cv', 'resume', 'performance', 'dismissal'],
    education: ['admission', 'exam', 'assessment', 'grade', 'student', 'school'],
  };

  const sectorKeys = highRiskSectors[sector] ?? [];
  const isHighRisk = sectorKeys.some(k => p.includes(k)) ||
    Object.values(highRiskSectors).flat().some(k => p.includes(k));

  if (isHighRisk) {
    return { tier: 'high_risk', label: 'High-risk system', article: 'EU AI Act Annex III',
      description: 'This system falls within a high-risk category under Annex III. Full conformity assessment required.',
      obligations: ['Technical documentation (Art. 11)', 'Conformity assessment (Art. 43)',
        'EU Database registration (Art. 51)', 'Post-market monitoring (Art. 72)',
        'Human oversight measures (Art. 14)', 'Accuracy & robustness requirements (Art. 15)',
        'FRIA for public-sector/banking deployments (Art. 27)'] };
  }

  const limited = ['chatbot', 'content generation', 'deepfake', 'image generation', 'voice', 'synthetic', 'recommendation'];
  if (limited.some(k => p.includes(k))) {
    return { tier: 'limited', label: 'Limited risk', article: 'EU AI Act Art. 50',
      description: 'Transparency obligations apply. Users must be informed they are interacting with an AI system.',
      obligations: ['Disclosure that content is AI-generated (Art. 50)',
        'Labelling of synthetic media (Art. 50)', 'Model cards for GPAI systems (Art. 53)'] };
  }

  return { tier: 'minimal', label: 'Minimal risk', article: 'EU AI Act Recital 47',
    description: 'Minimal regulatory obligation. Voluntary codes of conduct recommended.',
    obligations: ['Voluntary code of conduct encouraged'] };
}

export const DEPLOYMENT_TYPES = [
  { id: 'direct_access', label: 'Type 1 — Direct access', description: 'Public consumer apps (ChatGPT, Perplexity)', supplyChainRisk: 'low' },
  { id: 'model_api', label: 'Type 2 — Model API', description: 'Vendor API calls (Claude, GPT-4, Gemini)', supplyChainRisk: 'medium' },
  { id: 'licensed', label: 'Type 3 — Licensed model', description: 'Enterprise tenant (M365 Copilot, Salesforce Einstein)', supplyChainRisk: 'medium' },
  { id: 'pretrained', label: 'Type 4 — Pre-trained model', description: 'Foundation model customised by fine-tuning', supplyChainRisk: 'high' },
  { id: 'finetuned', label: 'Type 5 — Fine-tuned proven model', description: 'Proven specialised model fine-tuned on proprietary data', supplyChainRisk: 'high' },
  { id: 'custom', label: 'Type 6 — Custom model', description: 'Bespoke AIML architecture built for enterprise use case', supplyChainRisk: 'critical' },
] as const;
```

---

### `lib/data/overlap-matrix.ts`

```typescript
export type Jurisdiction = 'eu' | 'us' | 'cn';

export interface OverlapControl {
  id: string; l3Group: string; l1Category: string;
  isUniversal: boolean; isDivergent: boolean;
  coverage: Record<Jurisdiction, 1.0 | 0.5 | 0>;
  description: string; artifactReuse?: string;
}

export const UNIVERSAL_RISKS: OverlapControl[] = [
  { id: 'UR-01', l3Group: 'Privacy', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Protection of personal data and privacy in AI outputs and training data.',
    artifactReuse: 'DBOM + DPIA satisfies GDPR Art. 35 (EU) + NIST Privacy Framework (US) + CAC data localisation (CN)' },
  { id: 'UR-02', l3Group: 'Security', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Cybersecurity requirements for AI systems and infrastructure.',
    artifactReuse: 'Security robustness evidence (ISO/IEC TR 24029-1) satisfies CRA (EU) + US EOs + GB/T 45654-2025 §4 (CN)' },
  { id: 'UR-03', l3Group: 'Non-discrimination', l1Category: 'Fairness', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Prevention of algorithmic bias and discriminatory AI outputs.',
    artifactReuse: 'FRIA + bias evaluation report satisfies AIA Art. 27 (EU) + CFPB guidance (US) + AI Safety FW V2.0 (CN)' },
  { id: 'UR-04', l3Group: 'Transparency', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Disclosure requirements for AI-generated content and decision explanations.',
    artifactReuse: 'Traceable Decision Log satisfies AIA Art. 12 + Art. 50 (EU) + NIST Measure (US) + TC260 algorithm filing (CN)' },
  { id: 'UR-05', l3Group: 'Human Oversight', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Human-in-the-loop requirements for high-stakes AI decisions.',
    artifactReuse: 'HITL intervention logs satisfy AIA Art. 14 (EU) + OMB M-25-21 HITL mandates (US) + AI Safety FW oversight (CN)' },
  { id: 'UR-06', l3Group: 'Safety', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Prevention of physical or psychological harm from AI outputs.' },
  { id: 'UR-07', l3Group: 'Accountability', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Assignable responsibility for AI system behaviour and outcomes.' },
  { id: 'UR-08', l3Group: 'Fraud / Deception', l1Category: 'Malicious Use', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Prohibition on using AI to deceive, manipulate, or commit fraud.' },
  { id: 'UR-09', l3Group: 'Misrepresentation', l1Category: 'Malicious Use', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Prevention of AI-generated false or misleading information.' },
  { id: 'UR-10', l3Group: 'Sensitive Information', l1Category: 'Content Safety', isUniversal: true, isDivergent: false,
    coverage: { eu: 1.0, us: 1.0, cn: 1.0 }, description: 'Protection of sensitive categories of personal and regulated data.' },
];

export const DIVERGENT_CONTROLS: OverlapControl[] = [
  { id: 'DIV-01', l3Group: 'Labour Rights', l1Category: 'Socioeconomic', isUniversal: false, isDivergent: true,
    coverage: { eu: 1.0, us: 0, cn: 1.0 }, description: 'AI workforce displacement impact assessments. EU and China mandate; US absent.' },
  { id: 'DIV-02', l3Group: 'Political Manipulation', l1Category: 'Societal', isUniversal: false, isDivergent: true,
    coverage: { eu: 1.0, us: 1.0, cn: 0.5 }, description: 'AI-enabled election interference prohibition. EU/US align; China frames around social stability.' },
  { id: 'DIV-03', l3Group: 'Social Order / Stability', l1Category: 'Societal', isUniversal: false, isDivergent: true,
    coverage: { eu: 0, us: 0, cn: 1.0 }, description: 'China-specific provisions on AI content threatening national security. No EU/US equivalent.' },
  { id: 'DIV-04', l3Group: 'FLOPs Threshold (Systemic Risk)', l1Category: 'Technical', isUniversal: false, isDivergent: true,
    coverage: { eu: 1.0, us: 0, cn: 0 }, description: 'EU AI Act 10²⁵ FLOPs threshold for GPAI systemic risk. No equivalent in US or China.' },
];

export const ARTIFACT_REUSE_MAPPINGS = [
  { artifact: 'EU AI Act Technical Dossier', jurisdictions: ['eu', 'us', 'iso'],
    obligations: ['EU AIA Art. 11 technical documentation', 'NIST Measure function conformity', 'ISO/IEC 42001 documentation requirements'] },
  { artifact: 'Traceable Decision Log (prompt → RAG → output)', jurisdictions: ['eu', 'us', 'cn'],
    obligations: ['EU AIA Art. 12 (transparency logging)', 'EU AIA Art. 50 (output disclosure)', 'China TC260 algorithm filing', 'NIST Measure function'] },
  { artifact: 'Security Robustness Evidence (ISO/IEC TR 24029-1)', jurisdictions: ['eu', 'us'],
    obligations: ['Cyber Resilience Act (CRA) due diligence', 'US July 2025 Executive Orders compliance'] },
  { artifact: 'Data Governance Artifacts (ISO/IEC 8183 lifecycle)', jurisdictions: ['eu'],
    obligations: ['GDPR Article 35 (DPIA)', 'OWASP AI-DSPM structural security requirements for derived data'] },
];
```

---

### `lib/data/compass-controls.ts`

```typescript
export type Constituent = 'data_governance' | 'model_security' | 'output_integrity' | 'human_oversight' | 'ethics_fairness';
export type Layer = 'training' | 'model' | 'rag' | 'orchestration' | 'runtime';

export interface EvidenceItem {
  id: string; label: string; evidenceType: 'eoe' | 'poe';
  maturityTier: 'tier1' | 'tier2' | 'tier3';
  thesisRef: string; owaspRef?: string;
  requiresFile: boolean; requiresDate: boolean;
  retestFrequency?: 'monthly' | 'quarterly' | 'annually';
}

export const DATA_GOVERNANCE_CONTROLS: Record<Layer, EvidenceItem[]> = {
  training: [
    { id: 'DG-TR-01', label: 'Data pipeline Standard Operating Procedure (SOP)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'ISO/IEC 8183; AIA Art. 10', requiresFile: true, requiresDate: false },
    { id: 'DG-TR-02', label: '"No-train / no-retain" policy document', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'OWASP AI-DSPM DSGAI13', owaspRef: '§3.6', requiresFile: true, requiresDate: false },
    { id: 'DG-TR-03', label: 'DBOM — Data Bill of Materials (training data sources)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'ISO/IEC 8183 2024; OWASP 2026', requiresFile: true, requiresDate: false },
    { id: 'DG-TR-04', label: 'Acceptable use matrix (approved AI tools by data classification)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA Art. 4 (AI literacy obligations)', owaspRef: '§3.6', requiresFile: true, requiresDate: false },
    { id: 'DG-TR-05', label: 'DLP scan log — training pipeline', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026', requiresFile: false, requiresDate: true, retestFrequency: 'quarterly' },
    { id: 'DG-TR-06', label: 'Differential privacy budget monitoring log', evidenceType: 'poe', maturityTier: 'tier3', thesisRef: 'OWASP 2026; IEC 62443 ML-4', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
  model: [
    { id: 'DG-MD-01', label: 'AI SBoM — Software Bill of Materials (model components)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'CRA supply chain; AIA Art. 13', owaspRef: '§3.3', requiresFile: true, requiresDate: false },
    { id: 'DG-MD-02', label: 'Model card documenting training data, limitations, intended use', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'ISO/IEC 12792 2025; TC260 2025', owaspRef: '§3.11', requiresFile: true, requiresDate: false },
    { id: 'DG-MD-03', label: 'Risk card — summary of applicable AIR 2026 risk categories', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIR Taxonomy 2026', owaspRef: '§3.11', requiresFile: true, requiresDate: false },
  ],
  rag: [
    { id: 'DG-RG-01', label: 'RAG knowledge base inventory with data sensitivity classification', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'OWASP AI-DSPM DSGAI13; GDPR Art. 35', requiresFile: true, requiresDate: false },
    { id: 'DG-RG-02', label: 'PII redaction validation log for RAG snippets', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
    { id: 'DG-RG-03', label: 'Derived data audit — vector embeddings and model weights', evidenceType: 'eoe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026 §2.1.3', requiresFile: true, requiresDate: false },
  ],
  orchestration: [
    { id: 'DG-OR-01', label: 'Data classification policy for orchestration layer inputs', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'ISO/IEC 42001 A.7', owaspRef: '§3.6', requiresFile: true, requiresDate: false },
  ],
  runtime: [
    { id: 'DG-RT-01', label: 'User data handling policy (what is logged, retained, deleted)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'GDPR Art. 17; AIA Art. 12', requiresFile: true, requiresDate: false },
    { id: 'DG-RT-02', label: 'DLP runtime monitoring log', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026', owaspRef: '§3.9', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
};

export const MODEL_SECURITY_CONTROLS: Record<Layer, EvidenceItem[]> = {
  training: [
    { id: 'MS-TR-01', label: 'Adversarial training methodology documentation', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA Art. 15; ISO/IEC TR 24029', requiresFile: true, requiresDate: false },
    { id: 'MS-TR-02', label: 'Training pipeline security assessment', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'IEC 62443-4-2; NIST 2024', owaspRef: '§3.9', requiresFile: true, requiresDate: true, retestFrequency: 'annually' },
  ],
  model: [
    { id: 'MS-MD-01', label: 'Model weight encryption policy', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA Art. 15; IEC 62443-4-2', requiresFile: true, requiresDate: false },
    { id: 'MS-MD-02', label: 'Third-party vendor assessment (assessment status + last audit date)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'EU AI Act deployer liability', owaspRef: '§3.9', requiresFile: true, requiresDate: false },
    { id: 'MS-MD-03', label: 'Third-party model EULA review — confirms permitted use and liability assignment', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA deployer obligations', owaspRef: '§3.7', requiresFile: true, requiresDate: false },
    { id: 'MS-MD-04', label: 'Adversarial red-teaming findings report', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'ISO/IEC TR 24029 2023; NIST 2024', owaspRef: '§3.13', requiresFile: true, requiresDate: true, retestFrequency: 'quarterly' },
    { id: 'MS-MD-05', label: 'Robustness test results (neural network evaluation)', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'ISO/IEC TR 24029; AIA Art. 15', requiresFile: true, requiresDate: true, retestFrequency: 'quarterly' },
  ],
  rag: [
    { id: 'MS-RG-01', label: 'Input sanitisation procedure for RAG queries', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'OWASP AI-DSPM; AIA Art. 15', requiresFile: true, requiresDate: false },
    { id: 'MS-RG-02', label: 'Safe RAG pipeline implementation evidence', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026', owaspRef: '§3.12', requiresFile: false, requiresDate: true, retestFrequency: 'quarterly' },
  ],
  orchestration: [
    { id: 'MS-OR-01', label: 'MCP server call input sanitisation procedure', evidenceType: 'eoe', maturityTier: 'tier2', thesisRef: 'AIR R315 — MCP Server Policy Abuse', requiresFile: true, requiresDate: false },
    { id: 'MS-OR-02', label: 'Prompt firewall configuration and test log', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026; IEC 62443-4-2', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
  runtime: [
    { id: 'MS-RT-01', label: 'Security audit log — runtime access controls', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'IEC 62443-4-2; NIST 2024', owaspRef: '§3.9', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
};

export const OUTPUT_INTEGRITY_CONTROLS: Record<Layer, EvidenceItem[]> = {
  training: [],
  model: [
    { id: 'OC-MD-01', label: 'Digital watermarking or C2PA labelling implementation', evidenceType: 'eoe', maturityTier: 'tier2', thesisRef: 'AIR L3-48; GB 45438-2025; ISO/IEC 12792', requiresFile: true, requiresDate: false },
    { id: 'OC-MD-02', label: 'Content provenance logs (model output attribution)', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'ISO/IEC 12792 2025; TC260 2025', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
  rag: [
    { id: 'OC-RG-01', label: 'Semantic regression test log for RAG grounding', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'OWASP AI-DSPM 2026', owaspRef: '§3.12', requiresFile: false, requiresDate: true, retestFrequency: 'quarterly' },
    { id: 'OC-RG-02', label: 'Hallucination / refusal rate dashboard (last 30 days)', evidenceType: 'poe', maturityTier: 'tier3', thesisRef: 'ISO/IEC 12792 2025', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
  orchestration: [
    { id: 'OC-OR-01', label: 'Transparency reports — AI output disclosure procedure', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA Art. 50; TC260 algorithm filing', requiresFile: true, requiresDate: false },
  ],
  runtime: [
    { id: 'OC-RT-01', label: 'Traceable decision log — full causal chain per inference', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'AIA Art. 12; Art. 50; NIST Measure; TC260', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
};

export const HUMAN_OVERSIGHT_CONTROLS: Record<Layer, EvidenceItem[]> = {
  training: [
    { id: 'HO-TR-01', label: 'RACI matrix — AI system roles and accountability', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'ISO/IEC 42001 §5.3; AIA Art. 14', owaspRef: '§3.6', requiresFile: true, requiresDate: false },
    { id: 'HO-TR-02', label: 'AI operator training records', evidenceType: 'poe', maturityTier: 'tier1', thesisRef: 'ISO/IEC 42001; Ray 2026', owaspRef: '§3.4', requiresFile: true, requiresDate: true, retestFrequency: 'annually' },
  ],
  model: [
    { id: 'HO-MD-01', label: 'Fail-safe deactivation protocol documentation', evidenceType: 'eoe', maturityTier: 'tier2', thesisRef: 'AIA Art. 14; ISO/IEC 23894', requiresFile: true, requiresDate: false },
  ],
  orchestration: [
    { id: 'HO-OR-01', label: 'HITL intervention procedure for high-risk tool calls', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA Art. 14; NIST AI 600-1', requiresFile: true, requiresDate: false },
    { id: 'HO-OR-02', label: 'HITL intervention logs with timestamps', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'ISO/IEC 42001 §8; Ray 2026', requiresFile: false, requiresDate: true, retestFrequency: 'monthly' },
  ],
  runtime: [
    { id: 'HO-RT-01', label: 'TEVV continuous testing schedule — last tested dates per test type', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'NIST AI RMF Measure function; IEC 62443 ML-4 KPIs', owaspRef: '§3.10', requiresFile: false, requiresDate: true, retestFrequency: 'quarterly' },
    { id: 'HO-RT-02', label: 'Incident response playbook for GenAI incidents', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'AIA Art. 72 post-market monitoring', owaspRef: '§3.1', requiresFile: true, requiresDate: false },
  ],
  rag: [],
};

export const ETHICS_FAIRNESS_CONTROLS: Record<Layer, EvidenceItem[]> = {
  training: [
    { id: 'EF-TR-01', label: 'Bias testing methodology (demographic parity, equal opportunity)', evidenceType: 'eoe', maturityTier: 'tier1', thesisRef: 'ISO/IEC TR 24027; ISO/IEC TS 12791', requiresFile: true, requiresDate: false },
    { id: 'EF-TR-02', label: 'Bias evaluation report — last test results', evidenceType: 'poe', maturityTier: 'tier2', thesisRef: 'ISO/IEC TR 24027 2023; European Commission 2025', owaspRef: '§3.13', requiresFile: true, requiresDate: true, retestFrequency: 'quarterly' },
    { id: 'EF-TR-03', label: 'Fairness metrics audit trail', evidenceType: 'poe', maturityTier: 'tier3', thesisRef: 'ISO/IEC TR 24027; AIA Art. 27', requiresFile: false, requiresDate: true, retestFrequency: 'quarterly' },
  ],
  model: [
    { id: 'EF-MD-01', label: 'Fundamental Rights Impact Assessment (FRIA)', evidenceType: 'eoe', maturityTier: 'tier2', thesisRef: 'AIA Art. 27; OWASP §3.8', owaspRef: '§3.8', requiresFile: true, requiresDate: false },
  ],
  rag: [], orchestration: [],
  runtime: [
    { id: 'EF-RT-01', label: 'Neuroright protection policy (cognitive liberty, mental privacy)', evidenceType: 'eoe', maturityTier: 'tier2', thesisRef: 'AIR R337; WH Legislative Rec. 2026', requiresFile: true, requiresDate: false },
  ],
};

export const ALL_CONTROLS = {
  data_governance: DATA_GOVERNANCE_CONTROLS, model_security: MODEL_SECURITY_CONTROLS,
  output_integrity: OUTPUT_INTEGRITY_CONTROLS, human_oversight: HUMAN_OVERSIGHT_CONTROLS,
  ethics_fairness: ETHICS_FAIRNESS_CONTROLS,
};

export const CONSTITUENT_LABELS: Record<Constituent, string> = {
  data_governance: 'Data Governance', model_security: 'Model Security',
  output_integrity: 'Output & Content Integrity', human_oversight: 'Operational & Human Oversight',
  ethics_fairness: 'Ethics, Rights & Fairness',
};

export const LAYER_LABELS: Record<Layer, string> = {
  training: 'Training', model: 'Model', rag: 'RAG', orchestration: 'Orchestration', runtime: 'Runtime',
};
```

---

### `lib/data/owasp-threat-questions.ts`

```typescript
export interface ThreatQuestion {
  id: string; question: string; context: string;
  airRiskRef: string; evidenceIfNo: string;
}

export const OWASP_THREAT_QUESTIONS: ThreatQuestion[] = [
  { id: 'TM-01', question: 'Can the system detect and neutralise harmful or malicious inputs to the LLM?',
    context: 'Prompt injection is the leading LLM attack vector. LLM-assisted spear phishing is exponentially more targeted.',
    airRiskRef: 'R317 — Prompt Injection through Authority Spoofing',
    evidenceIfNo: 'Add: Input sanitisation procedure (MS-OR-01) + Prompt firewall test log (MS-OR-02)' },
  { id: 'TM-02', question: 'Are connections with existing systems and databases secured at all LLM trust boundaries?',
    context: 'The fusion of control and data planes in LLMs means trust boundaries are not naturally enforced.',
    airRiskRef: 'R315 — MCP Server Policy Abuse',
    evidenceIfNo: 'Add: MCP server call sanitisation procedure (MS-OR-01) + security audit log (MS-RT-01)' },
  { id: 'TM-03', question: 'Does the organisation have insider threat mitigation to prevent misuse by authorised users?',
    context: 'Shadow AI — employees using unapproved tools — is the most pressing non-adversary LLM threat per OWASP.',
    airRiskRef: 'R342 — Data Poisoning via Insider Access',
    evidenceIfNo: 'Add: Acceptable use matrix (DG-TR-04) + DLP runtime monitoring (DG-RT-02)' },
  { id: 'TM-04', question: 'Is unauthorised access to proprietary models or data prevented to protect Intellectual Property?',
    context: 'Model weight exfiltration (R316) is a new AIR 2026 category — model IP is a material business risk.',
    airRiskRef: 'R316 — Model Weight Exfiltration',
    evidenceIfNo: 'Add: Model weight encryption policy (MS-MD-01) + third-party EULA review (MS-MD-03)' },
  { id: 'TM-05', question: 'Can the system prevent the generation of harmful or inappropriate content?',
    context: 'Content safety is one of the ten universal risk categories shared across EU, US, and China.',
    airRiskRef: 'R326 — Confabulation / Hallucination at scale',
    evidenceIfNo: 'Add: Semantic regression test log (OC-RG-01) + content provenance logs (OC-MD-02)' },
  { id: 'TM-06', question: "How could GenAI be used to attack the organisation's customers through spoofing or generated content?",
    context: 'Adversary use of LLMs for hyper-personalised social engineering is accelerating rapidly.',
    airRiskRef: 'R317 — AI-Enabled Social Engineering',
    evidenceIfNo: 'Add: Transparency reports (OC-OR-01) + traceable decision log (OC-RT-01)' },
  { id: 'TM-07', question: 'Has the Incident Response Plan been updated for GenAI-enhanced attacks and AIML-specific incidents?',
    context: 'OWASP §3.1 requires IR plans explicitly updated for GenAI attack patterns.',
    airRiskRef: 'R315, R316, R317 — Agentic multi-system scale attacks',
    evidenceIfNo: 'Add: GenAI incident response playbook (HO-RT-02)' },
];
```

---

### `lib/data/risk-taxonomy.ts`

```typescript
export const EMERGING_RISKS = [
  { id: 'R315', name: 'MCP Server Policy Abuse', branch: 'System & Operational', severity: 'critical',
    description: 'Autonomous agents abusing MCP server tool permissions beyond intended scope.' },
  { id: 'R316', name: 'Model Weight Exfiltration', branch: 'System & Operational', severity: 'critical',
    description: 'Unauthorised extraction of proprietary model weights via API exploitation.' },
  { id: 'R317', name: 'Prompt Injection through Authority Spoofing', branch: 'System & Operational', severity: 'high',
    description: 'Adversarial inputs that impersonate system-level authority to override model behaviour.' },
  { id: 'R326', name: 'Confabulation / Hallucination (Scaled)', branch: 'System & Operational', severity: 'high',
    description: 'Systematic generation of plausible but false information at production scale.' },
  { id: 'R327', name: 'Environmental & Carbon Impact', branch: 'Systemic', severity: 'medium',
    description: 'Regulatory risk from AI model training carbon footprint (EU AI Act 10²⁵ FLOPs threshold).' },
  { id: 'R330', name: 'Content Homogenisation / Model Collapse', branch: 'Systemic', severity: 'medium',
    description: 'Degradation of output diversity as AI-generated content trains future models.' },
  { id: 'R337', name: 'Neurorights Violation', branch: 'Legal & Governance', severity: 'high',
    description: 'AI systems that manipulate cognitive processes or infer mental states without consent.' },
  { id: 'R342', name: 'Data Poisoning (Training Pipeline)', branch: 'System & Operational', severity: 'critical',
    description: 'Adversarial manipulation of training data to embed backdoors or bias.' },
  { id: 'R346', name: 'AI Fundamental Rights Impact', branch: 'Legal & Governance', severity: 'high',
    description: 'Systemic failure to assess AI impact on fundamental rights before deployment.' },
];
```

---

## The LexArch Server Action — `actions/lexarch.ts`

```typescript
'use server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY automatically

export interface LexArchResult {
  layer: string; constituent: string; controlName: string; controlObjective: string;
  technicalSafeguards: string[]; eoeItems: string[]; poeItems: string[];
  maturityLevel: string; thesisRef: string; owaspRef: string; jurisdictionMapping: string;
}

const SYSTEM_PROMPT = `You are LexArch — the legal-to-technical control compiler for the COMPASS AI governance framework.

Five architecture layers: Training | Model | RAG | Orchestration | Runtime
Five governance constituents: Data Governance | Model Security | Output & Content Integrity | Operational & Human Oversight | Ethics Rights & Fairness
EoE = Evidence of Existence (policies, procedures, templates). PoE = Proof of Execution (logs, test results, metrics).
Maturity: ML-2 = EoE present. ML-3 = EoE + systematic PoE. ML-4 = KPI-driven (requires 12 months prior ML-3).

Respond ONLY with valid JSON. No preamble, no markdown fences.`;

export async function compileArticle(articleText: string): Promise<LexArchResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5', max_tokens: 1024, system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Map this regulatory article to the COMPASS framework:

${articleText}

Return JSON:
{"layer":"training|model|rag|orchestration|runtime","constituent":"data_governance|model_security|output_integrity|human_oversight|ethics_fairness","controlName":"5-8 word name","controlObjective":"one sentence","technicalSafeguards":["s1","s2"],"eoeItems":["e1","e2"],"poeItems":["p1 + retest frequency"],"maturityLevel":"ML-2|ML-3|ML-4","thesisRef":"ISO/standard or article","owaspRef":"§x.x or empty","jurisdictionMapping":"EU|US|CN combinations"}` }]
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  try { return JSON.parse(content.text) as LexArchResult; }
  catch { throw new Error('Failed to parse Claude API response as JSON'); }
}
```

---

## Maturity Scoring — `lib/utils.ts`

```typescript
type EvidenceRow = { layer: string; evidence_type: string; checked: boolean;
  last_tested?: string | null; retest_frequency?: string | null; };

export function calculateMaturityScore(items: EvidenceRow[], layer: string): 'ml1' | 'ml2' | 'ml3' {
  const layerItems = items.filter(e => e.layer === layer);
  if (!layerItems.length) return 'ml1';
  const eoe = layerItems.filter(e => e.evidence_type === 'eoe');
  const poe = layerItems.filter(e => e.evidence_type === 'poe');
  const eoeChecked = eoe.filter(e => e.checked).length;
  const poeChecked = poe.filter(e => e.checked).length;
  const stale = poe.some(e => {
    if (!e.checked || !e.last_tested || !e.retest_frequency) return false;
    const days = (Date.now() - new Date(e.last_tested).getTime()) / 86400000;
    return days > (e.retest_frequency === 'monthly' ? 45 : e.retest_frequency === 'quarterly' ? 100 : 400);
  });
  if (eoe.length && eoeChecked >= Math.ceil(eoe.length / 2) && poeChecked >= 1 && !stale) return 'ml3';
  if (eoeChecked >= 1) return 'ml2';
  return 'ml1';
}

export function calculateSystemMaturity(items: EvidenceRow[], layers: string[]): 'ml1' | 'ml2' | 'ml3' {
  if (!layers.length) return 'ml1';
  const scores = layers.map(l => calculateMaturityScore(items, l));
  if (scores.every(s => s === 'ml3')) return 'ml3';
  if (scores.some(s => s !== 'ml1')) return 'ml2';
  return 'ml1';
}

export const MATURITY_LABELS = {
  ml1: { label: 'ML-1 Initial', color: 'red',   description: 'Ad hoc. No documented controls.' },
  ml2: { label: 'ML-2 Managed', color: 'amber', description: 'Policies exist. EoE present.' },
  ml3: { label: 'ML-3 Defined', color: 'green', description: 'PoE systematic. Auditable. Dossier-ready.' },
};
```

---

## Build Steps

Work through these in order. Tell Claude Code the step number at the start of each session.
You control the pace — spend as much time on each step as you need.

---

### Phase 1 — Setup

**Step 1 — Bootstrap**
```bash
npx create-next-app@14 compass-os-poc --typescript --tailwind --app
cd compass-os-poc
npm install @supabase/supabase-js @anthropic-ai/sdk
```
Create `CLAUDE.md` (paste from above). Create `.env.local` with your three env vars. Add `.env.local` to `.gitignore`. Push to GitHub.

**Step 2 — Database**
Supabase dashboard → SQL Editor → paste and run the schema. Enable Storage → create a bucket called `evidence-files` set to public. Create `lib/db/supabase.ts` with the Supabase client.

**Step 3 — Data constants**
Create all five files in `lib/data/` and paste the constants from this brief. These files do not change — they are the thesis encoded as TypeScript.

**Step 4 — First deployment**
Vercel → Import project → select your GitHub repo → add the three env vars → deploy. Confirm you get a live `.vercel.app` URL before building any features.

---

### Phase 2 — Registration & classification

**Step 5 — Registration form (`/register`)**
Multi-step form:
- Step 1: System name, purpose (textarea), sector (BFSI / Healthcare / Public sector / Enterprise / Other)
- Step 2: Deployment type — 6 radio cards with descriptions from `DEPLOYMENT_TYPES`
- Step 3: Jurisdictions — EU / US / CN checkboxes (at least one required)
- Step 4: Architecture layers — Training / Model / RAG / Orchestration / Runtime checkboxes
- Step 5: AI SBoM — base model, embedding model, vector DB, orchestration framework, plugins
- Step 6: Third-party vendor — vendor name, assessment status dropdown, last audit date

On submit: call `classifySystem()`, save to `systems` table, redirect to `/systems/[id]`.

**Step 6 — System dashboard (`/systems/[id]`)**
Show: system name, EU AI Act risk tier badge (colour-coded by tier), overall maturity badge, sector, jurisdictions. Navigation cards to each of the 5 modules. EoE and PoE completion percentages.

**Step 7 — Risk classification + threat model (`/systems/[id]/classify`)**
Top section: show `ClassificationResult` — tier label, article, description, obligations list.
Bottom section: 7 OWASP threat model question cards. Each card: question, collapsible context, radio buttons (Yes / No / Partial / Unknown). When answer is No or Partial: show the `evidenceIfNo` hint in amber. Save to `threat_model` table.

---

### Phase 3 — Intelligence modules

**Step 8 — Jurisdiction overlap matrix (`/systems/[id]/matrix`)**
Show only the jurisdictions the user selected. Universal risks section: 10 green cards from `UNIVERSAL_RISKS`. Divergence section: relevant red cards from `DIVERGENT_CONTROLS`. Below: artifact reuse panel — 4 rows from `ARTIFACT_REUSE_MAPPINGS`.

**Step 9 — LexArch article compiler (`/systems/[id]/lexarch`)**
Large textarea: "Paste any regulatory article…". Submit calls `compileArticle()` server action. Show loading state during the API call. Display result: layer badge, constituent badge, control name, control objective, technical safeguards list, EoE items list, PoE items list, maturity level, thesis ref, OWASP ref badge if present, jurisdiction mapping. "Add to evidence checklist" button creates evidence rows in the database. Save to `lexarch_results`. Show history of previous compilations.

---

### Phase 4 — Evidence & scoring

**Step 10 — Seed evidence on registration**
When a system is created (Step 5), auto-create evidence rows for all controls in `ALL_CONTROLS` that match the user's selected layers. All rows start with `checked = false`. The checklist is pre-populated from day one.

**Step 11 — Evidence checklist (`/systems/[id]/evidence`)**
Group by governance constituent, then by layer. Progress bar per constituent. For each item:
- Checkbox to mark complete
- Label with thesis ref in small muted text
- Teal "OWASP §x.x" badge if `owaspRef` is set
- If EoE and `requiresFile`: file upload slot (Supabase Storage)
- If PoE and `requiresDate`: date picker for `last_tested` + frequency dropdown
- Optional notes field

**Step 12 — Maturity heatmap**
Below the checklist: 5×5 grid (constituents × layers). Each cell shows ML-1/2/3 with colour from `calculateMaturityScore()`. Stale PoE items (overdue for retesting) get a yellow ⚠ icon on their cell. Clicking a cell scrolls to that section of the checklist.

**Step 13 — Artifact reuse indicator**
Panel on the evidence page showing which checked evidence items satisfy multiple jurisdictional obligations simultaneously. Match checked item labels against `ARTIFACT_REUSE_MAPPINGS`.

---

### Phase 5 — Dossier & export

**Step 14 — Dossier preview (`/systems/[id]/dossier`)**
Generate markdown from all system data. Render as styled HTML. Show "Dossier readiness" indicator at top: green if ML-3, amber if ML-2, red if ML-1. Show list of what is missing before the dossier is complete.

The dossier structure (mirror EU AI Act Art. 11):
1. System description (name, purpose, sector, deployment type, jurisdictions)
2. EU AI Act risk classification (tier, article, obligations)
3. AI SBoM (base model, RAG stack, plugins)
4. Third-party vendor assessment
5. OWASP threat model summary (7 questions + answers)
6. Architecture layers in scope
7. Current maturity assessment (ML-1/2/3 with IEC 62443 §5.4 note on ML-4)
8. Evidence summary (EoE list + PoE list)
9. Jurisdiction artifact reuse map
10. LexArch compilation results

**Step 15 — Export**
"Download PDF" button — use `jsPDF` or `react-pdf`. "Download Markdown" button. "Copy to clipboard" button. The PDF must be clean enough for a regulator or examiner to read without knowing what COMPASS is.

---

### Phase 6 — Polish & launch

**Step 16 — Landing page (`/`)**
Three sections: what the problem is (plain language, not academic), what the prototype does, how to get started. Single CTA: "Register your AI system →". Links to GitHub and to the thesis.

**Step 17 — Error handling & empty states**
Every data-fetching page: loading state, error state, empty state. LexArch: if Claude API returns malformed JSON, show clear error with "Try again" button.

**Step 18 — README.md**
Write a README explaining: what COMPASS is, what this prototype demonstrates, how to run locally, how it maps to the thesis, the OWASP integration, and the live URL.

**Step 19 — Architecture diagram & screenshots**
Create a diagram showing the 8 screens and data flow. Take screenshots of all 8 screens at 1440px. These go into the PEC3 prototype chapter.

**Step 20 — Final live test**
Confirm all three env vars are set in Vercel. Register COMPASS itself as a test system (it is a Model API deployment, operating in EU jurisdiction, using Claude). Generate a dossier. Download the PDF. Share the live URL with your supervisor.

---

## Rules That Never Change

**No AI calls for scoring.** Maturity is calculated deterministically. Only LexArch calls the Claude API. The governance logic must be auditable.

**Static thesis data is sacred.** The constants in `lib/data/` encode validated research. Never modify them.

**ML-4 is blocked.** IEC 62443 §5.4 requires 12 months of prior ML-3. If any code returns 'ml4', that is a bug.

**OWASP items are visually distinct.** Any evidence item with `owaspRef` shows a teal "OWASP §x.x" badge everywhere it appears.

**The dossier is for regulators.** Plain language. No jargon. Someone who has never heard of COMPASS should be able to read the PDF and understand the compliance posture.

---

## Git & GitHub

The repository is at **github.com/AdrianaFreitas/compass-os-poc**.

After every meaningful change:
1. Stage the relevant files
2. Write a clean, descriptive commit message (imperative mood, explain *why* not just *what*)
3. Push to `main` immediately so there is always a saved version on GitHub

This allows easy revert to any prior state if something breaks.
