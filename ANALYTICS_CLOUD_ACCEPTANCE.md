
# PR5.114 — Recorded cloud QA and default metric exclusions

Baseline b6bd041edb58fe7c41b1fd4a251315c5c62cfb6b, owner checkout clean. The owner configured server-only Production secrets and redeployed; no secret values were provided to or read by this packet. Collector-only probe returned204/204/204/400 and3 SQL checks true. With producer enabled, the tested Offline Notion Alternatives → AFFiNE → official site journey returned4 requests204 and6 owner SQL checks true. This confirms measured event presence and linkage for that session; it does not establish exact counts, all visibility timing or all browser/device/privacy behavior.

The owner then set ANALYTICS_PRODUCER_ENABLED=false and supplied the Ready/Production/Current rollback deployment screenshot. We accept the configuration/deployment evidence, not a fresh network check after rollback. Collector remains enabled, HTTP purge disabled; daily database purge stays active. Experiment has not started. Frozen evidence is seed/research/analytics-cloud-acceptance-2026-10-19.json; previous daily-maintenance acceptance remains unchanged.

## QA exclusion implemented

Earlier messages described sessions as QA in conversation; no database tagging or cleanup had been applied. This packet now records the known identifiers in the repository and enforces exclusions in discoveryMetrics. It excludes the entire synthetic probe session and browser QA session, plus the accepted synthetic event ID as a fallback. UUID matching is case-insensitive. Payload validation and conflicting event-ID rejection still run before exclusions. excludedQaEvents reports unique validated event IDs removed after deduplication; duplicateEvents remains the existing diagnostic across all validated input, including QA retries. Ordinary sessions retain the original attribution/deduplication/zero-denominator behavior.

Only these explicit known IDs are excluded. Other sessions during the brief production test window are not automatically identified as QA or demand. There is no approved Day0/window yet, so no pre-launch data should be used as experiment results. Future reports must apply the approved experiment start/end and known QA ledger together. Excluding two known sessions alone is insufficient to define an experiment cohort.

This changes the metrics helper, not stored JSON, ingestion, RLS, scheduled cleanup, browser identity or request behavior. Raw QA rows remain private under normal retention. Direct SQL or a future dashboard bypassing discoveryMetrics must explicitly use the ledger; this is not a database-wide view/policy. No new public API/table/grant or migration is introduced. Do not replay migrations or empty-table preflight checks to make the intentional QA row disappear. No synthetic100% CTR is reported as demand.

## Owner steps

Copy files, run README checks and push. Keep ANALYTICS_PRODUCER_ENABLED=false and ANALYTICS_PURGE_ENABLED=false; existing collector/maintenance settings stay unchanged. No new secrets or SQL required and no need to repeat the accepted positive journey or live probe.

Close all previously loaded test tabs/windows so an old mounted tracker with enabled props cannot keep sending. In a fresh browser context after the disabled deployment, use Network/api/events + Keep log, browse a comparison, expose a product name for2seconds and open its product page for3seconds. No automatic events expected. This checks disable/redeploy behavior; screenshots with no traffic do not alone prove DNT/GPC behavior.

Browser-level DNT/GPC negative QA while enabled, enabled mobile/keyboard/auxclick, visibility interruption and network-loss behavior are still pending. HTTP GPC suppression was tested by the synthetic probe; local timing/transport tests were passed, but neither substitutes for those browser cases. Plan those separately rather than leaving production producers on while other features are developed.

## Launch gate

PRODUCT_SPEC.md and VALIDATION_PLAN.md remain frozen. The last accepted publication count is24 products/10 routes, below the specified30–40-product content range. Natural-language intent parsing/search, Hidden Gems, additional required instrumentation and SEO sitemap/robots coverage still need implementation/verification. The current app route inventory has no search/Hidden Gems endpoints and no sitemap/robots source files; this is repository evidence, not an external SEO/indexation audit. Existing product/route metadata is not being declared absent. No Issue11 completion, launch readiness or experiment start is inferred from the analytics journey.

Next substantive development should address the remaining launch surfaces and instrumentation with bounded DB-backed results, preserving reviewed claim scopes. This packet closes the known-QA accounting gap first; it does not authorize publishing more unreviewed products or starting acquisition.

## Author validation

31 Node tests pass, including4 meaningful exclusion scenarios covering QA-only zero denominators, mixed ordinary/QA traffic, cross-session attribution isolation, accepted-event fallback, UUID case, validation and conflicting IDs. TypeScript, targeted ESLint and webpack production build pass. No remote events or production database commands sent by the author. Application build was checked with the existing dependency set in an isolated copy.
