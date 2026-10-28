SELECT jsonb_build_object(
 'ingestion_definition_expected', (SELECT md5(replace(prosrc,E'\r',''))='4767e2978249d0b262257ee6c62b080c' FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events_v2(jsonb,text)'::regprocedure),
 'anonymous_execute_blocked', NOT has_function_privilege('anon','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE'),
 'authenticated_execute_blocked', NOT has_function_privilege('authenticated','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE'),
 'service_execute_allowed', has_function_privilege('service_role','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE'),
 'private_tables', (SELECT bool_and(relrowsecurity AND relforcerowsecurity) FROM pg_class WHERE oid IN ('software_discovery.discovery_events_v2'::regclass,'software_discovery.discovery_queries_v2'::regclass))
) AS locale_04_verification;
