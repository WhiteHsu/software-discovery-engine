-- PR2.3.1 — Graph Relationships & Escape Routes
-- Fix: all foreign keys referencing PR2.1 core entities use UUID.
-- Scope: relationship tables + escape routes only.
-- Security: RLS enabled; access policies are deferred to PR2.4.

begin;

create table software_discovery.product_attributes (
  product_id uuid not null
    references software_discovery.products(id) on delete cascade,
  attribute_id uuid not null
    references software_discovery.attributes(id) on delete cascade,
  value_boolean boolean,
  value_text text,
  value_number numeric,
  value_enum text,
  confidence numeric(4,3),
  verification_status text not null default 'unknown'
    check (verification_status in ('verified', 'likely', 'unknown')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, attribute_id),
  constraint product_attributes_single_value_chk check (
    num_nonnulls(value_boolean, value_text, value_number, value_enum) <= 1
  ),
  constraint product_attributes_confidence_chk check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  )
);

create table software_discovery.product_anchors (
  product_id uuid not null
    references software_discovery.products(id) on delete cascade,
  anchor_id uuid not null
    references software_discovery.anchors(id) on delete cascade,
  relationship_type text not null default 'alternative'
    check (relationship_type in ('alternative', 'replacement', 'complement')),
  confidence numeric(4,3),
  verification_status text not null default 'unknown'
    check (verification_status in ('verified', 'likely', 'unknown')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (product_id, anchor_id, relationship_type),
  constraint product_anchors_confidence_chk check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  )
);

create table software_discovery.product_problems (
  product_id uuid not null
    references software_discovery.products(id) on delete cascade,
  problem_id uuid not null
    references software_discovery.problems(id) on delete cascade,
  confidence numeric(4,3),
  verification_status text not null default 'unknown'
    check (verification_status in ('verified', 'likely', 'unknown')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (product_id, problem_id),
  constraint product_problems_confidence_chk check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  )
);

create table software_discovery.product_audiences (
  product_id uuid not null
    references software_discovery.products(id) on delete cascade,
  audience_id uuid not null
    references software_discovery.audiences(id) on delete cascade,
  confidence numeric(4,3),
  verification_status text not null default 'unknown'
    check (verification_status in ('verified', 'likely', 'unknown')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (product_id, audience_id),
  constraint product_audiences_confidence_chk check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  )
);

create table software_discovery.escape_routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  anchor_id uuid
    references software_discovery.anchors(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'archived')),
  editorially_approved boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table software_discovery.escape_route_products (
  escape_route_id uuid not null
    references software_discovery.escape_routes(id) on delete cascade,
  product_id uuid not null
    references software_discovery.products(id) on delete cascade,
  position integer,
  relevance_score numeric(6,3),
  constraint_fit_score numeric(6,3),
  quality_score numeric(6,3),
  novelty_score numeric(6,3),
  editorial_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (escape_route_id, product_id),
  constraint escape_route_products_position_chk check (
    position is null or position > 0
  )
);

create index product_attributes_attribute_id_idx
  on software_discovery.product_attributes(attribute_id);

create index product_anchors_anchor_id_idx
  on software_discovery.product_anchors(anchor_id);

create index product_problems_problem_id_idx
  on software_discovery.product_problems(problem_id);

create index product_audiences_audience_id_idx
  on software_discovery.product_audiences(audience_id);

create index escape_routes_anchor_id_idx
  on software_discovery.escape_routes(anchor_id);

create index escape_routes_status_idx
  on software_discovery.escape_routes(status);

create index escape_route_products_product_id_idx
  on software_discovery.escape_route_products(product_id);

alter table software_discovery.product_attributes enable row level security;
alter table software_discovery.product_anchors enable row level security;
alter table software_discovery.product_problems enable row level security;
alter table software_discovery.product_audiences enable row level security;
alter table software_discovery.escape_routes enable row level security;
alter table software_discovery.escape_route_products enable row level security;

comment on table software_discovery.product_attributes is
  'Evidence-aware product-to-attribute relationships. Unknown remains distinct from false.';
comment on table software_discovery.product_anchors is
  'Relationships between discovered products and mainstream anchor products or concepts.';
comment on table software_discovery.product_problems is
  'Problems a product may address, with confidence and verification state.';
comment on table software_discovery.product_audiences is
  'Audience segments a product may fit, with confidence and verification state.';
comment on table software_discovery.escape_routes is
  'Editorial discovery routes from a mainstream anchor or constraint toward lesser-known software.';
comment on table software_discovery.escape_route_products is
  'Curated candidate membership and bounded ranking inputs for an Escape Route.';

commit;
