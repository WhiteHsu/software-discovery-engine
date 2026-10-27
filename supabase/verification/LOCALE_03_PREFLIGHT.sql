-- Read-only; expected ingestion body fingerprint: 80a3434e327b18648f0f6b19c06fc238
SELECT pg_get_userbyid(proowner) AS owner,prosecdef,proconfig,md5(replace(prosrc,E'\r','')) AS ingestion_fingerprint FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events_v2(jsonb,text)'::regprocedure;
