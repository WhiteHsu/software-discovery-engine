-- Existing extension only. Run ENTIRE file. No extension install/drop or grants.
BEGIN;
SELECT pg_advisory_xact_lock(5112001);
DO $guard$
DECLARE p record;
BEGIN
 IF current_user <> 'postgres' OR current_database() <> 'postgres' THEN RAISE EXCEPTION 'Owner/database drift'; END IF;
 IF (SELECT count(*) FROM software_discovery.products WHERE status='published') <> 24
 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved) <> 10
 THEN RAISE EXCEPTION 'Publication baseline drift'; END IF;
 SELECT pg_get_userbyid(proowner) owner,prosecdef,proconfig,md5(pg_get_functiondef(oid)) signature INTO STRICT p
 FROM pg_proc WHERE oid='software_discovery.purge_discovery_events()'::regprocedure;
 IF p.owner <> 'postgres' OR NOT p.prosecdef OR p.proconfig IS DISTINCT FROM ARRAY['search_path=pg_catalog']::text[]
 OR p.signature <> '853671b9a4d6484b164b337685297f2e' THEN RAISE EXCEPTION 'Purge function drift'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.discovery_events)
 OR EXISTS(SELECT 1 FROM software_discovery.discovery_event_limits) THEN RAISE EXCEPTION 'Expected empty, disabled analytics'; END IF;
 IF EXISTS(SELECT 1 FROM pg_class WHERE oid IN ('software_discovery.discovery_events'::regclass,'software_discovery.discovery_event_limits'::regclass) AND (NOT relrowsecurity OR NOT relforcerowsecurity))
 OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid IN ('software_discovery.discovery_events'::regclass,'software_discovery.discovery_event_limits'::regclass))
 OR EXISTS(SELECT 1 FROM (VALUES('anon'),('authenticated'),('service_role')) r(role_name)
 CROSS JOIN (VALUES('software_discovery.discovery_events'),('software_discovery.discovery_event_limits')) t(table_name)
 WHERE has_table_privilege(r.role_name,t.table_name,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'))
 THEN RAISE EXCEPTION 'Private storage boundary drift'; END IF;
 IF has_function_privilege('anon','software_discovery.purge_discovery_events()','EXECUTE')
 OR has_function_privilege('authenticated','software_discovery.purge_discovery_events()','EXECUTE')
 OR NOT has_function_privilege('service_role','software_discovery.purge_discovery_events()','EXECUTE')
 OR NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE')
 OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'RPC/evidence boundary drift'; END IF;
END $guard$;


-- BEGIN REAL EXTENSION CHECK: isolated tests substitute catalog availability only.
DO $installed$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace
 WHERE e.extname='pg_cron' AND e.extversion='1.6.4' AND n.nspname='pg_catalog')
 THEN RAISE EXCEPTION 'Expected installed pg_cron1.6.4 in pg_catalog; no extension changes permitted'; END IF;
 IF to_regprocedure('cron.schedule(text,text,text)') IS NULL OR to_regprocedure('cron.unschedule(bigint)') IS NULL
 OR to_regclass('cron.job') IS NULL OR to_regclass('cron.job_run_details') IS NULL
 THEN RAISE EXCEPTION 'Cron capabilities missing'; END IF;
 IF NOT has_function_privilege(current_user,'cron.schedule(text,text,text)','EXECUTE')
 OR NOT has_table_privilege(current_user,'cron.job','SELECT')
 OR NOT has_table_privilege(current_user,'cron.job_run_details','SELECT')
 THEN RAISE EXCEPTION 'Owner cron privileges missing'; END IF;
END $installed$;
-- END REAL EXTENSION CHECK
DO $clock$
BEGIN
 IF current_setting('cron.database_name',true) IS DISTINCT FROM 'postgres'
 OR coalesce(nullif(current_setting('cron.timezone',true),''),'GMT') NOT IN ('GMT','UTC','Etc/UTC')
 THEN RAISE EXCEPTION 'Cron database/timezone drift'; END IF;
 IF coalesce(nullif(current_setting('cron.log_run',true),''),'on') NOT IN ('on','true')
 THEN RAISE EXCEPTION 'Cron run logging must be enabled'; END IF;
END $clock$;

DO $schedule$
DECLARE matching bigint; scoped bigint;
BEGIN
 SELECT count(*) INTO scoped FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1';
 SELECT count(*) INTO matching FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1'
 AND schedule='17 3 * * *' AND command='SELECT software_discovery.purge_discovery_events();'
 AND database='postgres' AND username='postgres' AND active
 AND nodename IN ('localhost','127.0.0.1','::1','') AND nodeport=current_setting('port')::integer;
 IF scoped > 0 THEN
  IF scoped <> 1 OR matching <> 1 THEN RAISE EXCEPTION 'Existing scoped job differs; no overwrite permitted'; END IF;
  RAISE NOTICE 'Exact scoped job already exists; preserved without rescheduling';
 ELSE
  PERFORM cron.schedule('software_discovery_analytics_purge_v1','17 3 * * *','SELECT software_discovery.purge_discovery_events();');
 END IF;
 IF (SELECT count(*) FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1') <> 1
 OR (SELECT count(*) FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1'
 AND schedule='17 3 * * *' AND command='SELECT software_discovery.purge_discovery_events();'
 AND database='postgres' AND username='postgres' AND active
 AND nodename IN ('localhost','127.0.0.1','::1','') AND nodeport=current_setting('port')::integer) <> 1
 THEN RAISE EXCEPTION 'Unexpected job configuration'; END IF;
END $schedule$;
SELECT 'daily_purge_exact_in_transaction' AS check_name, count(*)=1 AS passed
FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1' AND active;
ROLLBACK;
