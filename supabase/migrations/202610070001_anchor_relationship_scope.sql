-- PR5.7: schema/RPC support only; no graph import or publication.
begin;
alter table software_discovery.product_anchors
  add column relationship_scope text,
  add column scope_description text,
  add constraint product_anchors_scope_pair_chk check (
    (relationship_scope is null and scope_description is null) or
    (relationship_scope is not null and scope_description is not null
      and relationship_scope ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and length(btrim(scope_description)) > 0)
  );
comment on column software_discovery.product_anchors.relationship_scope is 'Bounded workflow classification identifier; null preserves legacy unscoped claims.';
comment on column software_discovery.product_anchors.scope_description is 'Public edition/workflow limits for this relationship; paired with relationship_scope.';
create or replace function software_discovery.product_discovery_page(product_slug text)
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $page$
SELECT jsonb_build_object('slug',p.slug,'name',p.name,'description',p.short_description,'websiteUrl',p.website_url,'status',p.status,
'attributes',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_attribute_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.attribute_id=c.attribute_id ),'[]'::jsonb)) || jsonb_build_object('value',coalesce(to_jsonb(c.value_boolean),to_jsonb(c.value_text),to_jsonb(c.value_number),to_jsonb(c.value_enum))) ORDER BY t.slug) FROM software_discovery.product_attributes c JOIN software_discovery.attributes t ON t.id=c.attribute_id WHERE c.product_id=p.id),'[]'::jsonb),
'anchors',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',coalesce(c.scope_description,t.description),'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_anchor_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.anchor_id=c.anchor_id AND l.relationship_type=c.relationship_type),'[]'::jsonb)) || jsonb_build_object('relationshipType',c.relationship_type,'scope',c.relationship_scope) ORDER BY t.slug) FROM software_discovery.product_anchors c JOIN software_discovery.anchors t ON t.id=c.anchor_id WHERE c.product_id=p.id),'[]'::jsonb),
'problems',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_problem_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.problem_id=c.problem_id ),'[]'::jsonb)) || '{}'::jsonb ORDER BY t.slug) FROM software_discovery.product_problems c JOIN software_discovery.problems t ON t.id=c.problem_id WHERE c.product_id=p.id),'[]'::jsonb),
'audiences',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_audience_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.audience_id=c.audience_id ),'[]'::jsonb)) || '{}'::jsonb ORDER BY t.slug) FROM software_discovery.product_audiences c JOIN software_discovery.audiences t ON t.id=c.audience_id WHERE c.product_id=p.id),'[]'::jsonb),
'routes',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',r.slug,'name',r.name,'description',r.description) ORDER BY r.slug)
FROM software_discovery.escape_route_products l JOIN software_discovery.escape_routes r ON r.id=l.escape_route_id
WHERE l.product_id=p.id AND r.status='published' AND r.editorially_approved),'[]'::jsonb))
FROM software_discovery.products p WHERE p.slug=product_slug AND p.status='published';
$page$;
revoke all on function software_discovery.product_discovery_page(text) from public;
grant execute on function software_discovery.product_discovery_page(text) to anon, authenticated;
comment on function software_discovery.product_discovery_page(text) is 'Published product projection with linked source metadata only; draft products, private fragments, notes and unrelated sources excluded.';
notify pgrst, 'reload schema';
commit;
