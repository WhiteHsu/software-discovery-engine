-- PR3.2B — Durable seed identity and typed claim/evidence associations.
-- Additive only; does not import data or change public-read policies.
begin;

-- NULL permits existing/manual provenance records without seed ownership.
alter table software_discovery.evidence_sources
  add column seed_key text unique
  check (seed_key is null or length(btrim(seed_key)) > 0);
alter table software_discovery.claim_evidence
  add column seed_key text unique
  check (seed_key is null or length(btrim(seed_key)) > 0);

create table software_discovery.product_attribute_evidence (
  product_id uuid not null,
  attribute_id uuid not null,
  claim_evidence_id uuid not null references software_discovery.claim_evidence(id) on delete cascade,
  primary key (product_id, attribute_id, claim_evidence_id),
  foreign key (product_id, attribute_id)
    references software_discovery.product_attributes(product_id, attribute_id) on delete cascade
);

create table software_discovery.product_anchor_evidence (
  product_id uuid not null,
  anchor_id uuid not null,
  relationship_type text not null,
  claim_evidence_id uuid not null references software_discovery.claim_evidence(id) on delete cascade,
  primary key (product_id, anchor_id, relationship_type, claim_evidence_id),
  foreign key (product_id, anchor_id, relationship_type)
    references software_discovery.product_anchors(product_id, anchor_id, relationship_type) on delete cascade
);

create table software_discovery.product_problem_evidence (
  product_id uuid not null,
  problem_id uuid not null,
  claim_evidence_id uuid not null references software_discovery.claim_evidence(id) on delete cascade,
  primary key (product_id, problem_id, claim_evidence_id),
  foreign key (product_id, problem_id)
    references software_discovery.product_problems(product_id, problem_id) on delete cascade
);

create table software_discovery.product_audience_evidence (
  product_id uuid not null,
  audience_id uuid not null,
  claim_evidence_id uuid not null references software_discovery.claim_evidence(id) on delete cascade,
  primary key (product_id, audience_id, claim_evidence_id),
  foreign key (product_id, audience_id)
    references software_discovery.product_audiences(product_id, audience_id) on delete cascade
);

create index product_attribute_evidence_fragment_idx on software_discovery.product_attribute_evidence(claim_evidence_id);
create index product_anchor_evidence_fragment_idx on software_discovery.product_anchor_evidence(claim_evidence_id);
create index product_problem_evidence_fragment_idx on software_discovery.product_problem_evidence(claim_evidence_id);
create index product_audience_evidence_fragment_idx on software_discovery.product_audience_evidence(claim_evidence_id);

alter table software_discovery.product_attribute_evidence enable row level security;
alter table software_discovery.product_anchor_evidence enable row level security;
alter table software_discovery.product_problem_evidence enable row level security;
alter table software_discovery.product_audience_evidence enable row level security;
revoke all privileges on table
  software_discovery.product_attribute_evidence,
  software_discovery.product_anchor_evidence,
  software_discovery.product_problem_evidence,
  software_discovery.product_audience_evidence
  from anon, authenticated;

comment on column software_discovery.evidence_sources.seed_key is
  'Stable seed source identity; NULL for provenance not managed by seed tooling.';
comment on column software_discovery.claim_evidence.seed_key is
  'Stable seed claim/source identity; NULL for manually recorded fragments.';
comment on table software_discovery.product_attribute_evidence is 'Private typed association between a product attribute claim and evidence fragments.';
comment on table software_discovery.product_anchor_evidence is 'Private typed association including the anchor relationship type.';
comment on table software_discovery.product_problem_evidence is 'Private typed association between a product problem claim and evidence fragments.';
comment on table software_discovery.product_audience_evidence is 'Private typed association between a product audience claim and evidence fragments.';
commit;
