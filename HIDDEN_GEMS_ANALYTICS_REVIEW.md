# PR5.117 — Hidden Gems measurement proposal

Baseline: 8af755be118b2eaa00d2c804c29fbbe3d48f8757. Owner preflight at 2026-10-19T09:28:44.420444+00:00: nine checks true, postgres executor, 24 published products and 10 approved published routes. Ingest definition MD5 109b824edeaba7ce1c8b8653346d53bc; unchanged purge MD5 853671b9a4d6484b164b337685297f2e.

## Event meaning

- Existing version-1 names product_impression/product_click gain a distinct surface hidden_gems and exact path /hidden-gems. routeSlug is prohibited; exposureId and current displayed position 1–3 are mandatory. Existing escape/product events remain valid.
- An impression needs the product-name link at least 50% visible continuously for one second while the document is visible. Explore CTA visibility alone does not count. Title and Explore product links emit product_click using the same page/placement exposure identity. Comparison, source and navigation links do not count as product clicks. Left click, keyboard activation and middle click use existing delegated handlers, without delaying navigation.
- Current server-qualified cards determine product identity and compact displayed position, including partial collections. The collector reuses getHiddenGems, which rechecks accepted source route publication, claim qualification and publishability. An arbitrary published product or stale position is insufficient. SQL additionally restricts the three configured identities and their public source-route memberships. SQL alone does not reimplement evidence ranking or verify runtime position; only the service collector is authorized to call it.
- discoveryMetrics keeps existing comparison CTR escape-only and adds hiddenGems {productImpressions, clickedExposures, productCtr, unmatchedClicks}. Placement keys include surface. Known QA exclusions, UUID deduplication and conflicting-ID rejection apply first. Clicks before qualifying exposure remain unmatched; null denominator stays null. Product-page outbound metrics do not establish Hidden Gems journey attribution.

## Deployment and storage

Browser production remains gated by ANALYTICS_PRODUCER_ENABLED plus existing collector readiness and privacy signals. This packet changes no environment variables. Missing/false producer gate returns before identities, storage, observers, timers or network. Existing DNT/GPC handling, bounded queue, privacy and transport behavior are retained.

Migration replaces only ingest_discovery_events with the same signature and ownership/ACL. It refuses any captured ingest/purge fingerprint or privilege/public-count drift and repeated apply. It does not delete QA events, recreate tables, change grants, replace purge, touch pg_cron or modify shared schemas. Existing quotas/deduplication/retention behavior remains. Rehearsal replaces and verifies inside a transaction then rolls back; apply commits; verification checks exact function body plus ten other boundaries. Pause writes with the existing false producer gate during owner execution.

## Validation and limits

Author validation: 49 Node tests (44 existing + 5 editorial contract/receiver/metrics scenarios), TypeScript, targeted ESLint, production webpack build; seven synthetic PGlite scenario groups cover rehearsal rollback, exact body/security verification, event preservation, service admission/retry, rejection/atomicity, permissions, repeated apply and drift refusal. PGlite fixtures are synthetic and do not verify the cloud deployment or actual browser observer behavior.

Owner SQL rehearsal/apply/verification and enabled browser QA remain pending. No live event POST was sent by the author. Browser negative DNT/GPC, quick-click/visibility cases and middle-click/mobile enabled capture remain pending. Activation is a separate controlled step after SQL and disabled-production checks, with new QA IDs recorded for exclusion before demand reporting. Experiment has not started; product count remains 24.

PR5.116 owner UI acceptance: 36 sitemap URLs, hidden-gems once; three product and three comparison destinations; source links; keyboard focus and disclosure; mobile layout/operation; canonical production index/follow; branch and deployment alias noindex/nofollow with production canonical. The deployment alias was software-discovery-engine-6exi7qwgo-whitehsus-projects.vercel.app. This does not establish search-engine indexation or validate a future deployment alias.

Older source-hash review scripts pin historical versions. Use review-hidden-gems-analytics.mjs for this packet; do not rewrite old historical pins to hide drift.
