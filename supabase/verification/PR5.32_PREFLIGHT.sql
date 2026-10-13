-- PR5.32: SELECT only. Run in Supabase SQL Editor and export the single snapshot cell.
-- Post-import publication baseline. Captures current state; no writes, approval or publication.
WITH targets AS (
 SELECT * FROM software_discovery.products
 WHERE slug IN ('pdf-xchange-editor','pdf24-creator','pdfgear')
), route AS (
 SELECT * FROM software_discovery.escape_routes WHERE slug='pdf-editors-without-a-subscription'
), evidence_ids AS (
 SELECT claim_evidence_id id FROM software_discovery.product_attribute_evidence WHERE product_id IN (SELECT id FROM targets)
 UNION SELECT claim_evidence_id FROM software_discovery.product_anchor_evidence WHERE product_id IN (SELECT id FROM targets)
 UNION SELECT claim_evidence_id FROM software_discovery.product_problem_evidence WHERE product_id IN (SELECT id FROM targets)
 UNION SELECT claim_evidence_id FROM software_discovery.product_audience_evidence WHERE product_id IN (SELECT id FROM targets)
), evidence AS (
 SELECT * FROM software_discovery.claim_evidence WHERE id IN (SELECT id FROM evidence_ids)
)
SELECT jsonb_build_object(
 'packet','PR5.32', 'captured_at',now(), 'read_only',true,
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
 'evidence_sources',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY seed_key) FROM software_discovery.evidence_sources t WHERE id IN (SELECT evidence_source_id FROM evidence) OR seed_key LIKE 'pdf-workflow-%'),'[]'::jsonb),
 'taxonomy_attributes',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM software_discovery.attributes t WHERE id IN (SELECT attribute_id FROM software_discovery.product_attributes WHERE product_id IN (SELECT id FROM targets)) OR slug IN ('no-subscription','pricing-model','trade-off-summary')),'[]'::jsonb),
 'taxonomy_anchors',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY slug) FROM software_discovery.anchors t WHERE slug='adobe-pdf' OR id IN (SELECT anchor_id FROM software_discovery.product_anchors WHERE product_id IN (SELECT id FROM targets))),'[]'::jsonb),
 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
) AS snapshot;
