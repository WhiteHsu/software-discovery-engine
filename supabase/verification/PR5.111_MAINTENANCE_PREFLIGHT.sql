-- SELECT only: scheduler capabilities and private maintenance boundary.
-- Does not install extensions, schedule jobs, execute purge or return event data.
SELECT jsonb_build_object(
 'packet','PR5.111','read_only',true,'captured_at',now(),
 'database',current_database(),'executor',current_user,
 'cron_database',current_setting('cron.database_name',true),
 'pg_cron',coalesce((SELECT jsonb_build_object('version',e.extversion,'schema',n.nspname) FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace WHERE e.extname='pg_cron'),'null'::jsonb),
 'available_pg_cron',coalesce((SELECT jsonb_build_object('default_version',default_version,'installed_version',installed_version) FROM pg_available_extensions WHERE name='pg_cron'),'null'::jsonb),
 'cron_functions',coalesce((SELECT jsonb_agg(jsonb_build_object('name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),'can_execute',has_function_privilege(current_user,p.oid,'EXECUTE')) ORDER BY p.proname,p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='cron' AND p.proname IN ('schedule','schedule_in_database','unschedule')),'[]'::jsonb),
 'cron_relations',coalesce((SELECT jsonb_agg(jsonb_build_object('name',c.relname,'can_read',has_table_privilege(current_user,c.oid,'SELECT')) ORDER BY c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='cron' AND c.relname IN ('job','job_run_details') AND c.relkind IN ('r','p','v')),'[]'::jsonb),
 'purge_function',coalesce((SELECT jsonb_build_object('owner',pg_get_userbyid(p.proowner),'security_definer',p.prosecdef,'settings',p.proconfig,'definition_md5',md5(pg_get_functiondef(p.oid)),'can_execute',has_function_privilege(current_user,p.oid,'EXECUTE')) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='software_discovery' AND p.proname='purge_discovery_events' AND p.pronargs=0),'null'::jsonb),
 'private_analytics_tables',NOT has_table_privilege('anon','software_discovery.discovery_events','SELECT') AND NOT has_table_privilege('authenticated','software_discovery.discovery_events','SELECT'),
 'event_counts',(SELECT jsonb_build_object('total',count(*),'older_than_90_days',count(*) FILTER(WHERE received_at<now()-interval '90 days')) FROM software_discovery.discovery_events),
 'published_product_count',(SELECT count(*) FROM software_discovery.products WHERE status='published'),
 'approved_route_count',(SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)
) AS snapshot;
