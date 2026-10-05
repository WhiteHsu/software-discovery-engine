-- PR2.2 — Evidence & Verification Foundation
-- Issue #2 — Discovery Graph Data Model
--
-- Scope:
--   * Create reusable evidence-source and evidence-fragment primitives.
--   * Keep evidence separate from claims and verification judgments.
--   * Touch only the software_discovery schema.
--   * No product relationships, seed data, or access policies yet.

begin;

create table software_discovery.evidence_sources (
  id uuid primary key default extensions.gen_random_uuid(),
  source_type text not null,
  title text not null,
  url text,
  publisher text,
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint evidence_sources_source_type_chk
    check (
      source_type in (
        'official',
        'documentation',
        'pricing',
        'app_store',
        'repository',
        'third_party',
        'manual'
      )
    ),
  constraint evidence_sources_title_nonempty_chk
    check (length(btrim(title)) > 0),
  constraint evidence_sources_url_http_chk
    check (url is null or url ~* '^https?://'),
  constraint evidence_sources_publisher_nonempty_chk
    check (publisher is null or length(btrim(publisher)) > 0)
);

create table software_discovery.claim_evidence (
  id uuid primary key default extensions.gen_random_uuid(),
  evidence_source_id uuid not null,
  excerpt text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint claim_evidence_source_fk
    foreign key (evidence_source_id)
    references software_discovery.evidence_sources(id)
    on delete cascade,
  constraint claim_evidence_excerpt_nonempty_chk
    check (excerpt is null or length(btrim(excerpt)) > 0),
  constraint claim_evidence_notes_nonempty_chk
    check (notes is null or length(btrim(notes)) > 0),
  constraint claim_evidence_content_chk
    check (excerpt is not null or notes is not null)
);

create index claim_evidence_evidence_source_id_idx
  on software_discovery.claim_evidence(evidence_source_id);

comment on table software_discovery.evidence_sources is
  'Canonical provenance records for evidence used to support discovery claims.';
comment on column software_discovery.evidence_sources.source_type is
  'Source classification used for provenance and later evidence-quality evaluation.';
comment on column software_discovery.evidence_sources.retrieved_at is
  'Timestamp when this source was retrieved or checked for evidence.';

comment on table software_discovery.claim_evidence is
  'Evidence fragments extracted or recorded from an evidence source. Evidence is not itself a verification judgment.';
comment on column software_discovery.claim_evidence.excerpt is
  'Optional source-grounded excerpt or factual fragment. Keep quoted material short and attributable.';
comment on column software_discovery.claim_evidence.notes is
  'Optional reviewer notes about the evidence fragment; not a substitute for the underlying source.';

-- Security baseline: exposed-schema tables remain deny-by-default until
-- explicit access policies are designed in PR2.4.
alter table software_discovery.evidence_sources enable row level security;
alter table software_discovery.claim_evidence enable row level security;

-- updated_at remains application-managed during the validation MVP.
commit;
