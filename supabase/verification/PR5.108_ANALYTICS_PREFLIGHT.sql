-- PR5.108: one SELECT only. Run in privileged SQL Editor; export snapshot JSON.
-- Metadata/collision inspection only. No event records or credentials are read.
WITH relations AS (
 SELECT c.oid,c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='software_discovery'
 AND (c.relname IN ('discovery_events','discovery_event_limits') OR c.relname ~ '(analytics|event|ingest)')
), functions AS (
 SELECT p.oid,p.proname,p.prosecdef,
 pg_get_function_identity_arguments(p.oid) identity_arguments,
 pg_get_function_result(p.oid) result_type,
 md5(pg_get_functiondef(p.oid)) definition_md5
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='software_discovery' AND p.prokind='f'
 AND (p.proname IN ('ingest_discovery_events','purge_discovery_events') OR p.proname ~ '(analytics|event|ingest)')
)
SELECT jsonb_build_object(
 'packet','PR5.108','read_only',true,'captured_at',now(),
 'schema',coalesce((SELECT jsonb_build_object('name',nspname,'owner',pg_get_userbyid(nspowner)) FROM pg_namespace WHERE nspname='software_discovery'),'null'::jsonb),
 'roles',coalesce((SELECT jsonb_agg(jsonb_build_object('name',r.rolname,'bypass_rls',r.rolbypassrls,'schema_usage',has_schema_privilege(r.oid,'software_discovery','USAGE'),'schema_create',has_schema_privilege(r.oid,'software_discovery','CREATE')) ORDER BY r.rolname) FROM pg_roles r WHERE r.rolname IN ('anon','authenticated','service_role')),'[]'::jsonb),
 'relations',coalesce((SELECT jsonb_agg(jsonb_build_object('name',relname,'kind',relkind,'rls_enabled',relrowsecurity,'force_rls',relforcerowsecurity) ORDER BY relname) FROM relations),'[]'::jsonb),
 'columns',coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY table_name,ordinal_position) FROM information_schema.columns c WHERE table_schema='software_discovery' AND table_name IN (SELECT relname FROM relations)),'[]'::jsonb),
 'policies',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY tablename,policyname) FROM pg_policies p WHERE schemaname='software_discovery' AND tablename IN (SELECT relname FROM relations)),'[]'::jsonb),
 'table_privileges',coalesce((SELECT jsonb_agg(jsonb_build_object('table',t.relname,'role',r.rolname,'select',has_table_privilege(r.oid,t.oid,'SELECT'),'insert',has_table_privilege(r.oid,t.oid,'INSERT'),'update',has_table_privilege(r.oid,t.oid,'UPDATE'),'delete',has_table_privilege(r.oid,t.oid,'DELETE')) ORDER BY t.relname,r.rolname) FROM relations t CROSS JOIN pg_roles r WHERE r.rolname IN ('anon','authenticated','service_role') AND t.relkind IN ('r','p','v','m','f')),'[]'::jsonb),
 'functions',coalesce((SELECT jsonb_agg(to_jsonb(f)-'oid' ORDER BY proname,identity_arguments) FROM functions f),'[]'::jsonb),
 'function_privileges',coalesce((SELECT jsonb_agg(jsonb_build_object('name',f.proname,'arguments',f.identity_arguments,'role',r.rolname,'execute',has_function_privilege(r.oid,f.oid,'EXECUTE')) ORDER BY f.proname,f.identity_arguments,r.rolname) FROM functions f CROSS JOIN pg_roles r WHERE r.rolname IN ('anon','authenticated','service_role')),'[]'::jsonb),
 'default_acl',coalesce((SELECT jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(d.defaclrole),'schema',coalesce(n.nspname,'GLOBAL'),'object_type',d.defaclobjtype,'acl',d.defaclacl::text) ORDER BY d.defaclrole,d.defaclnamespace,d.defaclobjtype) FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace WHERE d.defaclnamespace=0 OR n.nspname='software_discovery'),'[]'::jsonb),
 'published_product_count',(SELECT count(*) FROM software_discovery.products WHERE status='published'),
 'approved_route_count',(SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),
 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
) AS snapshot;
