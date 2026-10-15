-- PR5.59: SELECT only. Run in Supabase SQL Editor and export the single snapshot cell.
-- Post-import publication baseline for three existing meditation drafts; actual state must be observed. Single-statement SELECT only; no writes.
WITH targets AS (
 SELECT * FROM software_discovery.products
 WHERE slug IN ('medito','smiling-mind','healthy-minds-program')
), route AS (
 SELECT * FROM software_discovery.escape_routes WHERE slug='meditation-apps-without-a-subscription'
), evidence_ids AS (
 SELECT claim_evidence_id id FROM software_discovery.product_attribute_evidence WHERE product_id IN (SELECT id FROM targets)
 UNION SELECT claim_evidence_id FROM software_discovery.product_anchor_evidence WHERE product_id IN (SELECT id FROM targets)
 UNION SELECT claim_evidence_id FROM software_discovery.product_problem_evidence WHERE product_id IN (SELECT id FROM targets)
 UNION SELECT claim_evidence_id FROM software_discovery.product_audience_evidence WHERE product_id IN (SELECT id FROM targets)
), evidence AS (
 SELECT * FROM software_discovery.claim_evidence WHERE id IN (SELECT id FROM evidence_ids) OR evidence_source_id IN (SELECT id FROM software_discovery.evidence_sources WHERE seed_key LIKE 'meditation-%')
)
SELECT jsonb_build_object(
 'packet','PR5.59', 'captured_at',now(), 'read_only',true,
 'public_product_projections',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',slug,'page',software_discovery.product_discovery_page(slug)) ORDER BY slug) FROM targets),'[]'::jsonb),
 'public_read_rls',coalesce((SELECT jsonb_agg(jsonb_build_object('table_name',c.relname,'rls_enabled',c.relrowsecurity) ORDER BY c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='software_discovery' AND c.relname IN ('products','escape_routes','escape_route_products')),'[]'::jsonb),
 'public_read_policies',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY tablename,policyname) FROM pg_policies p WHERE schemaname='software_discovery' AND tablename IN ('products','escape_routes','escape_route_products')),'[]'::jsonb),
 'scope_columns',coalesce((SELECT jsonb_agg(jsonb_build_object('column_name',column_name,'data_type',data_type) ORDER BY column_name) FROM information_schema.columns WHERE table_schema='software_discovery' AND table_name='product_anchors' AND column_name IN ('relationship_scope','scope_description')),'[]'::jsonb),
 'published_products',coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb),
 'approved_published_routes',coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb),
 'products',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM targets t),'[]'::jsonb),
 'route',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM route t),'[]'::jsonb),
 'route_members',coalesce((SELECT jsonb_agg(to_jsonb(m)||jsonb_build_object('product_slug',p.slug) ORDER BY p.slug) FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id WHERE m.escape_route_id IN (SELECT id FROM route)),'[]'::jsonb),
 'target_route_memberships',coalesce((SELECT jsonb_agg(to_jsonb(m)||jsonb_build_object('route_slug',r.slug,'route_status',r.status,'editorially_approved',r.editorially_approved) ORDER BY r.slug,m.product_id) FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE m.product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_attributes',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,attribute_id) FROM software_discovery.product_attributes t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_anchors',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,anchor_id,relationship_type) FROM software_discovery.product_anchors t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_problems',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,problem_id) FROM software_discovery.product_problems t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_audiences',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,audience_id) FROM software_discovery.product_audiences t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_attribute_evidence',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,attribute_id,claim_evidence_id) FROM software_discovery.product_attribute_evidence t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_anchor_evidence',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,anchor_id,relationship_type,claim_evidence_id) FROM software_discovery.product_anchor_evidence t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_problem_evidence',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,problem_id,claim_evidence_id) FROM software_discovery.product_problem_evidence t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'product_audience_evidence',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY product_id,audience_id,claim_evidence_id) FROM software_discovery.product_audience_evidence t WHERE product_id IN (SELECT id FROM targets)),'[]'::jsonb),
 'claim_evidence',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY seed_key) FROM evidence t),'[]'::jsonb),
 'evidence_sources',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY seed_key) FROM software_discovery.evidence_sources t WHERE id IN (SELECT evidence_source_id FROM evidence) OR seed_key LIKE 'meditation-%'),'[]'::jsonb),
 'taxonomy_attributes',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM software_discovery.attributes t WHERE id IN (SELECT attribute_id FROM software_discovery.product_attributes WHERE product_id IN (SELECT id FROM targets)) OR slug IN ('no-subscription','pricing-model','trade-off-summary')),'[]'::jsonb),
 'taxonomy_anchors',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM software_discovery.anchors t WHERE slug='calm' OR id IN (SELECT anchor_id FROM software_discovery.product_anchors WHERE product_id IN (SELECT id FROM targets))),'[]'::jsonb),
 'taxonomy_problems',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM software_discovery.problems t WHERE id IN (SELECT problem_id FROM software_discovery.product_problems WHERE product_id IN (SELECT id FROM targets))),'[]'::jsonb),
 'taxonomy_audiences',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM software_discovery.audiences t WHERE id IN (SELECT audience_id FROM software_discovery.product_audiences WHERE product_id IN (SELECT id FROM targets))),'[]'::jsonb),
 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
) AS snapshot;
