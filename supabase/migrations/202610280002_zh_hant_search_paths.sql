-- Locale-06 / #20 localized search. Owner-run only; no publication data or events are modified.
BEGIN;
SET LOCAL lock_timeout='5s';
SELECT pg_advisory_xact_lock(8220001);
DO $guard$
BEGIN
 IF current_user<>'postgres' THEN RAISE EXCEPTION 'Run as postgres'; END IF;
 IF NOT EXISTS(SELECT FROM pg_proc WHERE oid=to_regprocedure('software_discovery.ingest_discovery_events_v2(jsonb,text)') AND pg_get_userbyid(proowner)='postgres' AND prosecdef AND proconfig=ARRAY['search_path=pg_catalog']::text[] AND md5(replace(prosrc,E'\r',''))='2e2cff7619455b4d10d5c1b8333ea4ac') THEN RAISE EXCEPTION 'Ingestion definition drift: capture fresh metadata; no changes applied'; END IF;
 IF has_function_privilege('anon','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') OR has_function_privilege('authenticated','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') OR NOT has_function_privilege('service_role','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') THEN RAISE EXCEPTION 'Ingestion access drift'; END IF;
 IF EXISTS(SELECT FROM pg_class WHERE oid IN ('software_discovery.discovery_events_v2'::regclass,'software_discovery.discovery_queries_v2'::regclass) AND (NOT relrowsecurity OR NOT relforcerowsecurity)) THEN RAISE EXCEPTION 'Private storage drift'; END IF;
