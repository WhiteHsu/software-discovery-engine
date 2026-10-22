-- Read-only. Share results, never secrets or diagnostic query text.
SELECT current_user,current_database();
SELECT (SELECT count(*) FROM software_discovery.products WHERE status='published') published_products,
 (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved) approved_routes;
SELECT pg_get_userbyid(proowner) owner,prosecdef,proconfig,md5(replace(prosrc,E'\r','')) body_fingerprint
 FROM pg_proc WHERE oid='software_discovery.purge_discovery_events()'::regprocedure;
SELECT to_regclass('software_discovery.discovery_events_v2') events_v2,
 to_regclass('software_discovery.discovery_queries_v2') queries_v2,
 to_regprocedure('software_discovery.ingest_discovery_events_v2(jsonb,text)') ingest_v2;
SELECT has_schema_privilege('service_role','software_discovery','USAGE') service_schema_usage;
SELECT jobname,schedule,command,active FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1';
