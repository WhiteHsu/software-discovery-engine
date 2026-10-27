# Traditional Chinese comparisons — #20 Phase 1

Prepared against owner commit `bbec248` on 2026-10-27. This batch expands comparison coverage from two to ten approved routes. It does not complete #20: product details, Hidden Gems, and discovery/search localization remain later phases.

## Content and publication

All translations use public English comparison text captured on 2026-10-27. Product evidence, verification dates, eligibility, publication decisions and editorial order remain shared and unchanged. All 30 currently published products occur among the ten public comparisons; there are 36 route placements. Source titles and official product names retain their original language. The existing exact-source translation gate withholds pages with missing or changed translated copy rather than silently publishing English fallback text or dropping candidates.

The privacy comparison preserves fixed-version local-operation limitations. It does not render the privacy constraint as an unrestricted Yes. Chinese product links still lead to English product details and explicitly say so. Chinese search is still unavailable in this phase.

## Database before deployment

Owner executes `LOCALE_03_PREFLIGHT.sql` read-only. Expected body fingerprint is `80a3434e327b18648f0f6b19c06fc238`, owner postgres, security definer true, search_path=pg_catalog.

Then execute `LOCALE_03_REHEARSE.sql` (ends in ROLLBACK), repeat preflight to confirm unchanged fingerprint, execute migration `202610270002_zh_hant_comparison_paths.sql` (ends in COMMIT), and execute `LOCALE_03_VERIFY.sql`. All verification fields must be true. A guard failure requires fresh inspection; do not edit the expected fingerprint to bypass it.

Only the exact Chinese comparison-path allowlist changes. Existing English paths, ingestion limits, publication validation, role grants, RLS, data retention and purge scheduling remain unchanged. No events are inserted by these migration scripts.

## Application rollout

Apply packet files, run checks, review diff, then owner commits and pushes. No new environment variable, dependency update, or manual extra deployment is needed beyond the normal production deployment. Record its actual Ready time. Do not reapply the old Locale-01/02 packets after this batch.

Validate ten home cards, Chinese/English comparison switching without reload and with browser back/forward, and mobile layout. Confirm self-canonical URLs, reciprocal hreflang, and sitemap entries for translated pages. With the current complete published catalog, expected sitemap count is 53: existing 42 English URLs plus Chinese home and ten comparisons. Privacy pages remain noindex and outside the sitemap. Live eligibility/translation drift can legitimately reduce the count.

For a newly translated route, verify stored page_viewed, escape_route_viewed, product_impression, product_clicked, product page_viewed, and outbound_clicked; product and outbound events should join back to the original Chinese page view in the same session. HTTP 204 alone does not prove persistence. Record and exclude the acceptance session from performance reports.

## QA and observation

Known pilot acceptance session: `c59194d0-2f93-4e79-b489-e001273abc29` (2026-10-27 06:24–06:50 UTC observed). This batch excludes it from future supplementary Vercel collection and from `LOCALE_03_METRICS.sql`; it does not retroactively erase previously collected Vercel views or update separately saved SQL reports. Add the same exclusion to any independently maintained performance report before interpreting it. No analytics records are deleted.

Metrics template bounds are deliberately NULL until actual rollout and review timestamps are supplied. Counts are events, not visitors, conversion rates, sales, or proof of search demand. English product pages with a matching Chinese origin are a separate segment. Missing origin evidence stays unresolved.

Keep #19 for the original pilot observation. Record this batch separately in #20 and preserve #13's original validation window. Review each release cohort 14 and 28 days after its actual production release; SEO impact and indexing remain unverified until observed.

## Recovery

Owner restores the previous application deployment first, then, only if required, runs `LOCALE_03_ROLLBACK.sql`. It restores the two-route pilot ingestion definition and retains stored events. Recovery is not a routine rollout step.

## Validation performed in isolation

- 17 localization/navigation/analytics unit and contract checks passed.
- Existing analytics regression suite: 94 passed.
- PGlite: 7 database checks passed, including ten exact paths, retry deduplication, rehearsal/rollback, drift guard, private tables and restricted execution.
- Real Next routes with synthetic public-text fixtures: 17 integration checks passed, including all ten route renders, equal English/Chinese placement ordering, reciprocal metadata, sitemap, privacy exclusions and stale-source withholding.
- Type checking and production build passed; lint has zero errors and the same three pre-existing unused-variable warnings.
- Browser desktop spot checks: Chinese home cards, bounded privacy comparison, and English/Chinese client navigation passed. Mobile and real-database acceptance must be verified after owner deployment.

The fixture confidence, sources and mocked database are test inputs, not additional product verification evidence.
