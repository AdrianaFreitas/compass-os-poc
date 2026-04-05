-- COMPASS OS — Supabase Schema
-- Run this in: Supabase → SQL Editor → New query

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
