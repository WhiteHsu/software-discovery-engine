-- PR5.117: read-only verification; existing events may be nonempty.
SELECT 'private_tables_and_rls' check_name,(SELECT count(*)=2 AND bool_and(c.relrowsecurity AND c.relforcerowsecurity) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='software_discovery' AND c.relname IN ('discovery_events','discovery_event_limits') AND c.relkind='r') passed
UNION ALL
SELECT 'no_direct_client_or_service_table_access',NOT EXISTS(SELECT 1 FROM pg_roles r CROSS JOIN (VALUES ('software_discovery.discovery_events'),('software_discovery.discovery_event_limits')) t(name) WHERE r.rolname IN ('anon','authenticated','service_role') AND (has_table_privilege(r.oid,t.name,'SELECT') OR has_table_privilege(r.oid,t.name,'INSERT') OR has_table_privilege(r.oid,t.name,'UPDATE') OR has_table_privilege(r.oid,t.name,'DELETE')))
UNION ALL
SELECT 'no_public_event_policies',NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='software_discovery' AND tablename IN ('discovery_events','discovery_event_limits'))
UNION ALL
SELECT 'service_only_rpc_execute',has_function_privilege('service_role','software_discovery.ingest_discovery_events(jsonb,text)','EXECUTE') AND has_function_privilege('service_role','software_discovery.purge_discovery_events()','EXECUTE') AND NOT EXISTS(SELECT 1 FROM pg_roles r CROSS JOIN (VALUES ('software_discovery.ingest_discovery_events(jsonb,text)'),('software_discovery.purge_discovery_events()')) f(signature) WHERE r.rolname IN ('anon','authenticated') AND has_function_privilege(r.oid,f.signature,'EXECUTE'))
UNION ALL
SELECT 'no_public_rpc_grants',NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE n.nspname='software_discovery' AND p.proname IN ('ingest_discovery_events','purge_discovery_events') AND a.grantee=0 AND a.privilege_type='EXECUTE')
UNION ALL
SELECT 'fixed_definer_boundary',(SELECT count(*)=2 AND bool_and(p.prosecdef AND p.proconfig @> ARRAY['search_path=pg_catalog'] AND pg_get_userbyid(p.proowner)='postgres') FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='software_discovery' AND p.proname IN ('ingest_discovery_events','purge_discovery_events'))
UNION ALL
SELECT 'schema_usage_without_create',has_schema_privilege('service_role','software_discovery','USAGE') AND NOT EXISTS(SELECT 1 FROM pg_roles r WHERE r.rolname IN ('anon','authenticated','service_role') AND has_schema_privilege(r.oid,'software_discovery','CREATE'))
UNION ALL
SELECT 'published_counts_preserved',(SELECT count(*)=24 FROM software_discovery.products WHERE status='published') AND (SELECT count(*)=10 FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)
UNION ALL
SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
UNION ALL
SELECT 'exact_editorial_ingest_body', (SELECT prosrc=$expected$
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
   IF e->>'surface'='hidden_gems' THEN
    IF e->>'path' IS DISTINCT FROM '/hidden-gems' OR e ? 'routeSlug' OR jsonb_typeof(e->'position') IS DISTINCT FROM 'number' OR (e->>'position')::numeric<>trunc((e->>'position')::numeric) OR (e->>'position')::numeric NOT BETWEEN 1 AND 3 OR jsonb_typeof(e->'exposureId') IS DISTINCT FROM 'string' OR e->>'exposureId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Invalid editorial context'; END IF;
    -- Defense in depth: registered editorial identity and public source membership.
    -- The server additionally revalidates evidence eligibility and actual displayed position.
    IF NOT EXISTS(SELECT 1 FROM (VALUES ('joplin','simple-notion-alternatives'),('krita','photoshop-alternatives-without-a-subscription'),('pdf24-creator','pdf-editors-without-a-subscription')) pick(product_slug,route_slug)
     JOIN software_discovery.products p ON p.slug=pick.product_slug AND p.status='published'
     JOIN software_discovery.escape_route_products m ON m.product_id=p.id
     JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id AND r.slug=pick.route_slug AND r.status='published' AND r.editorially_approved
     WHERE pick.product_slug=e->>'productSlug') THEN RAISE EXCEPTION 'Editorial membership not public'; END IF;
   ELSE
   IF e->>'surface' IS DISTINCT FROM 'escape' OR jsonb_typeof(e->'routeSlug') IS DISTINCT FROM 'string' OR e->>'path' IS DISTINCT FROM '/escape/'||(e->>'routeSlug') OR jsonb_typeof(e->'position') IS DISTINCT FROM 'number' OR (e->>'position')::numeric<>trunc((e->>'position')::numeric) OR (e->>'position')::numeric NOT BETWEEN 1 AND 100 OR jsonb_typeof(e->'exposureId') IS DISTINCT FROM 'string' OR e->>'exposureId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN RAISE EXCEPTION 'Invalid route context'; END IF;
   IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id JOIN software_discovery.products p ON p.id=m.product_id WHERE r.slug=e->>'routeSlug' AND r.status='published' AND r.editorially_approved AND p.slug=e->>'productSlug' AND p.status='published') THEN RAISE EXCEPTION 'Route membership not public'; END IF;
  END IF;
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
END $expected$ FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events(jsonb,text)'::regprocedure)
UNION ALL
SELECT 'retention_function_unchanged',md5(pg_get_functiondef('software_discovery.purge_discovery_events()'::regprocedure))='853671b9a4d6484b164b337685297f2e';
