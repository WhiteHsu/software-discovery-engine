# PR5.109 — Private discovery analytics storage review

Baseline86dc09f / Production126. Owner returned PR5.108 privileged metadata snapshot captured2026-10-19T01:51:55.42063+00:00. Planned analytics names are absent; no related columns/policies/functions/default ACLs. anon/authenticated have schema usage but not create; service_role bypasses RLS but lacks schema usage. Public24 products/10 approved routes and private evidence boundary preserved. Frozen receipt stored under seed/research/analytics-storage-baseline-2026-10-19.json. This is owner-returned evidence, not a fresh assistant database query.

## Concrete change

Only software_discovery gets two private RLS tables (discovery_events and discovery_event_limits), an indexed server receive timestamp, and two fixed-search-path definer RPCs. service_role gets schema USAGE and EXECUTE on these two RPCs, but no direct event/quota table SELECT/INSERT/UPDATE/DELETE. PUBLIC/anon/authenticated cannot execute analytics RPCs or read/write their tables. No permissive event policies are created. Existing graph data/grants, publication and other schemas remain unchanged. Schema USAGE is required for this server-only path and is an explicit delta from the snapshot; it is not CREATE permission. The schema owner postgres executes the migration and owns definer functions.

The private ingest RPC accepts bounded JSON batches, checks event fields/UUIDs/UTC time window/public product and approved route membership, rejects extra/raw fields, stores server received_at, deduplicates matching event IDs and rejects conflicting ID reuse. Both quota reservation and all event inserts are atomic. Fixed minute admission budgets:120 submitted events per opaque server key and1000 globally, including retries. Boundary bursts can span adjacent minutes; these are admission caps, not complete bot prevention, request-rate control or a billing guarantee. Browser-accessible RPC execution is denied. Collector must additionally apply HTTP size/origin/request controls before any expensive work.

The database validates public route membership, not runtime candidate qualification or displayed rank. The future collector must call prepareEventBatch with trusted currently qualified route/product/position context before this service-only RPC. Client credentials, publication context, rank and rate key must never be accepted as authority from browser JSON. Rate key is a64-hex server HMAC derived from a trusted network identifier with date-scoped salt/secret; no raw IP/agent/query is stored by this schema. Such a pseudonymous key can correlate requests during its validity; it is not proof of anonymous people. No secret is read or requested now. No collection is enabled.

## Retention and activation gate

purge_discovery_events removes event rows older than90 days and quota rows older than24 hours. It is callable only by the schema owner/service role. This migration does not schedule it: data does not expire automatically just because a function exists. A daily privileged purge job, monitored failure handling, server-only credentials and the HTTP collector/producers must be configured and verified before activating visitor collection. These maintenance tasks remain pending; the experiment has not started. No automatic task or service connection is created in this packet.

## Owner sequence

1. Apply files; run node scripts/review-analytics-storage.mjs. It checks the returned metadata and normalized SQL pins locally, with no remote calls.
2. Now run only supabase/data/PR5.109_REHEARSE.sql as postgres in the existing SQL Editor. It runs the complete migration in a transaction and ends ROLLBACK. Expected Success / no rows returned. Confirm no errors and return the result. It leaves tables, functions and the new service schema privilege absent.
3. After successful rehearsal, supabase/migrations/202610190001_private_discovery_events.sql is the separate persistent storage migration. Do not run it in this first step. No user-facing data collection starts even after it is applied because there is no endpoint/producer.
4. After persistent apply, run supabase/verification/PR5.109_VERIFY.sql. All10 checks must be true. The empty-storage check is intentionally for this pre-producer stage. Do not replay after apply: guards reject name/privilege collisions. If current state differs, obtain fresh metadata instead of weakening the guard.

## Validation

Nine isolated PGlite/PostgreSQL-compatible scenario groups passed using synthetic schema/product fixtures: rollback reverses schema grants and objects; apply passes all10 shipped checks; anon RPC/service direct-read denial; service insert/retry/conflict atomicity; malformed/stale/nonpublic cases; all4 event names; durable quota rollback; retention cutoff deletion; repeated migration rejection. This is SQL execution in an isolated compatible engine, not Supabase cloud or proxy integration. Test source included at scripts/analytics-storage.pgtest.mjs; it requires optional @electric-sql/pglite in a separate test environment (or ANALYTICS_PG_TEST_MODULE pointing to that module). No new production dependency or npm install is required. Local SQL-pin review passed. Existing TypeScript/app unchanged, no build or UI test required. next-env.d.ts excluded.

Remaining work after owner migration verification: implement HTTP collector, configure server-only access and daily purge, then browser visible exposure/product-view/click/outbound producers with durable event verification. Do not claim analytics health or start Day0 from schema deployment alone.
