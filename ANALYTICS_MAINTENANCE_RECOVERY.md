
# PR5.112A — Resume with the installed scheduler

Owner reports25 Node tests, typecheck and build pass; pinned-input review passed. Optional PGlite command failed locally because the separate test dependency is not installed. Supabase rehearsal reported true. The subsequent first-install-only migration stopped at the existing-extension/schema guard, before its extension install or scheduling statements. After explicit ROLLBACK, the new owner snapshot at2026-10-19T03:19:59.392314Z confirms pg_cron1.6.4 in pg_catalog, postgres database/executor, required scheduling/read capabilities, unchanged purge definition, private boundary and public24/10, events0.

The snapshot does not show jobs or explain when/how the extension became persistent. We do not attribute that to rollback or assume a job is absent. The original installation proposal assumed extension absence; that path is superseded for this observed state. Keep its files as history; do not run 202610190002_discovery_daily_purge.sql or PR5.112_REHEARSE.sql again on this database. No storage migration replay.

## Recovery behavior

PR5.112A uses the installed extension without CREATE/DROP EXTENSION, schema changes, grants, global setting changes or changes to other jobs. It retains the original postgres/database/public counts/private storage/empty data/purge security+definition guards. It validates pg_cron version/schema/capabilities, UTC/GMT clock, configured cron database and run logging before job handling.

The named job is software_discovery_analytics_purge_v1, scheduled17 03 daily UTC (11:17 Asia/Taipei), command SELECT software_discovery.purge_discovery_events();, postgres database/user and a local connection endpoint. If absent, create it. If exactly one matches all checked settings and is active, preserve its jobid, run history and next schedule without updates. Any differing/disabled/duplicate name or unexpected endpoint aborts the transaction, with no overwrite. An exact existing job is not proof it has successfully run.

The fixed purge removes only software_discovery event rows older than90 days and quota rows older than24 hours. Daily scheduling can leave expired rows until the next successful run; failed runs extend that delay. No other application/event/job history is deleted. Existing PR5.112_UNSCHEDULE.sql is optional removal of the exact scoped job; never drop the shared extension to undo this work.

## Owner sequence

Keep ANALYTICS_ENABLED, ANALYTICS_MAINTENANCE_READY and ANALYTICS_PURGE_ENABLED false. No secrets are needed. Copy the files first and run node scripts/review-analytics-maintenance-recovery.mjs.

1. Run the ENTIRE supabase/data/PR5.112A_REHEARSE.sql in a new postgres SQL Editor query. Expected daily_purge_exact_in_transaction=true. It ends ROLLBACK. It does not install an extension. If the job was absent, the temporary job creation is rolled back; if already exact, it is left untouched. Stop on any error, return it and issue ROLLBACK if needed.
2. Only after successful rehearsal, run the ENTIRE supabase/data/PR5.112A_RESUME.sql. This ends COMMIT and creates the scoped job if absent, or retains an exact existing job. Never substitute COMMIT into an old installation script.
3. Run supabase/verification/PR5.112A_VERIFY.sql (8 true), then existing PR5.109_VERIFY.sql (10 true). Return every result.
4. Run existing supabase/verification/PR5.112_RUN_STATUS.sql. If a prior job exists it may already have run. If newly created after11:17 Taipei, the next normal run is tomorrow11:17. Empty result means missing job. Null status/false latest_run_succeeded means no completed-success evidence yet. A succeeded status with non-null end timestamp supports actual scheduled execution; check expired event/quota counts0. Do not change the shared timezone or accelerate other jobs to obtain evidence. Keep collection off pending actual maintenance success and later enabled end-to-end QA; no experiment start.

## Local verification boundary

Seven local mock scenario groups passed. The optional PostgreSQL-compatible tests substitute only unavailable extension catalog checks with a mock scheduler. They exercise rollback, exact-existing preservation, repeated resume, refusal of altered/disabled/remote jobs, timezone/logging guard failures, and preservation of another application's synthetic job. They do not install real pg_cron or prove background-worker connectivity. No production database commands or secrets accessed by this packet. Application source/dependencies unchanged; no new frontend build required for this SQL recovery.
