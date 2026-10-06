BEGIN;
DO $verify$
BEGIN
  IF (SELECT count(*) FROM software_discovery.products) <> 30
    OR (SELECT count(*) FROM software_discovery.products WHERE slug='obsidian' AND status='published') <> 1
    OR (SELECT count(*) FROM software_discovery.products WHERE slug<>'obsidian' AND status='draft') <> 29 THEN
    RAISE EXCEPTION 'Expected only Obsidian published and 29 other draft products';
  END IF;
  IF (SELECT count(*) FROM software_discovery.escape_routes) <> 3
    OR EXISTS (SELECT 1 FROM software_discovery.escape_routes WHERE status<>'draft' OR editorially_approved) THEN
    RAISE EXCEPTION 'Expected all three Escape Routes to remain unapproved drafts';
  END IF;
END $verify$;
SET LOCAL ROLE anon;
WITH page AS (SELECT software_discovery.product_discovery_page('obsidian') AS p)
SELECT 'obsidian_published' AS check_name, coalesce(p->>'status'='published',false) AS matches FROM page
UNION ALL SELECT 'obsidian_identity', coalesce(p->>'slug'='obsidian' AND p->>'name'='Obsidian',false) FROM page
UNION ALL SELECT 'linked_evidence_available', EXISTS(SELECT 1 FROM page, jsonb_array_elements(p->'attributes') a WHERE a->>'slug'='markdown-files' AND jsonb_array_length(a->'sources')>0)
UNION ALL SELECT 'routes_unpublished', coalesce(jsonb_array_length(p->'routes')=0,false) FROM page
UNION ALL SELECT 'drafts_hidden', software_discovery.product_discovery_page('logseq') IS NULL
UNION ALL SELECT 'missing_hidden', software_discovery.product_discovery_page('product-that-does-not-exist') IS NULL
UNION ALL SELECT 'raw_evidence_private', NOT has_table_privilege(current_user,'software_discovery.evidence_sources','SELECT') AND NOT has_table_privilege(current_user,'software_discovery.claim_evidence','SELECT');
ROLLBACK;
