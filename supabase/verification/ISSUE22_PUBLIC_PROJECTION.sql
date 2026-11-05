-- Read-only Issue 22 check of the public product projection.
WITH candidates(slug) AS (
 VALUES ('affine'), ('joplin'), ('obsidian'), ('standard-notes')
), projections AS MATERIALIZED (
 SELECT slug, software_discovery.product_discovery_page(slug)::jsonb AS page
 FROM candidates
)
SELECT slug, page IS NOT NULL AS product_available,
       coalesce((page->'attributes') @> '[{"slug":"personal-note-portability-scope"}]'::jsonb, false)
         AS portability_claim_exposed
FROM projections ORDER BY slug;
