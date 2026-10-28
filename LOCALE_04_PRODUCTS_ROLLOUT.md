# Locale-04: Traditional Chinese product details — #20 Phase 2

Adds reviewed Traditional Chinese display copies for the 30 currently published products. English product evidence, publication eligibility, editorial order, values, source links/titles and verification dates remain shared. New or changed untranslated content withholds its Chinese equivalent rather than displaying stale claims. Product brand names and source titles remain original.

Coverage: /zh-hant/software/[slug], bidirectional language navigation, Chinese comparison-to-product links, localized metadata and structured data, reciprocal hreflang, sitemap and v2 product/outbound collection. When all current products remain eligible, the sitemap contains 83 URLs. Discover/search and Hidden Gems localization remain Phase 3; do not close #20 yet.

Validation in an isolated fixture environment (no owner environment files, real keys or production writes):
- 24 focused tests; 94 existing regression tests; TypeScript passed.
- Production fixture build and 48 Next integration checks passed, including all 30 Chinese product pages, comparisons, sitemap and stale-translation withdrawal.
- Seven isolated PostgreSQL checks passed, including all 30 paths, deduplication, permissions, rehearsal and rollback.
- Changed files lint clean. The owner repository's three existing unused-variable warnings are unrelated.

Database rollout is required BEFORE deploying the app changes. Expected existing function body MD5: ee89334bdb1a15291a9540de1f5abab9. New body MD5: 4767e2978249d0b262257ee6c62b080c. The migration only extends validated product paths/context and preserves private storage/access. It does not change publications, purge schedules, old events or the experiment clock.

Owner production acceptance after deploy: open a Chinese comparison, click a Chinese product detail and its official-site link. Verify new requests return 204 AND stored rows contain Chinese product path plus the original Chinese comparison linked_origin_path. Record the QA session and exclude it in analysis. Existing historical rejected rows are not repaired.

Translation readiness is checked against the shared live content; if source wording changes, a reviewed translation update is required. This release adds catalog reads to language-navigation readiness checks, cached within each request and processed in batches of six. Assess production response time after deployment.
