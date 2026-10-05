-- PR2.1 — Core Graph Schema
-- Issue #2 — Discovery Graph Data Model
-- Creates canonical graph nodes only. Touches only software_discovery.

begin;

create extension if not exists pgcrypto with schema extensions;

create table software_discovery.products (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  short_description text,
  website_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_name_nonempty_chk check (length(btrim(name)) > 0),
  constraint products_short_description_nonempty_chk check (short_description is null or length(btrim(short_description)) > 0),
  constraint products_website_url_http_chk check (website_url is null or website_url ~* '^https?://'),
  constraint products_status_chk check (status in ('draft','review','published','archived')),
  constraint products_slug_key unique (slug)
);

create table software_discovery.anchors (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anchors_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint anchors_name_nonempty_chk check (length(btrim(name)) > 0),
  constraint anchors_description_nonempty_chk check (description is null or length(btrim(description)) > 0),
  constraint anchors_slug_key unique (slug)
);

create table software_discovery.attributes (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  category text not null,
  value_type text not null default 'boolean',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attributes_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint attributes_name_nonempty_chk check (length(btrim(name)) > 0),
  constraint attributes_description_nonempty_chk check (description is null or length(btrim(description)) > 0),
  constraint attributes_category_format_chk check (category ~ '^[a-z][a-z0-9_]*$'),
  constraint attributes_value_type_chk check (value_type in ('boolean','text','number','enum')),
  constraint attributes_slug_key unique (slug)
);

create table software_discovery.problems (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint problems_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint problems_name_nonempty_chk check (length(btrim(name)) > 0),
  constraint problems_description_nonempty_chk check (description is null or length(btrim(description)) > 0),
  constraint problems_slug_key unique (slug)
);

create table software_discovery.audiences (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint audiences_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint audiences_name_nonempty_chk check (length(btrim(name)) > 0),
  constraint audiences_description_nonempty_chk check (description is null or length(btrim(description)) > 0),
  constraint audiences_slug_key unique (slug)
);

comment on table software_discovery.products is 'Canonical software product identities. Evidence-backed claims and constraints belong in graph relationships, not product columns.';
comment on table software_discovery.anchors is 'Mainstream or reference software products/concepts that users may want to replace or escape.';
comment on table software_discovery.attributes is 'Controlled discovery taxonomy for product constraints and characteristics; not free-form tags.';
comment on table software_discovery.problems is 'Canonical user problems that software products may address.';
comment on table software_discovery.audiences is 'Canonical audience segments that software products may fit.';
comment on column software_discovery.products.status is 'Editorial lifecycle: draft, review, published, or archived.';
comment on column software_discovery.attributes.category is 'Taxonomy namespace such as pricing, privacy, ai, offline, platform, ownership, workflow, or complexity.';
comment on column software_discovery.attributes.value_type is 'Expected relationship value shape: boolean, text, number, or enum.';

-- Security baseline:
-- These tables are exposed through the Data API schema, so RLS is enabled
-- immediately. Access policies are intentionally deferred to PR2.4.
-- Until policies exist, client access remains deny-by-default.

alter table software_discovery.products enable row level security;
alter table software_discovery.anchors enable row level security;
alter table software_discovery.attributes enable row level security;
alter table software_discovery.problems enable row level security;
alter table software_discovery.audiences enable row level security;

-- updated_at is application-managed for now.
commit;
