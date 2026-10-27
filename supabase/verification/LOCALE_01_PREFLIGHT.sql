-- Read-only baseline; expected body fingerprint: b4bb82f11e019fe26a827646ced98e43
SELECT pg_get_userbyid(proowner) AS owner,prosecdef,proconfig,md5(replace(prosrc,E'\r','')) AS ingestion_fingerprint FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events_v2(jsonb,text)'::regprocedure;
