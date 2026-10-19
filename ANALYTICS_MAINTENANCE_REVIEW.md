# PR5.112 — Daily database purge proposal, collection still OFF

Owner pushed 4d41fe0 / Production129, reports25 tests, typecheck/build passed. Frozen privileged PR5.111 snapshot (2026-10-19T02:57:57.704031Z) reports pg_cron absent, available1.6.4, database/executor postgres, empty events, unchanged purge definition, private storage and public24/10. This is owner-supplied evidence, not a new remote inspection.

## Explicit shared-project change

The proposal installs pg_cron1.6.4 in pg_catalog and creates its shared cron metadata/schema, following Supabase SQL installation documentation. Grants target postgres only. This is a shared extension installation, not merely a change within software_discovery. It does not change global settings, existing application schemas, analytics storage or routine definitions. Installation refuses an existing extension or cron schema: any concurrent installation requires a new preflight/review. Never drop the extension as rollback: that would delete all jobs belonging to other applications too.

One named job software_discovery_analytics_purge_v1 runs SELECT software_discovery.purge_discovery_events(); at17 03 daily UTC/GMT, equivalent to11:17 Asia/Taipei. The proposal refuses a different cron database/timezone. The job connects as postgres, matching the privileged owner baseline; its command is fixed and schema-qualified, with no HTTP requests, tokens or visitor inputs. The existing security-definer purge deletes only this project's events older than90 days and quota rows older than24 hours. It is a daily sweep, so deletion can lag the age threshold by up to the next successful run; scheduler failures can extend that lag. This is not a hard90-day deletion guarantee.

## Owner sequence

Keep ANALYTICS_ENABLED, ANALYTICS_MAINTENANCE_READY and ANALYTICS_PURGE_ENABLED false. No credentials are needed for this packet. Do not replay the previous storage migration.

1. Run the ENTIRE PR5.112_REHEARSE.sql in the postgres SQL Editor, without selecting only part of it. It creates extension/job inside BEGIN and ends ROLLBACK. It should return daily_purge_configured_in_transaction=true; the advisory-lock SELECT may also produce a blank result. This is a transaction rehearsal, not evidence that the background worker ran. If it errors, stop and return the exact error; explicitly ROLLBACK if the session reports an aborted transaction.
2. After a successful rehearsal, apply the ENTIRE 202610190002_discovery_daily_purge.sql once. It ends COMMIT. This creates the persistent extension and job; it is not idempotent and will refuse replay.
3. Run PR5.112_VERIFY.sql and the existing PR5.109_VERIFY.sql while analytics remain disabled. Return all results. The new8 checks cover configuration; the existing10 recheck storage grants/policies and public boundaries.
4. After the next11:17 Taipei, run PR5.112_RUN_STATUS.sql. A null last_run_status means no run evidence yet; only succeeded with a completed end timestamp supports successful scheduled execution. Also check expired rows remain0. No rows means the named job is missing. A failure needs investigation before activation. This read-only query intentionally omits commands/return messages/event payloads and other jobs. cron.log_run must remain enabled for this evidence; if no history appears, inspect scheduler configuration with a fresh privileged preflight.

Optional PR5.112_UNSCHEDULE.sql removes only the exact named/configured job, retaining shared extension and data. Do not run this as part of normal installation. Disabling collection does not itself disable retention; keep the purge scheduled when data exists. cron.job_run_details is scheduler metadata, outside event retention; no shared job-history deletion is introduced.

## Validation boundary

The local PostgreSQL-compatible engine cannot install pg_cron or run its background worker. Seven mock scheduler scenarios pass and exercise transaction rollback, fixed scheduling, collision refusal, scoped removal and baseline guards only; they do not establish Supabase extension availability, worker connectivity or scheduled execution. Owner rehearsal and actual run history remain required. Validation also passed the existing25 Node tests,11 isolated storage scenarios and pinned-input review. Application source and dependencies are unchanged; typecheck/build were not rerun for this SQL/document/test-only packet. No live DB changes, secret configuration, collection activation or experiment start performed by this packet. Producer delivery remains best-effort and enabled end-to-end cloud QA is still pending.

References: https://supabase.com/docs/guides/cron/install ; https://github.com/citusdata/pg_cron
