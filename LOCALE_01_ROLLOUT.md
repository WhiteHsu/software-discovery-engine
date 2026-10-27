# Traditional Chinese pilot / Issue #19

Prepared 2026-10-27, Asia/Taipei. Implementation is ready for owner review; production activation is pending.

## Scope

- `/zh-hant`: Traditional Chinese homepage (Next redirects `/zh-hant/` to this canonical path).
- Two comparison equivalents under `/zh-hant/escape/`: `offline-notion-alternatives` and `pdf-editors-without-a-subscription`.
- `/zh-hant/privacy`: noindex privacy explanation and translated browser preference controls.
- Shared live publication checks, eligible products, ranking, evidence links and verification dates. No translated product database, new ranking, new dependencies or Chinese AI search.
- Source article titles remain in their original language and are explicitly labeled. Product links remain English and are labeled as such.

## Translation maintenance

`lib/i18n/zh-hant-content.ts` maps exact reviewed English source text to Traditional Chinese. Current public comparison text was inspected on 2026-10-27. This is translation review, not a new product claim verification date.

If a route description, qualified product description or displayed claim changes without a corresponding translation, the Chinese comparison returns 404 and loses its sitemap entry and English alternate link. The English route remains available. New translations must be reviewed against the current source before restoring the Chinese page. Do not remove eligible products or rewrite live English evidence to satisfy the dictionary.

## Database prerequisite

The existing ingest RPC validates English paths both in application code and SQL. The additive migration updates only its path-validation body for the Chinese homepage and two exact comparison paths. It preserves the original JSON payload path, function owner/security configuration/ACLs, private tables, rate limits, query handling, retention and purge scheduler. No product or route data is changed. No user role gains direct table access.

Before deployment, the owner must run the read-only preflight, then the ROLLBACK rehearsal. The migration refuses unexpected function-body or access changes. If it refuses, stop and capture metadata; do not remove the guard.

Run the commit migration only after successful rehearsal. Applying SQL does not publish the web pages; the subsequent application deployment does.

## Verification completed in the isolated workspace

- Existing analytics/discovery regression suite: 94 passing tests.
- Localization contract/collector/translation/SEO tests: 7 passing tests.
- Existing Vercel policy tests: 4 passing tests.
- Isolated PostgreSQL function rehearsal: 6 checks, covering rollback, English/Chinese admission, access restrictions, unsupported paths, deduplication and recovery.
- Next HTTP integration: 9 checks against synthetic database fixtures, including server document language, forged-header overwrite, alternate links, live sitemap eligibility, unknown routes and stale-translation withholding.
- Typecheck, production build and lint: successful; lint retains three pre-existing unused-variable warnings.

Fixtures are synthetic integration data, not a production snapshot or proof of native product behavior. Production RPC admission, actual sitemap population, browser collection, opt-out and mobile navigation require owner acceptance after deployment. No production SQL, push, environment update or deployment was performed by the agent.

## Owner acceptance after deployment

1. Record the commit, Ready production deployment and exact activation time in #19.
2. Check all four Chinese URLs, English equivalents, and the language switcher on the canonical domain. The Chinese pages require the current live text to match the reviewed translations.
3. Verify server HTML `lang`, title/description, self-canonical and reciprocal `en` / `zh-Hant` annotations. Confirm the sitemap adds only the three indexable Chinese pages; privacy stays excluded.
4. Check a phone-width view. The comparison table should scroll within its wrapper without overflowing the document.
5. In a QA-marked browser, verify `/api/events/v2` accepts a Chinese page view and product exposure/click, then an English product view and outbound event. An HTTP 204 alone does not prove persistence: inspect the private aggregate receipts and payload paths via the owner SQL editor, without posting personal event data publicly.
6. Test Vercel collection using a documented unmarked QA visit, then browser Disable. Known QA sessions are intentionally excluded by Vercel. Preserve the QA annotation and verify no sensitive query/hash is sent.
7. Do not change existing analytics flags or enable HTTP purge. No new environment variable is needed.

## Reporting

Use `supabase/verification/LOCALE_01_METRICS.sql` for additive v2 activity segmentation after setting its boundaries. Null boundaries intentionally return no rows. Carry forward accepted QA exclusions and add new pilot QA identifiers before interpretation.

Existing site-wide reports remain site-wide; do not label their post-launch totals as English-only. Product detail pages remain English, and the supplemental report identifies those with an observed Chinese comparison origin within its window. Unresolved origins stay unresolved. Event counts are not exposure-matched CTR, unique visitors, conversions or sales.

Keep #13's original experiment window. Annotate localization activation, then review Chinese-page SEO after 14 and 28 days from activation, allowing reporting delays. Country is not a substitute for language. No reminder automation has been configured. Keep #19 open for production acceptance and the follow-up findings.

## Rollback

First redeploy the previous application commit. Leave the additive SQL path allowance in place unless database rollback is necessary. To restore the old RPC validation, run `LOCALE_01_ROLLBACK.sql` only after the application rollback. It refuses drift and keeps stored events. The purge function and scheduler are untouched.
