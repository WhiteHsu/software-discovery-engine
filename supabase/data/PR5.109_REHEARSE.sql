-- PR5.109: private analytics storage only. No browser producer is enabled.
BEGIN;
SET LOCAL lock_timeout='10s';
SELECT pg_advisory_xact_lock(7232109);
DO $guard$
BEGIN
 IF current_user<>'postgres' THEN RAISE EXCEPTION 'Run as schema owner postgres'; END IF;
 IF to_regclass('software_discovery.discovery_events') IS NOT NULL OR to_regclass('software_discovery.discovery_event_limits') IS NOT NULL OR EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='software_discovery' AND p.proname IN ('ingest_discovery_events','purge_discovery_events')) THEN RAISE EXCEPTION 'Analytics object collision or repeated apply; inspect fresh metadata'; END IF;
 IF (SELECT count(*) FROM software_discovery.products WHERE status='published')<>24 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)<>10 THEN RAISE EXCEPTION 'Public baseline drift'; END IF;
 IF NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'Private evidence boundary drift'; END IF;
 IF has_schema_privilege('service_role','software_discovery','USAGE') OR has_schema_privilege('anon','software_discovery','CREATE') OR has_schema_privilege('authenticated','software_discovery','CREATE') THEN RAISE EXCEPTION 'Captured schema privilege baseline drift'; END IF;
END $guard$;

CREATE TABLE software_discovery.discovery_events(
 event_id uuid PRIMARY KEY,
 payload jsonb NOT NULL CHECK(jsonb_typeof(payload)='object'),
 received_at timestamptz NOT NULL DEFAULT statement_timestamp()
);
CREATE INDEX discovery_events_received_at_idx ON software_discovery.discovery_events(received_at);
CREATE TABLE software_discovery.discovery_event_limits(
 bucket text NOT NULL,
 minute_start timestamptz NOT NULL,
 event_count integer NOT NULL CHECK(event_count BETWEEN 1 AND 1000),
 PRIMARY KEY(bucket,minute_start)
);
ALTER TABLE software_discovery.discovery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_discovery.discovery_events FORCE ROW LEVEL SECURITY;
ALTER TABLE software_discovery.discovery_event_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_discovery.discovery_event_limits FORCE ROW LEVEL SECURITY;
REVOKE ALL ON software_discovery.discovery_events,software_discovery.discovery_event_limits FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA software_discovery TO service_role;

