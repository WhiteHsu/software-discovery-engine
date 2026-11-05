-- Issue 22. Guard the production function body and preserve its existing definition metadata.
DO $patch$
DECLARE
  target regprocedure := 'software_discovery.product_discovery_page(text)'::regprocedure;
  expected_hash constant text := 'e95c772ff736eb3bd98a330e18a9b449';
  revised text := $revised$
SELECT jsonb_build_object('slug',p.slug,'name',p.name,'description',p.short_description,'websiteUrl',p.website_url,'status',p.status,
'attributes',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_attribute_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.attribute_id=c.attribute_id ),'[]'::jsonb)) || jsonb_build_object('value',coalesce(to_jsonb(c.value_boolean),to_jsonb(c.value_text),to_jsonb(c.value_number),to_jsonb(c.value_enum))) ORDER BY t.slug) FROM software_discovery.product_attributes c JOIN software_discovery.attributes t ON t.id=c.attribute_id WHERE c.product_id=p.id
  AND (
    t.slug <> 'personal-note-portability-scope'
    OR EXISTS (
      SELECT 1
      FROM software_discovery.escape_route_products rp
      JOIN software_discovery.escape_routes r ON r.id=rp.escape_route_id
      WHERE rp.product_id=p.id
        AND r.slug='portable-personal-notes'
        AND r.status='published'
        AND r.editorially_approved
    )
  )),'[]'::jsonb),
'anchors',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',coalesce(c.scope_description,t.description),'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_anchor_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.anchor_id=c.anchor_id AND l.relationship_type=c.relationship_type),'[]'::jsonb)) || jsonb_build_object('relationshipType',c.relationship_type,'scope',c.relationship_scope) ORDER BY t.slug) FROM software_discovery.product_anchors c JOIN software_discovery.anchors t ON t.id=c.anchor_id WHERE c.product_id=p.id),'[]'::jsonb),
'problems',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_problem_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.problem_id=c.problem_id ),'[]'::jsonb)) || '{}'::jsonb ORDER BY t.slug) FROM software_discovery.product_problems c JOIN software_discovery.problems t ON t.id=c.problem_id WHERE c.product_id=p.id),'[]'::jsonb),
'audiences',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'verificationStatus',c.verification_status,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at,'sources',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('title',s.title,'url',s.url,'retrievedAt',s.retrieved_at)) FROM software_discovery.product_audience_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.audience_id=c.audience_id ),'[]'::jsonb)) || '{}'::jsonb ORDER BY t.slug) FROM software_discovery.product_audiences c JOIN software_discovery.audiences t ON t.id=c.audience_id WHERE c.product_id=p.id),'[]'::jsonb),
'routes',coalesce((SELECT jsonb_agg(jsonb_build_object('slug',r.slug,'name',r.name,'description',r.description) ORDER BY r.slug)
FROM software_discovery.escape_route_products l JOIN software_discovery.escape_routes r ON r.id=l.escape_route_id
WHERE l.product_id=p.id AND r.status='published' AND r.editorially_approved),'[]'::jsonb))
FROM software_discovery.products p WHERE p.slug=product_slug AND p.status='published';
$revised$;
  actual text;
  definition text;
  candidate text;
  page jsonb;
BEGIN
  SELECT prosrc INTO STRICT actual FROM pg_catalog.pg_proc WHERE oid=target;
  IF btrim(replace(actual, chr(13), ''), E' \n\t') <> btrim(revised, E' \n\t') THEN
    IF md5(convert_to(actual, 'UTF8')) <> expected_hash THEN
      RAISE EXCEPTION 'Issue22 public projection definition drift';
    END IF;
    definition := pg_catalog.pg_get_functiondef(target);
    IF strpos(definition, actual) = 0 THEN
      RAISE EXCEPTION 'Issue22 function body could not be located';
    END IF;
    EXECUTE replace(definition, actual, revised);
  END IF;
  IF EXISTS (SELECT 1 FROM software_discovery.escape_routes
             WHERE slug='portable-personal-notes' AND status='published' AND editorially_approved) THEN
    RAISE EXCEPTION 'Issue22 expected the route to be unpublished';
  END IF;
  FOREACH candidate IN ARRAY ARRAY['affine','joplin','obsidian','standard-notes'] LOOP
    page := software_discovery.product_discovery_page(candidate);
    IF page IS NULL OR jsonb_typeof(page->'attributes') IS DISTINCT FROM 'array'
       OR (page->'attributes') @> '[{"slug":"personal-note-portability-scope"}]'::jsonb THEN
      RAISE EXCEPTION 'Issue22 public projection check failed for %', candidate;
    END IF;
  END LOOP;
END $patch$;
