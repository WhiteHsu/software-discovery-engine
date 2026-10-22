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
), product_views AS (
 SELECT jsonb_build_array(lower(e->>'sessionId'),lower(e->>'pageViewId'),e->>'productSlug',e->>'originSurface') page,
 COALESCE(e->>'originSurface','unattributed') origin,min((e->>'occurredAt')::timestamptz) occurred
 FROM events WHERE name='page_viewed' AND e->>'surface'='product' GROUP BY page,origin
), actions AS (
 SELECT e,jsonb_build_array(lower(e->>'sessionId'),lower(e->>'pageViewId'),e->>'productSlug',e->>'originSurface') page,
 COALESCE(e->>'originSurface','unattributed') origin,(e->>'occurredAt')::timestamptz occurred FROM events WHERE name='outbound_clicked'
), converted AS (
 SELECT DISTINCT v.origin,v.page FROM product_views v JOIN actions a ON a.page=v.page AND a.occurred>=v.occurred
)
SELECT s.origin,(SELECT count(*) FROM product_views v WHERE v.origin=s.origin) product_views,
 (SELECT count(*) FROM converted c WHERE c.origin=s.origin) outbound_product_views,
 (SELECT count(*) FROM converted c WHERE c.origin=s.origin)::numeric/NULLIF((SELECT count(*) FROM product_views v WHERE v.origin=s.origin),0) outbound_ctr,
 (SELECT count(*) FROM actions a WHERE a.origin=s.origin AND NOT EXISTS(SELECT FROM product_views v WHERE v.page=a.page AND v.occurred<=a.occurred)) unmatched_outbound
FROM (VALUES ('search'),('escape'),('hidden_gems'),('unattributed')) s(origin);