CREATE FUNCTION software_discovery.ingest_discovery_events(batch jsonb,rate_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $ingest$
DECLARE e jsonb; prior jsonb; k text; event_time timestamptz; now_at timestamptz=statement_timestamp();
 minute_at timestamptz=date_trunc('minute',statement_timestamp()); n integer; used integer; inserted integer=0;
BEGIN
 IF rate_key IS NULL OR rate_key !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid server rate key'; END IF;
 IF batch IS NULL OR jsonb_typeof(batch)<>'array' THEN RAISE EXCEPTION 'Event array required'; END IF;
 n=jsonb_array_length(batch);
 IF n<1 OR n>20 OR octet_length(batch::text)>16384 THEN RAISE EXCEPTION 'Batch limit exceeded'; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(batch) LOOP
  IF jsonb_typeof(e)<>'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(e) a(key) WHERE key NOT IN ('version','eventId','sessionId','pageViewId','occurredAt','name','surface','path','productSlug','routeSlug','exposureId','position','referrerHost')) THEN RAISE EXCEPTION 'Invalid event fields'; END IF;
  IF e->'version' IS DISTINCT FROM '1'::jsonb THEN RAISE EXCEPTION 'Invalid event version'; END IF;
  FOREACH k IN ARRAY ARRAY['eventId','sessionId','pageViewId'] LOOP
   IF jsonb_typeof(e->k) IS DISTINCT FROM 'string' OR e->>k !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Invalid event UUID'; END IF;
  END LOOP;
  IF jsonb_typeof(e->'occurredAt') IS DISTINCT FROM 'string' OR e->>'occurredAt' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$' THEN RAISE EXCEPTION 'Invalid event timestamp'; END IF;
  event_time=(e->>'occurredAt')::timestamptz;
  IF to_char(event_time AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')<>e->>'occurredAt' OR event_time<now_at-interval '24 hours' OR event_time>now_at+interval '5 minutes' THEN RAISE EXCEPTION 'Event outside ingestion window'; END IF;
  IF jsonb_typeof(e->'productSlug') IS DISTINCT FROM 'string' OR length(e->>'productSlug')>100 OR e->>'productSlug' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR NOT EXISTS(SELECT 1 FROM software_discovery.products p WHERE p.slug=e->>'productSlug' AND p.status='published') THEN RAISE EXCEPTION 'Product not public'; END IF;
  IF e ? 'referrerHost' AND (jsonb_typeof(e->'referrerHost') IS DISTINCT FROM 'string' OR length(e->>'referrerHost')>253 OR e->>'referrerHost' !~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$') THEN RAISE EXCEPTION 'Invalid referrer hostname'; END IF;
  IF e->>'name' IN ('product_impression','product_click') THEN
   IF e->>'surface' IS DISTINCT FROM 'escape' OR jsonb_typeof(e->'routeSlug') IS DISTINCT FROM 'string' OR e->>'path' IS DISTINCT FROM '/escape/'||(e->>'routeSlug') OR jsonb_typeof(e->'position') IS DISTINCT FROM 'number' OR (e->>'position')::numeric<>trunc((e->>'position')::numeric) OR (e->>'position')::numeric NOT BETWEEN 1 AND 100 OR jsonb_typeof(e->'exposureId') IS DISTINCT FROM 'string' OR e->>'exposureId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Invalid route context'; END IF;
   IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id JOIN software_discovery.products p ON p.id=m.product_id WHERE r.slug=e->>'routeSlug' AND r.status='published' AND r.editorially_approved AND p.slug=e->>'productSlug' AND p.status='published') THEN RAISE EXCEPTION 'Route membership not public'; END IF;
  ELSIF e->>'name' IN ('product_view','outbound_click') THEN
   IF e->>'surface' IS DISTINCT FROM 'product' OR e->>'path' IS DISTINCT FROM '/software/'||(e->>'productSlug') OR e ?| ARRAY['routeSlug','position','exposureId'] THEN RAISE EXCEPTION 'Invalid product context'; END IF;
  ELSE RAISE EXCEPTION 'Unsupported event name'; END IF;
 END LOOP;
 -- Fixed-minute durable admission limits. Keys are server HMACs, never raw IPs.
 -- Global cap bounds aggregate admission; repeated retries also consume budget.
 FOREACH k IN ARRAY ARRAY['global','client:'||rate_key] LOOP
  INSERT INTO software_discovery.discovery_event_limits AS q(bucket,minute_start,event_count) VALUES(k,minute_at,n)
  ON CONFLICT(bucket,minute_start) DO UPDATE SET event_count=q.event_count+EXCLUDED.event_count
  WHERE q.event_count+EXCLUDED.event_count<=CASE WHEN k='global' THEN 1000 ELSE 120 END
  RETURNING event_count INTO used;
  IF NOT FOUND THEN RAISE EXCEPTION 'Analytics admission limit exceeded'; END IF;
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(batch) LOOP
  INSERT INTO software_discovery.discovery_events(event_id,payload,received_at) VALUES((e->>'eventId')::uuid,e,now_at) ON CONFLICT(event_id) DO NOTHING;
  IF FOUND THEN inserted=inserted+1;
  ELSE SELECT payload INTO prior FROM software_discovery.discovery_events WHERE event_id=(e->>'eventId')::uuid;
   IF prior IS DISTINCT FROM e THEN RAISE EXCEPTION 'Conflicting event ID'; END IF;
  END IF;
 END LOOP;
 RETURN jsonb_build_object('inserted',inserted,'receivedAt',now_at);
END $ingest$;
REVOKE ALL ON FUNCTION software_discovery.ingest_discovery_events(jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION software_discovery.ingest_discovery_events(jsonb,text) TO service_role;

CREATE FUNCTION software_discovery.purge_discovery_events()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $purge$
DECLARE events_deleted integer; limits_deleted integer;
BEGIN
 DELETE FROM software_discovery.discovery_events WHERE received_at<statement_timestamp()-interval '90 days';
 GET DIAGNOSTICS events_deleted=ROW_COUNT;
 DELETE FROM software_discovery.discovery_event_limits WHERE minute_start<statement_timestamp()-interval '24 hours';
 GET DIAGNOSTICS limits_deleted=ROW_COUNT;
 RETURN jsonb_build_object('eventsDeleted',events_deleted,'limitsDeleted',limits_deleted);
END $purge$;
REVOKE ALL ON FUNCTION software_discovery.purge_discovery_events() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION software_discovery.purge_discovery_events() TO service_role;
ROLLBACK;
