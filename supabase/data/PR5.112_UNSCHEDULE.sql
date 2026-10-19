-- Optional owner rollback: removes ONLY this exact job. Keeps shared extension and all tables/data.
BEGIN;
SELECT pg_advisory_xact_lock(5112001);
DO $remove$
DECLARE j record;
BEGIN
 IF current_user <> 'postgres' OR current_database() <> 'postgres' THEN RAISE EXCEPTION 'Owner/database drift'; END IF;
 IF (SELECT count(*) FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1') <> 1 THEN RAISE EXCEPTION 'Expected exactly one scoped job'; END IF;
 SELECT * INTO STRICT j FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1';
 IF j.schedule <> '17 3 * * *' OR j.command <> 'SELECT software_discovery.purge_discovery_events();' OR j.database <> 'postgres' OR j.username <> 'postgres' THEN RAISE EXCEPTION 'Job configuration drift'; END IF;
 IF NOT cron.unschedule(j.jobid) THEN RAISE EXCEPTION 'Unschedule failed'; END IF;
END $remove$;
COMMIT;
