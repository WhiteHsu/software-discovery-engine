-- Read-only production precheck. Run this first; save its output.
select
  (select count(*) from software_discovery.products) as products,
  (select count(*) from software_discovery.anchors) as anchors,
  (select count(*) from software_discovery.attributes) as attributes,
  (select count(*) from software_discovery.problems) as problems,
  (select count(*) from software_discovery.audiences) as audiences,
  (select count(*) from software_discovery.evidence_sources) as evidence_sources,
  (select count(*) from software_discovery.claim_evidence) as claim_evidence,
  (select count(*) from software_discovery.product_attributes) as product_attributes,
  (select count(*) from software_discovery.product_anchors) as product_anchors,
  (select count(*) from software_discovery.product_problems) as product_problems,
  (select count(*) from software_discovery.product_audiences) as product_audiences,
  (select count(*) from software_discovery.escape_routes) as escape_routes,
  (select count(*) from software_discovery.escape_route_products) as route_memberships,
  exists (select 1 from information_schema.columns where table_schema='software_discovery' and table_name='evidence_sources' and column_name='seed_key') as source_seed_key_exists,
  exists (select 1 from information_schema.columns where table_schema='software_discovery' and table_name='claim_evidence' and column_name='seed_key') as fragment_seed_key_exists,
  (select count(*) from information_schema.tables where table_schema='software_discovery' and table_name in ('product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence')) as evidence_junction_tables;
