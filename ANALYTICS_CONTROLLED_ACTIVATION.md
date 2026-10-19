
# PR5.113 — Collector-only production QA, browser producers remain OFF

Maintenance acceptance: owner PR5.112A configuration8/8 and PR5.109 storage10/10 true; fixed job active with succeeded run2026-10-19 03:17:00.115032+00 to03:17:00.11705+00 (Taipei11:17), expired event/quota rows0. The job therefore existed by11:17; we do not claim recovery created it later or attribute installation to rollback. This is owner-supplied evidence, frozen in analytics-maintenance-acceptance-2026-10-19.json. No future-run guarantee inferred.

## Separate gates

Previously collector readiness also enabled browser producers. New server-only ANALYTICS_PRODUCER_ENABLED must independently equal true; missing/false leaves producer OFF even when collector is ready. Existing collector/maintenance/config/trusted-production requirements and browser DNT/GPC checks remain mandatory. No secrets enter client props; pages still receive only a boolean. No frontend visual changes or database migration. The database's daily job continues independently; the HTTP purge endpoint is unnecessary for this job and stays disabled.

## A. Deploy code with collection OFF

Copy files, run README validation and commit/push. Keep ANALYTICS_ENABLED=false, ANALYTICS_PRODUCER_ENABLED=false and ANALYTICS_PURGE_ENABLED=false. Wait for the Production deployment containing this new gate to be ready. Confirm its commit. Open canonical route/product pages normally: navigation works and Network/api/events shows no automatic POSTs. Never enable the collector on an older deployment that lacks the independent producer gate.

## B. Owner-configured collector-only test

In the Vercel settings for THIS Software Discovery Engine project, set the following for Production only. Preview/Development stay disabled. Do not modify another project's variables. This packet does not inspect, generate or install credentials remotely.

| Variable | Collector-only QA value |
| --- | --- |
| ANALYTICS_ENABLED | true |
| ANALYTICS_MAINTENANCE_READY | true (accepted daily job) |
| ANALYTICS_PRODUCER_ENABLED | false |
| ANALYTICS_PURGE_ENABLED | false |
| NEXT_PUBLIC_SITE_URL | https://software-discovery-engine.vercel.app |
| SUPABASE_SERVICE_ROLE_KEY | Existing privileged service_role credential for the same Supabase project as NEXT_PUBLIC_SUPABASE_URL; server-only Secret |
| ANALYTICS_RATE_SECRET | New32 random bytes encoded as64 lowercase hex characters; server-only Secret |

Use the existing project's credential in the provider dashboard, copy it directly into the server-only Vercel Secret value; do not paste credentials into chat, source files or NEXT_PUBLIC_ variables. Ensure the existing public Supabase URL/publishable key still point to this same project. This does not require changing DB grants or creating another service account. No ANALYTICS_MAINTENANCE_SECRET is needed while HTTP purge remains false.

If a rate secret is not already configured, the following owner-run PowerShell copies a new value directly to your local clipboard without printing it. Do not run this inside this chat's tools or send its value back. Paste only into Vercel's ANALYTICS_RATE_SECRET Secret field:

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))" | Set-Clipboard
```

Redeploy Production after environment edits; Vercel environment changes only apply to new deployments. Use https://software-discovery-engine.vercel.app for tests, not a preview deployment URL. Keep the producer flag false throughout this packet. Vercel reference: https://vercel.com/docs/environment-variables

## C. One synthetic collector persistence probe

After the new deployment with collector-only settings is ready, run exactly once from your repository:

```powershell
node scripts/analytics-live-probe.mjs --send
```

This explicit command sends4 public HTTP requests to the hardcoded canonical /api/events endpoint, with no service key or other secrets. It sends a synthetic product_view for the published vale-local-passive-3-24-0 product, repeats the exact same ID/payload, then sends a distinct GPC-suppressed event and an invalid extra-field event. Expected HTTP results in order: accepted204, duplicate204, privacy204, invalid400. It supplies Origin/same-origin headers to test the collector's transport contract; it is a Node QA harness, not proof of browser behavior, a human visit or spoof-proof provenance. Do not manually supply platform IP headers. Server platform-IP admission and service RPC still run normally.

Running without --send sends nothing. Every explicit invocation allocates new synthetic UUIDs and creates a uniquely named receipt plus SELECT-only SQL in ignored .seed-output/. No automatic retries. An unexpected HTTP response/timeout stops the remaining sequence; persistence may be ambiguous, so inspect the receipt and generated SQL before another invocation. Do not use looped probes. Firewall/protection/404/503 failures must be diagnosed from status/config, not by weakening origin, IP, RLS or service-only RPC boundaries. Response bodies, raw IP and secrets are not logged.

The receipt prints a synthetic sessionId. Keep the receipt as a QA exclusion ledger and return it with the generated SQL results (it contains no credentials). Exclude this session/event from future demand metrics. No QA flags/prose are inserted into accepted event payloads, and no synthetic metric is presented as demand. Generated .seed-output files are ignored and should not be committed automatically. Do not delete the QA row manually; normal retention applies unless a separately reviewed cleanup is needed. One accepted row should persist, with the duplicate ID deduplicated. Quota counters can change for admitted probes.

Open the exact generated .seed-output/analytics-live-probe-<UUID>.sql, copy the entire SELECT to the postgres Supabase SQL Editor, and run. Expected3 true: synthetic_probe_stored_once, privacy_probe_not_stored, invalid_probe_not_stored. Verify all4 expected HTTP results AND all3 SQL checks, not only204. SQL returns aggregate presence checks for just the generated IDs; no payloads or other application records are returned.

Because this intentionally writes one QA event, old empty_before_activation checks will no longer pass; do not misinterpret that as a permission regression or reset data to restore those checks. Published24/10 and private grants/policies must remain unchanged. Daily purge continues; existing PR5.112_RUN_STATUS.sql remains the read-only maintenance check. No old migration/recovery script replay after probe data exists.

## D. Report and stop before browser activation

Return the Production commit confirmation, the4 HTTP statuses, generated receipt/3 SQL results, and normal route/product browsing observation with producer false (no automatic api/events requests). Never return secret values, full environment dumps or unredacted provider-key screenshots. Browser producer enabled QA (exposure timing/click/outbound/DNT/GPC/transport and actual stored event matching) remains a later step. Experiment Day0 has not started; search/SEO/product-count/Hidden Gems requirements remain separate.

If collector QA fails or you need to stop receiving events, set ANALYTICS_ENABLED=false and ANALYTICS_PRODUCER_ENABLED=false and redeploy. Keep the daily DB purge active. A rollback to an older app build that lacks the producer gate must never retain ANALYTICS_ENABLED=true. This workflow changes only the owner-approved Software Discovery Engine environment, not shared DB jobs or other applications.

## Author validation

27 Node tests pass (including2 independent gate scenarios), TypeScript, targeted ESLint, webpack production build and live-probe no-send/syntax checks pass. The live --send branch has not been executed against Production by the author; cloud persistence and browser disabled-state observation remain owner QA. No environment credentials accessed. No database changes in this packet.
