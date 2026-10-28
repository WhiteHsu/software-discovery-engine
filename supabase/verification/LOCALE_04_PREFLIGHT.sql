-- Read-only; expected ingestion body fingerprint: ee89334bdb1a15291a9540de1f5abab9
SELECT pg_get_userbyid(proowner) AS owner,prosecdef,proconfig,md5(replace(prosrc,E'\r','')) AS ingestion_fingerprint FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events_v2(jsonb,text)'::regprocedure;
