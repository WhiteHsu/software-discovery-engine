-- PR2.4 — Security & Data API Boundary
-- Issue #2 — Discovery Graph Data Model
--
-- Public-read contract:
--   * Taxonomy nodes are readable.
--   * Products are readable only when published.
--   * Product relationships are readable only when their parent product is published.
--   * Escape Routes are readable only when published AND editorially approved.
--   * Escape Route membership is readable only when both route and product are public.
--   * Evidence tables remain private to privileged server/database roles.
--
-- Write contract:
--   * anon/authenticated receive no INSERT/UPDATE/DELETE privileges.
--
-- Scope: software_discovery schema only. No seed data. No Lingyu/public changes.

begin;

-- The schema is intentionally exposed through Supabase Data API, but exposure
-- does not imply table access. CREATE remains forbidden to client roles.
revoke create on schema software_discovery from anon, authenticated;
grant usage on schema software_discovery to anon, authenticated;

-- Reset client-role table privileges inside this schema, then explicitly grant
-- only the public read surface below. This keeps evidence deny-by-default.
revoke all privileges on all tables in schema software_discovery from anon, authenticated;

grant select on table
  software_discovery.products,
  software_discovery.anchors,
  software_discovery.attributes,
  software_discovery.problems,
  software_discovery.audiences,
  software_discovery.product_attributes,
  software_discovery.product_anchors,
  software_discovery.product_problems,
  software_discovery.product_audiences,
  software_discovery.escape_routes,
  software_discovery.escape_route_products
  to anon, authenticated;

-- Evidence is deliberately not part of the public Data API contract.
revoke all privileges on table
  software_discovery.evidence_sources,
  software_discovery.claim_evidence
  from anon, authenticated;

-- Defensive: RLS remains enabled on every Data API-facing table.
alter table software_discovery.products enable row level security;
alter table software_discovery.anchors enable row level security;
alter table software_discovery.attributes enable row level security;
alter table software_discovery.problems enable row level security;
alter table software_discovery.audiences enable row level security;
alter table software_discovery.product_attributes enable row level security;
alter table software_discovery.product_anchors enable row level security;
alter table software_discovery.product_problems enable row level security;
alter table software_discovery.product_audiences enable row level security;
alter table software_discovery.escape_routes enable row level security;
alter table software_discovery.escape_route_products enable row level security;
alter table software_discovery.evidence_sources enable row level security;
alter table software_discovery.claim_evidence enable row level security;

-- Re-runnable policy definitions make recovery from a partially applied manual
-- development run straightforward without broadening the security boundary.
drop policy if exists taxonomy_public_read on software_discovery.anchors;
create policy taxonomy_public_read
  on software_discovery.anchors
  for select
  to anon, authenticated
  using (true);

drop policy if exists taxonomy_public_read on software_discovery.attributes;
create policy taxonomy_public_read
  on software_discovery.attributes
  for select
  to anon, authenticated
  using (true);

drop policy if exists taxonomy_public_read on software_discovery.problems;
create policy taxonomy_public_read
  on software_discovery.problems
  for select
  to anon, authenticated
  using (true);

drop policy if exists taxonomy_public_read on software_discovery.audiences;
create policy taxonomy_public_read
  on software_discovery.audiences
  for select
  to anon, authenticated
  using (true);

-- Products are editorial objects. Draft/review/archived rows stay invisible.
drop policy if exists published_products_public_read on software_discovery.products;
create policy published_products_public_read
  on software_discovery.products
  for select
  to anon, authenticated
  using (status = 'published');

-- Product graph edges inherit the publication state of their parent product.
drop policy if exists published_product_relationships_public_read on software_discovery.product_attributes;
create policy published_product_relationships_public_read
  on software_discovery.product_attributes
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from software_discovery.products p
      where p.id = product_attributes.product_id
        and p.status = 'published'
    )
  );

drop policy if exists published_product_relationships_public_read on software_discovery.product_anchors;
create policy published_product_relationships_public_read
  on software_discovery.product_anchors
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from software_discovery.products p
      where p.id = product_anchors.product_id
        and p.status = 'published'
    )
  );

drop policy if exists published_product_relationships_public_read on software_discovery.product_problems;
create policy published_product_relationships_public_read
  on software_discovery.product_problems
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from software_discovery.products p
      where p.id = product_problems.product_id
        and p.status = 'published'
    )
  );

drop policy if exists published_product_relationships_public_read on software_discovery.product_audiences;
create policy published_product_relationships_public_read
  on software_discovery.product_audiences
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from software_discovery.products p
      where p.id = product_audiences.product_id
        and p.status = 'published'
    )
  );

-- Escape Routes require both lifecycle publication and explicit editorial approval.
drop policy if exists approved_escape_routes_public_read on software_discovery.escape_routes;
create policy approved_escape_routes_public_read
  on software_discovery.escape_routes
  for select
  to anon, authenticated
  using (
    status = 'published'
    and editorially_approved = true
  );

-- Membership/ranking rows are public only when both ends are public.
drop policy if exists public_escape_route_products_read on software_discovery.escape_route_products;
create policy public_escape_route_products_read
  on software_discovery.escape_route_products
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from software_discovery.escape_routes er
      where er.id = escape_route_products.escape_route_id
        and er.status = 'published'
        and er.editorially_approved = true
    )
    and exists (
      select 1
      from software_discovery.products p
      where p.id = escape_route_products.product_id
        and p.status = 'published'
    )
  );

-- No SELECT policies are created for evidence_sources or claim_evidence.
-- Combined with the privilege revocation above, they remain private.
-- No INSERT/UPDATE/DELETE policies are created anywhere for client roles.

commit;
