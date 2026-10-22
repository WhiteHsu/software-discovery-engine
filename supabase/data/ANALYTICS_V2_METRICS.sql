-- Owner-only read-only report; last seven days by received_at.
-- No diagnostic query text is returned. Known accepted QA is excluded.
WITH raw AS (
 SELECT payload FROM software_discovery.discovery_events WHERE received_at>=statement_timestamp()-interval '7 days'
 UNION ALL
 SELECT payload FROM software_discovery.discovery_events_v2 WHERE received_at>=statement_timestamp()-interval '7 days'
), events AS (
 SELECT payload e,
 CASE payload->>'name' WHEN 'product_click' THEN 'product_clicked' WHEN 'outbound_click' THEN 'outbound_clicked' WHEN 'product_view' THEN 'page_viewed' ELSE payload->>'name' END name
 FROM raw WHERE lower(payload->>'sessionId') NOT IN ('e20a7cc5-b115-46bc-bd7a-1e25f645bf20','dd469548-acd9-4fa9-8cec-124353f237f1','7f244ce2-4ebe-497c-bc8c-4a4c8b015529','61baa262-19fc-44b9-8053-3c080498ea85','c52c9eed-061e-4618-bf9f-5dc2f44a85b3','0033efa0-5a71-48af-9a56-291a6b7f81b0') AND lower(payload->>'eventId') NOT IN ('97f18f34-5fc4-4f44-9912-11edde1d1da7')
), placements AS (
 SELECT e,name,e->>'surface' surface,
 jsonb_build_array(lower(e->>'sessionId'),lower(e->>'pageViewId'),e->>'routeSlug',lower(e->>'searchId'),lower(e->>'resultSetId'),e->>'productSlug',lower(e->>'exposureId'),e->'position') placement,
 (e->>'occurredAt')::timestamptz occurred
 FROM events WHERE name IN ('product_impression','product_clicked') AND e->>'surface' IN ('search','escape','hidden_gems')
), impressions AS (
 SELECT surface,placement,min(occurred) occurred FROM placements WHERE name='product_impression' GROUP BY surface,placement
), clicked AS (
 SELECT DISTINCT i.surface,i.placement FROM impressions i JOIN placements c ON c.surface=i.surface AND c.placement=i.placement AND c.name='product_clicked' AND c.occurred>=i.occurred
), unmatched AS (
 SELECT c.surface,count(*) n FROM placements c WHERE c.name='product_clicked' AND NOT EXISTS(SELECT FROM impressions i WHERE i.surface=c.surface AND i.placement=c.placement AND i.occurred<=c.occurred) GROUP BY c.surface
)
SELECT s.surface,(SELECT count(*) FROM impressions i WHERE i.surface=s.surface) impressions,
 (SELECT count(*) FROM clicked c WHERE c.surface=s.surface) clicked_exposures,
 (SELECT count(*) FROM clicked c WHERE c.surface=s.surface)::numeric/NULLIF((SELECT count(*) FROM impressions i WHERE i.surface=s.surface),0) ctr,
 COALESCE((SELECT n FROM unmatched u WHERE u.surface=s.surface),0) unmatched_clicks
FROM (VALUES ('search'),('escape'),('hidden_gems')) s(surface);