END $guard$;
CREATE OR REPLACE FUNCTION software_discovery.ingest_discovery_events_v2(batch jsonb,rate_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $ingest$
DECLARE e jsonb; clean jsonb; prior jsonb; q text; prior_q text; k text; t timestamptz; n integer; used integer; added integer=0;
 now_at timestamptz=statement_timestamp(); minute_at timestamptz=date_trunc('minute',statement_timestamp());
BEGIN
 IF rate_key IS NULL OR rate_key !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid server rate key'; END IF;
 IF jsonb_typeof(batch) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Array required'; END IF;
 n=jsonb_array_length(batch);IF n<1 OR n>20 OR octet_length(batch::text)>32768 THEN RAISE EXCEPTION 'Batch exceeded'; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(batch) LOOP
  IF jsonb_typeof(e) IS DISTINCT FROM 'object' OR e->'version' IS DISTINCT FROM '2'::jsonb OR EXISTS(SELECT FROM jsonb_object_keys(e) a(field) WHERE a.field NOT IN ('version','eventId','sessionId','pageViewId','occurredAt','name','surface','path','anchor','constraints','referrerHost','source','routeSlug','productSlug','position','exposureId','searchId','intent','query','outcome','resultCount','resultSetId','selection','originSurface','originPageViewId','originSearchId','originExposureId','originPosition','originRouteSlug')) THEN RAISE EXCEPTION 'Invalid event fields'; END IF;
  FOREACH k IN ARRAY ARRAY['eventId','sessionId','pageViewId'] LOOP
   IF jsonb_typeof(e->k) IS DISTINCT FROM 'string' OR e->>k !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Invalid ID'; END IF;
  END LOOP;
  IF jsonb_typeof(e->'occurredAt') IS DISTINCT FROM 'string' OR e->>'occurredAt' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$' THEN RAISE EXCEPTION 'Invalid time'; END IF;
  t=(e->>'occurredAt')::timestamptz;
  IF to_char(t AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')<>e->>'occurredAt' OR t<now_at-interval '24 hours' OR t>now_at+interval '5 minutes' THEN RAISE EXCEPTION 'Outside ingestion window'; END IF;
  IF jsonb_typeof(e->'name') IS DISTINCT FROM 'string' OR e->>'name' NOT IN ('page_viewed','search_performed','search_results_viewed','escape_route_viewed','product_impression','product_clicked','outbound_clicked','constraint_selected','anchor_selected') THEN RAISE EXCEPTION 'Invalid name'; END IF;
  IF jsonb_typeof(e->'surface') IS DISTINCT FROM 'string' OR e->>'surface' NOT IN ('home','search','escape','hidden_gems','product') OR jsonb_typeof(e->'path') IS DISTINCT FROM 'string' OR e->>'path' !~ '^(/|/discover|/hidden-gems|/escape/[a-z0-9-]+|/software/[a-z0-9-]+|/zh-hant/discover|/zh-hant/hidden-gems|/zh-hant/software/(2do|affine|anytype|appflowy|foxit-pdf-editor|gimp|grazie-free-browser|healthy-minds-program|hemingway-classic|hemingway-free-web|insight-timer|joplin|krita|languagetool-local-cli-6-6|medito|obsidian|omnifocus|paint-net|pdf-xchange-editor|pdf24-creator|pdfgear|prowritingaid|real-write-passive-checker|sejda|simplenote|smiling-mind|stirling-pdf|things|vale-local-passive-3-24-0|write-good-local-library-1-0-8)|/zh-hant|/zh-hant/escape/(offline-notion-alternatives|notion-alternatives-without-ai|simple-notion-alternatives|todoist-alternatives-with-a-one-time-purchase|privacy-friendly-grammarly-alternatives|grammarly-alternatives-without-a-subscription|photoshop-alternatives-without-a-subscription|pdf-editors-without-a-subscription|meditation-apps-without-a-subscription|productivity-apps-you-can-buy-once))$' THEN RAISE EXCEPTION 'Invalid page'; END IF;
  IF e->>'surface'='home' AND e->>'path' NOT IN ('/','/zh-hant') OR e->>'surface'='search' AND e->>'path' NOT IN ('/','/discover','/zh-hant','/zh-hant/discover') OR e->>'surface'='hidden_gems' AND e->>'path' NOT IN ('/hidden-gems','/zh-hant/hidden-gems') THEN RAISE EXCEPTION 'Page mismatch'; END IF;
  IF e ? 'productSlug' AND (jsonb_typeof(e->'productSlug') IS DISTINCT FROM 'string' OR NOT EXISTS(SELECT FROM software_discovery.products WHERE slug=e->>'productSlug' AND status='published')) THEN RAISE EXCEPTION 'Unpublished product'; END IF;
  IF e->>'surface'='product' AND (NOT e ? 'productSlug' OR (e->>'path' IS DISTINCT FROM '/software/'||(e->>'productSlug') AND e->>'path' IS DISTINCT FROM '/zh-hant/software/'||(e->>'productSlug'))) THEN RAISE EXCEPTION 'Product context missing'; END IF;
  IF e->>'surface'='escape' AND (NOT e ? 'routeSlug' OR (e->>'path' IS DISTINCT FROM '/escape/'||(e->>'routeSlug') AND e->>'path' IS DISTINCT FROM '/zh-hant/escape/'||(e->>'routeSlug')) OR NOT EXISTS(SELECT FROM software_discovery.escape_routes WHERE slug=e->>'routeSlug' AND status='published' AND editorially_approved)) THEN RAISE EXCEPTION 'Unpublished route'; END IF;
  IF e->>'name' IN ('product_impression','product_clicked') THEN
   IF e->>'surface' NOT IN ('search','escape','hidden_gems') OR NOT e ? 'productSlug' OR jsonb_typeof(e->'position') IS DISTINCT FROM 'number' OR (e->>'position')::numeric<>trunc((e->>'position')::numeric) OR (e->>'position')::numeric NOT BETWEEN 1 AND (CASE WHEN e->>'surface'='search' THEN 6 WHEN e->>'surface'='hidden_gems' THEN 3 ELSE 100 END) OR jsonb_typeof(e->'exposureId') IS DISTINCT FROM 'string' OR e->>'exposureId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Invalid placement'; END IF;
  END IF;
  IF e->>'name' IN ('search_performed','search_results_viewed') OR e->>'surface'='search' AND e->>'name' IN ('product_impression','product_clicked') THEN
   IF e->>'surface'<>'search' OR jsonb_typeof(e->'searchId') IS DISTINCT FROM 'string' OR e->>'searchId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Search ID required'; END IF;
  END IF;
  IF e->>'name'='outbound_clicked' AND e->>'surface'<>'product' OR e->>'name'='escape_route_viewed' AND e->>'surface'<>'escape' OR e->>'name' IN ('constraint_selected','anchor_selected') AND e->>'surface'<>'home' THEN RAISE EXCEPTION 'Wrong action surface'; END IF;
  IF e ? 'referrerHost' AND (jsonb_typeof(e->'referrerHost') IS DISTINCT FROM 'string' OR length(e->>'referrerHost')>253 OR e->>'referrerHost' !~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$') THEN RAISE EXCEPTION 'Hostname only'; END IF;
  IF e ? 'query' AND (e->>'name'<>'search_performed' OR jsonb_typeof(e->'query') IS DISTINCT FROM 'string' OR length(e->>'query') NOT BETWEEN 1 AND 500 OR e->>'query' ~ '[[:cntrl:]]' OR e->>'query' ~* 'https?://|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}') THEN RAISE EXCEPTION 'Invalid diagnostic query'; END IF;
 END LOOP;
 -- Share durable global/client budget with v1; never store raw IP addresses.
 FOREACH k IN ARRAY ARRAY['global','client:'||rate_key] LOOP
  INSERT INTO software_discovery.discovery_event_limits AS q(bucket,minute_start,event_count) VALUES(k,minute_at,n)
  ON CONFLICT(bucket,minute_start) DO UPDATE SET event_count=q.event_count+EXCLUDED.event_count
  WHERE q.event_count+EXCLUDED.event_count<=CASE WHEN k='global' THEN 1000 ELSE 120 END RETURNING event_count INTO used;
  IF NOT FOUND THEN RAISE EXCEPTION 'Analytics admission limit exceeded'; END IF;
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(batch) LOOP
  clean=e-'query';q=e->>'query';
  INSERT INTO software_discovery.discovery_events_v2(event_id,payload,received_at) VALUES((e->>'eventId')::uuid,clean,now_at) ON CONFLICT(event_id) DO NOTHING;
  IF FOUND THEN
   added=added+1;
   IF q IS NOT NULL THEN INSERT INTO software_discovery.discovery_queries_v2 VALUES((e->>'eventId')::uuid,q,now_at+interval '7 days'); END IF;
  ELSE
   SELECT payload INTO prior FROM software_discovery.discovery_events_v2 WHERE event_id=(e->>'eventId')::uuid;
   SELECT query_text INTO prior_q FROM software_discovery.discovery_queries_v2 WHERE event_id=(e->>'eventId')::uuid;
   IF prior IS DISTINCT FROM clean OR prior_q IS DISTINCT FROM q THEN RAISE EXCEPTION 'Conflicting event ID'; END IF;
  END IF;
 END LOOP;
 RETURN jsonb_build_object('inserted',added,'receivedAt',now_at);
END $ingest$;
COMMIT;
