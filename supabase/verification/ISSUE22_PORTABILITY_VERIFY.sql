WITH route AS (
 SELECT id, status, editorially_approved
 FROM software_discovery.escape_routes WHERE slug = 'portable-personal-notes'
), members AS (
 SELECT p.id, p.slug, p.status
 FROM route r
 JOIN software_discovery.escape_route_products rp ON rp.escape_route_id = r.id
 JOIN software_discovery.products p ON p.id = rp.product_id
), claims AS (
 SELECT m.id, a.id AS attribute_id
 FROM members m
 JOIN software_discovery.product_attributes pa ON pa.product_id = m.id
 JOIN software_discovery.attributes a ON a.id = pa.attribute_id
 WHERE a.slug = 'personal-note-portability-scope'
   AND pa.verification_status = 'verified' AND pa.value_text <> ''
)
SELECT 'route_is_unapproved_draft' AS check_name,
       EXISTS (SELECT 1 FROM route WHERE status = 'draft' AND NOT editorially_approved) AS passed
UNION ALL
SELECT 'four_expected_published_members',
       (SELECT array_agg(slug::text ORDER BY slug) FROM members WHERE status = 'published')
         IS NOT DISTINCT FROM ARRAY['affine','joplin','obsidian','standard-notes']
UNION ALL
SELECT 'four_scoped_claims_with_evidence',
       (SELECT count(*) = 4 FROM claims c WHERE EXISTS (
         SELECT 1 FROM software_discovery.product_attribute_evidence e
         WHERE e.product_id = c.id AND e.attribute_id = c.attribute_id
       ));
