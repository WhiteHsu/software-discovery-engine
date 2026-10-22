# Analytics-01 — Issue #8 foundation (inactive)

Baseline: e38700a. Owner closed #6 and #7. This additive packet is the first implementation checkpoint for #8, not a completed analytics deployment.

## Included

- `lib/analytics/events-v2.ts`: nine requested canonical event names, strict fields and enums, anonymous UUIDs, page/surface validation, search attempt/result-set IDs, parsed intent, bounded optional redacted diagnostic text, anchor/constraint context, position/exposure identifiers, hostname-only referrer and bounded source classification, and discovery-origin attribution on product pages.
- `lib/analytics/metrics-v2.ts`: read-compatible v1 normalization, ID-conflict detection before QA exclusion, separate Search/Escape/Hidden Gems CTR, temporal matching, per-exposure deduplication, null denominators, unmatched actions, product-page outbound CTR and search outcome counts.
- Eight contract/metrics test groups and four isolated PostgreSQL storage checks.
- `supabase/data/ANALYTICS_V2_REHEARSE.sql`: rollback-only storage design rehearsal. It creates a private candidate table, checks forced RLS and denied direct access, then rolls back. It does not install an ingest RPC or grant service writes. It is not an apply migration.

No existing files are replaced. No producer, collector, environment variable, retention function, scheduled purge, production table or public page is changed by this packet. No analytics text is sent or stored. Do not turn on producers for this packet.

## Owner installation

Copy `files/` into the repository root. Run:

```powershell
node --test scripts/analytics-v2.test.mjs scripts/discovery-events.test.mjs scripts/discovery-ingestion.test.mjs scripts/hidden-gems-events.test.mjs scripts/analytics-qa-exclusions.test.mjs
npm run typecheck
npm run build
```

If these pass, stage only the six files listed in MANIFEST.json. A suitable commit is `feat(analytics): add inactive v2 event and CTR foundation #8`.

Do not run the SQL against production now. The isolated author test used the existing local PGlite runtime with `ANALYTICS_PG_TEST_MODULE` pointing at its ESM entry. No new dependency is needed to run the ordinary Node contract tests. The storage script creates an isolated in-memory schema, never connects to Supabase, and closes it after testing. A full replay against the live-schema baseline belongs to the subsequent migration packet.

## CTR definition

Numerator: unique clicked exposures with an impression timestamp at or before the click. Denominator: unique qualified impressions. Search matching includes session, page-view, search ID, result-set ID, product, exposure ID and position. Escape matching includes route, and Hidden Gems stays a separate surface. Repeated clicks do not increase the numerator. A pre-exposure click is unmatched even if an impression arrives later with a later occurrence timestamp. No denominator means `null`, not zero. Transport order does not affect temporal matching.

The future producer must emit qualified visibility, not mere rendering. These modules do not claim that browser-provided events prove human behavior. The future collector must validate publication, result receipts and limits before storage.

## Query handling limits

`query` is optional and restricted to search attempts, maximum 500 characters. A helper redacts common email, URL and phone-like patterns; this is not anonymization and cannot guarantee removal of all personal information. Raw queries must not enter URLs, logs or standard CTR exports. Collector-side redaction, private diagnostic access and deletion/retention coverage remain required before collection. Query logging must never become a condition of normal search use. No claims of anonymous free text are made.

## Remaining work before Issue #8 acceptance

1. Final additive migration/RPC, service-only access, durable admission/idempotency, result receipt validation, purge coverage and full baseline rehearsal.
2. Shared anonymous browser identity and page/filter lifecycle producers.
3. Search attempt, interpreted outcome, visible result set, qualified card impression/click and product-origin outbound instrumentation.
4. Referrer/source emission and stored-event reporting/export, including QA exclusions for new acceptance sessions.
5. Controlled owner QA and activation with DNT/GPC respected. Existing analytics flags remain unchanged until that step.

Do not close #8 or start the formal validation experiment based on this foundation packet.
