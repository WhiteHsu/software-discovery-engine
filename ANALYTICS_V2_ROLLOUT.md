# Analytics-02 — Issue #8 collection and storage rollout

Baseline: 28e126b / Production 145. Owner verified Analytics-01's 28 tests, typecheck and build. This packet implements collection and storage integration; production data acceptance is still outstanding. Do not close #8.

## What changes

- Canonical v2 events for page views, search attempts, visible interpreted outcomes, Escape Route views, qualified product impressions/clicks, product outbound clicks, and deliberate anchor/constraint selections.
- Shared sessionStorage anonymous UUID, per-page identity and per-search/result-set identity. No login, cross-device identity, fingerprint or identifying profile is needed.
- Page/filter tracking on client navigation; search request/result races and unmounts retain existing cancellation behavior.
- A result outcome counts as viewed after its interpreted-needs marker is at least 50% visible for one continuous second in a visible document. Product impressions use the same threshold for product-title links. Rendering cards is not an impression. Missing IntersectionObserver yields no fabricated impression.
- Search results are signed on the server with a 30-minute receipt bound to session, page, path, search, result set, parsed intent, outcome and actual ordered products. Collector validation rejects a changed product, rank, intent, result count, session or result set. No model rerun is used to validate telemetry.
- Current public publication/placement checks remain required for accepted product events; signed snapshots do not permit draft/deleted products.
- Search/Escape/Hidden Gems origin metadata is carried to product-page actions using bounded sessionStorage. It is contextual attribution, not proof of a prior impression. Expired or missing receipts can cause attributed events to be rejected rather than fabricate attribution.
- Hostname-only referrer and direct/internal/external source classification. No full referrer URL or arbitrary campaign/free-text field is accepted.
- Legacy visitor producers are suppressed when v2 is selected. No dual write or historical backfill is performed.
- `/api/events/v2` is independently default-off, same-origin, production-only, bounded to 20 events/32 KiB per request, with transient and durable limits, generic errors and no-store/noindex responses. DNT/GPC disables producer and collector handling.

## Query privacy and retention

Search queries go to OpenAI as before. When v2 visitor collection is enabled, a search attempt also emits bounded diagnostic query text. Common URLs, email addresses and phone-like sequences are redacted in both browser and collector. This is best-effort redaction, not guaranteed anonymization; names or other sensitive text can remain. The input notice advises against personal/confidential information.

Query text is removed from ordinary event JSON and stored only in `discovery_queries_v2`, with service-only RPC write access and no direct SELECT grant to browser or service roles. Standard metrics do not include it. Diagnostic expiry is seven days after receipt, deletion at the next existing daily purge (therefore seven days plus scheduling delay). Ordinary event retention remains 90 days plus purge delay. Do not enable collection until the purge extension is installed and verified.

## First owner step: install and deploy with tracking OFF

Copy `files/` into the repository, then run:

```powershell
node scripts/check-analytics-v2.mjs
npm run typecheck
npm run build
```

Expected: 94 selected regression tests pass; typecheck/build pass. The broad wildcard test command also includes old editorial workflow tests requiring generated `.seed-output` fixtures; those fixtures are not part of this delivery. Use the explicit runner above. Author also ran eight isolated PGlite storage integration checks and targeted ESLint successfully.

Do not change Vercel variables yet. `ANALYTICS_PRODUCER_ENABLED` remains false; absent/false `ANALYTICS_V2_ENABLED` keeps the new collector off. The new `.env.example` contains placeholders only and must never replace `.env.local` or Production variables.

After successful checks, stage only MANIFEST-listed files, inspect `git diff --cached --check` and `git diff --cached --stat`, commit `feat(analytics): wire v2 discovery collection and private storage #8`, push and wait for Ready. An off-by-default deployment does not require production SQL first.

## Database order: preflight, rollback rehearsal, reviewed apply

1. In the existing project's SQL editor, run `supabase/data/ANALYTICS_V2_PREFLIGHT.sql`. This is read-only. Expected: postgres owner, 24 published products, 10 approved routes, expected purge body fingerprint, no v2 tables/RPC, service schema usage, and existing active daily 03:17 UTC purge job.
2. Share that metadata result for review. Do not weaken a failed guard or run old historical migrations.
3. After metadata review, run `supabase/data/ANALYTICS_V2_STORAGE_REHEARSE.sql`. It creates the new objects and extends purge only inside a transaction, then ROLLBACK. Re-run preflight: no v2 objects and original purge fingerprint must remain. It does not call cron.schedule or touch the cron job.
4. Only after rehearsal acceptance, apply `supabase/migrations/202610220001_discovery_events_v2.sql` once. It commits new private tables and service-only ingest RPC and extends the existing purge function. It requires an exact normalized original function-body fingerprint, postgres ownership, SECURITY DEFINER, pg_catalog search path and the captured publication baseline. Repeated install fails closed.

The earlier `ANALYTICS_V2_REHEARSE.sql` from Analytics-01 is a design-only rehearsal and is NOT this rollout's rehearsal or apply script.

## Later activation (do not perform during first deployment)

- Add a new independent `ANALYTICS_CONTEXT_SECRET`: 32 random bytes encoded as 64 lowercase hexadecimal characters, server-only. Do not reuse an existing secret or paste it into chat/Git.
- `ANALYTICS_V2_ENABLED=true` selects the v2 collector and signing. With producers still false, normal browsers do not emit events.
- `ANALYTICS_PRODUCER_ENABLED=true` later enables visitor emission; the earlier collector/maintenance gates must also be ready. This is a separate controlled owner action after migration/rehearsal acceptance.
- Do not alter `ANALYTICS_PURGE_ENABLED`, the existing cron job, OpenAI settings, search flag or service keys during this rollout.
- For emergency measurement rollback, set producer false and redeploy. Do not drop tables, restore an older purge function or replay the migration as a rollback.

## Acceptance remaining after deployment/migration

Capture isolated QA sessions before declaring visitor metrics ready. Check homepage page/filter actions, search attempt/query/intent, success/no-results/clarify outcomes, continuous visibility interrupted by hiding/scrolling, unexposed clicks, repeated search reordering, keyboard/middle-click, internal product navigation and official outbound actions, source separation, DNT/GPC, no-login behavior and database rows. Add accepted new QA session IDs to the existing exclusion ledger before visitor reporting.

The implementation records parsed intent on the visible outcome event, linked to the attempt by search ID. Attempts that fail or are abandoned before a visible outcome remain attempts without an interpreted-outcome event; do not label them zero-result searches. Beacon/fetch is nonblocking best-effort transport, with no promise of complete delivery. Clock skew, receipt expiry, current publication changes, admission limits and blockers can also omit events; unmatched clicks and null denominators must remain visible diagnostics.

`supabase/data/ANALYTICS_V2_METRICS.sql` is a read-only owner report for the last seven days by receipt time. It combines v1/v2 canonical product actions, excludes the accepted QA ledger at packaging time, and returns separate Search/Escape/Hidden Gems exposure CTR and unmatched clicks. `ANALYTICS_V2_OUTBOUND_METRICS.sql` reports product-page outbound CTR by discovery origin, with missing origin explicitly unattributed. `metricsV2` additionally provides page counts and visible search outcomes for authorized event exports. Reports must cover the intended observation window; boundary clicks may be unmatched. No public reporting endpoint is added.

This rollout is not the start of the formal validation experiment and does not close #9, #10 or #11.
