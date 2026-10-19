-- Owner only. Installs extension/job inside a transaction, then rolls everything back.
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

-- BEGIN REAL PG_CRON INSTALL: not supported by the isolated test engine.
DO $extension_guard$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_extension WHERE extname='pg_cron') OR to_regnamespace('cron') IS NOT NULL
 THEN RAISE EXCEPTION 'Cron state changed; capture a fresh preflight instead of replaying'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_available_extensions WHERE name='pg_cron' AND default_version='1.6.4' AND installed_version IS NULL)
 THEN RAISE EXCEPTION 'Available pg_cron version drift'; END IF;
 IF current_setting('cron.database_name',true) IS DISTINCT FROM 'postgres'
 OR coalesce(nullif(current_setting('cron.timezone',true),''),'GMT') NOT IN ('GMT','UTC','Etc/UTC')
 THEN RAISE EXCEPTION 'Cron database/timezone drift; no global settings will be changed'; END IF;
 IF coalesce(nullif(current_setting('cron.log_run',true),''),'on') NOT IN ('on','true') THEN RAISE EXCEPTION 'Cron run logging must be enabled for verification'; END IF;
END $extension_guard$;
CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog VERSION '1.6.4';
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
-- END REAL PG_CRON INSTALL

DO $schedule$
DECLARE job_id bigint;
BEGIN
 IF EXISTS(SELECT 1 FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1') THEN RAISE EXCEPTION 'Job name collision'; END IF;
 job_id := cron.schedule('software_discovery_analytics_purge_v1','17 3 * * *','SELECT software_discovery.purge_discovery_events();');
 IF (SELECT count(*) FROM cron.job WHERE jobid=job_id AND jobname='software_discovery_analytics_purge_v1'
 AND schedule='17 3 * * *' AND command='SELECT software_discovery.purge_discovery_events();'
 AND database='postgres' AND username='postgres' AND active) <> 1 THEN RAISE EXCEPTION 'Unexpected scheduled job'; END IF;
END $schedule$;
SELECT 'daily_purge_configured_in_transaction' AS check_name, count(*)=1 AS passed
FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1' AND active;
ROLLBACK;
