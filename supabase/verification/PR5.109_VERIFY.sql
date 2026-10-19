-- SELECT only. All ten results must be true after storage migration.
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
SELECT 'empty_before_producer_activation',(SELECT count(*)=0 FROM software_discovery.discovery_events) AND (SELECT count(*)=0 FROM software_discovery.discovery_event_limits)
UNION ALL
SELECT 'published_counts_preserved',(SELECT count(*)=24 FROM software_discovery.products WHERE status='published') AND (SELECT count(*)=10 FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)
UNION ALL
SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT');
